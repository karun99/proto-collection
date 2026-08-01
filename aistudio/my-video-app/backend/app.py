"""AI Studio backend — FastAPI server driving OpenMontage pipelines."""

from __future__ import annotations

import json
import os
import sys
import threading
import traceback
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / "openmontage"))
os.environ.setdefault("OPENMONTAGE_PROJECTS_DIR", str(HERE / "projects"))

BACKEND_ENV = HERE / ".env"
OPENMONTAGE_ENV = HERE / "openmontage" / ".env"
for env_path in (BACKEND_ENV, OPENMONTAGE_ENV):
    if env_path.is_file():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            if value[:1] in ("'", '"') and value[-1:] == value[:1]:
                value = value[1:-1]
            if key and key not in os.environ:
                os.environ[key] = value

import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from llm import LLMClient
import moderator
from moderator import ModerationError
from orchestrator import run_production
from store import PROJECTS_DIR, Store, list_pipelines, load_manifest, slugify

app = FastAPI(title="AI Studio Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = Store()
llm = LLMClient()
MAX_WORKERS = max(1, int(os.environ.get("MAX_CONCURRENT_PRODUCTIONS", "2")))
workers: dict[str, threading.Thread] = {}


class CreateRequest(BaseModel):
    prompt: str
    pipeline: str = "animated-explainer"
    platform: str = "youtube_landscape"
    duration_seconds: int = 45
    budget_cap_usd: float = 2.0
    approval_mode: str = "auto"
    reference_url: str = ""


class DecideRequest(BaseModel):
    stage: str
    feedback: str = ""


class ModerateRequest(BaseModel):
    text: str


class ModerateBatchRequest(BaseModel):
    texts: list[str]


def _tool_envelope() -> dict:
    def key(*names):
        return [n for n in names if os.environ.get(n, "").strip()]

    return {
        "llm": {
            "available": llm.available,
            "provider": llm.provider,
            "model": llm.model,
            "env": "OPENROUTER_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY",
        },
        "images": {
            "keys": key("FAL_KEY", "PEXELS_API_KEY", "PIXABAY_API_KEY", "UNSPLASH_ACCESS_KEY"),
            "fallback": "unsplash scrape -> local art cards",
        },
        "narration": {"keys": key("OPENAI_API_KEY"), "fallback": "captions only"},
        "music": {"keys": key("SUNO_API_KEY", "ELEVENLABS_API_KEY"), "fallback": "synthesized ambient score"},
        "runtime": {"ffmpeg": True},
    }


@app.get("/api/health")
def health():
    return {"ok": True, "llm": llm.available}


@app.get("/api/status")
def status():
    return {
        "envelope": _tool_envelope(),
        "moderation": {
            "enabled": True,
            "blocklist_terms": len(moderator.BLOCKED_TERMS),
            "llm_review": llm.available,
        },
        "max_workers": MAX_WORKERS,
        "active_workers": len([t for t in workers.values() if t.is_alive()]),
        "productions": len(store.productions),
    }


@app.get("/api/pipelines")
def pipelines():
    return list_pipelines()


@app.get("/api/pipelines/{name}")
def pipeline_detail(name: str):
    m = load_manifest(name)
    if not m:
        raise HTTPException(404, "Pipeline not found")
    return m


@app.post("/api/moderate")
def moderate_text_endpoint(req: ModerateRequest):
    """Standalone content-safety check for client-side tools."""
    return moderator.moderate_text(req.text, llm)


@app.post("/api/moderate/batch")
def moderate_batch_endpoint(req: ModerateBatchRequest):
    verdict = moderator.moderate_texts(req.texts, llm)
    return verdict


@app.post("/api/productions")
def create_production(req: CreateRequest):
    if not req.prompt.strip():
        raise HTTPException(400, "Prompt is required")
    if not load_manifest(req.pipeline):
        raise HTTPException(400, f"Unknown pipeline: {req.pipeline}")
    verdict = moderator.moderate_text(req.prompt, llm)
    if not verdict["allowed"]:
        raise HTTPException(
            400,
            f"Moderation blocked this prompt ({verdict.get('category', 'nsfw')}): {verdict.get('reason', 'unsafe content')}",
        )
    if len([t for t in workers.values() if t.is_alive()]) >= MAX_WORKERS:
        raise HTTPException(429, f"Too many concurrent productions (max {MAX_WORKERS})")
    pid = f"{slugify(req.prompt, 12)}-{uuid.uuid4().hex[:8]}"
    prod = store.create(
        id=pid,
        prompt=req.prompt.strip(),
        pipeline=req.pipeline,
        platform=req.platform,
        duration_seconds=max(15, min(int(req.duration_seconds), 300)),
        budget_cap_usd=max(0.0, float(req.budget_cap_usd or 0)),
        approval_mode=req.approval_mode if req.approval_mode in ("auto", "gates") else "auto",
        reference_url=req.reference_url.strip(),
    )
    t = threading.Thread(target=_run_safe, args=(prod.id,), daemon=True)
    workers[pid] = t
    t.start()
    return {"id": pid}


def _run_safe(pid: str):
    prod = store.get(pid)
    try:
        run_production(prod, store, llm)
    except Exception:
        store.emit(prod, "production.error", error=traceback.format_exc()[-500:])


@app.get("/api/productions")
def list_productions():
    return store.list()


@app.get("/api/productions/{pid}")
def get_production(pid: str):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    return prod.to_public()


@app.get("/api/productions/{pid}/board")
def get_board(pid: str):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    return {
        "script": prod.script,
        "scenes": prod.scenes,
        "assets": prod.assets,
        "proposal": prod.proposal,
        "research": prod.research,
        "edit": prod.edit,
        "render": prod.render,
        "review": prod.review,
        "publish": prod.publish,
    }


@app.get("/api/productions/{pid}/artifacts/{name}")
def get_artifact(pid: str, name: str):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    path = prod.dir / "artifacts" / f"{name}.json"
    if not path.exists():
        raise HTTPException(404, "Artifact not found")
    return json.loads(path.read_text())


@app.post("/api/productions/{pid}/approve")
def approve(pid: str, req: DecideRequest):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    if prod.pending_gate and prod.pending_gate.get("stage") != req.stage:
        raise HTTPException(409, f"Currently gated on {prod.pending_gate['stage']}")
    prod.decide(req.stage, "approved")
    store.emit(prod, "gate.approved", stage=req.stage, feedback=req.feedback)
    return {"ok": True}


@app.post("/api/productions/{pid}/reject")
def reject(pid: str, req: DecideRequest):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    if prod.pending_gate and prod.pending_gate.get("stage") != req.stage:
        raise HTTPException(409, f"Currently gated on {prod.pending_gate['stage']}")
    prod.decide(req.stage, "rejected")
    store.emit(prod, "gate.rejected", stage=req.stage, feedback=req.feedback)
    return {"ok": True}


@app.post("/api/productions/{pid}/cancel")
def cancel(pid: str):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    prod.cancel_requested = True
    for stage in list(prod._approve_events):
        prod.gate_decisions.setdefault(stage, "cancelled")
        prod.approval_event(stage).set()
    return {"ok": True}


@app.get("/api/productions/{pid}/events")
async def stream_events(pid: str):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    q = store.bus.subscribe(pid)

    async def gen():
        try:
            snapshot = {"type": "snapshot", "ts": prod.updated_at, "state": prod.to_public()}
            yield f"event: production\ndata: {json.dumps(snapshot, default=str)}\n\n"
            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=15)
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    continue
                yield f"event: production\ndata: {json.dumps(event, default=str)}\n\n"
                if event.get("type") in ("production.done", "production.error", "production.cancelled"):
                    break
        finally:
            store.bus.unsubscribe(pid, q)

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/projects/{pid}/{rest:path}")
def serve_project_file(pid: str, rest: str):
    prod = store.get(pid)
    if not prod:
        raise HTTPException(404, "Not found")
    path = (prod.dir / rest).resolve()
    if not str(path).startswith(str(prod.dir.resolve())):
        raise HTTPException(403, "Forbidden")
    if not path.exists():
        raise HTTPException(404, "Not found")
    return FileResponse(path)


if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("STUDIO_BACKEND_HOST", "127.0.0.1")
    port = int(os.environ.get("STUDIO_BACKEND_PORT", "8787"))
    uvicorn.run(app, host=host, port=port)
