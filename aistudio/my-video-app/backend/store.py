"""Production store: in-memory state, disk persistence, SSE event bus."""

from __future__ import annotations

import asyncio
import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

from openmontage.lib import events as om_events

PROJECTS_DIR = Path(__file__).resolve().parent / "projects"
MANIFESTS_DIR = Path(__file__).resolve().parent / "openmontage" / "pipeline_defs"


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str, limit: int = 24) -> str:
    out = "".join(c if c.isalnum() else "-" for c in value.lower().strip())
    out = "-".join(p for p in out.split("-") if p)
    return (out or "project")[:limit]


def load_manifest(name: str) -> dict[str, Any] | None:
    path = MANIFESTS_DIR / f"{name}.yaml"
    if not path.exists():
        return None
    return yaml.safe_load(path.read_text())


def list_pipelines() -> list[dict[str, Any]]:
    result = []
    for path in sorted(MANIFESTS_DIR.glob("*.yaml")):
        m = yaml.safe_load(path.read_text())
        result.append(
            {
                "name": m.get("name", path.stem),
                "description": m.get("description", "").strip(),
                "category": m.get("category", ""),
                "stability": m.get("stability", ""),
                "stages": [s["name"] for s in m.get("stages", [])],
                "budget_default_usd": (m.get("orchestration") or {}).get("budget_default_usd", 2.0),
                "required_skills": m.get("required_skills", []),
            }
        )
    return result


class EventBus:
    def __init__(self) -> None:
        self._subs: dict[str, set[asyncio.Queue]] = {}
        self._lock = threading.Lock()

    def subscribe(self, production_id: str) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=1000)
        with self._lock:
            self._subs.setdefault(production_id, set()).add(q)
        return q

    def unsubscribe(self, production_id: str, q: asyncio.Queue) -> None:
        with self._lock:
            subs = self._subs.get(production_id)
            if subs:
                subs.discard(q)

    def publish(self, production_id: str, event: dict[str, Any]) -> None:
        with self._lock:
            subs = list(self._subs.get(production_id, ()))
        for q in subs:
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                pass


class Production:
    def __init__(
        self,
        *,
        id: str,
        prompt: str,
        pipeline: str,
        platform: str,
        duration_seconds: int,
        budget_cap_usd: float,
        approval_mode: str,
        reference_url: str = "",
    ) -> None:
        now = utcnow()
        self.id = id
        self.prompt = prompt
        self.pipeline = pipeline
        self.platform = platform
        self.duration_seconds = duration_seconds
        self.budget_cap_usd = budget_cap_usd
        self.approval_mode = approval_mode
        self.reference_url = reference_url
        self.created_at = now
        self.updated_at = now
        self.status = "queued"
        self.error: str | None = None
        self.manifest = load_manifest(pipeline) or {}
        self.stage_order: list[str] = []
        self.stages: dict[str, dict[str, Any]] = {}
        self.current_stage: str | None = None
        self.logs: list[dict[str, Any]] = []
        self.costs: dict[str, Any] = {"total_usd": 0.0, "items": [], "cap_usd": budget_cap_usd}
        self.script: dict[str, Any] | None = None
        self.scenes: list[dict[str, Any]] = []
        self.assets: list[dict[str, Any]] = []
        self.edit: dict[str, Any] | None = None
        self.render: dict[str, Any] | None = None
        self.review: dict[str, Any] | None = None
        self.publish: dict[str, Any] | None = None
        self.proposal: dict[str, Any] | None = None
        self.research: dict[str, Any] | None = None
        self.pending_gate: dict[str, Any] | None = None
        self.moderation: dict[str, Any] = {"status": "pending"}
        self.output_url: str | None = None
        self.thumbnail_url: str | None = None
        self.cancel_requested = False
        self.gate_decisions: dict[str, str] = {}
        self._approve_events: dict[str, threading.Event] = {}
        self.lock = threading.RLock()
        self.dir = PROJECTS_DIR / id

    def approval_event(self, stage: str) -> threading.Event:
        with self.lock:
            if stage not in self._approve_events:
                self._approve_events[stage] = threading.Event()
            return self._approve_events[stage]

    def decide(self, stage: str, decision: str) -> None:
        with self.lock:
            self.gate_decisions[stage] = decision
            self.pending_gate = None
            self.status = "running"
            self.approval_event(stage).set()

    def to_public(self) -> dict[str, Any]:
        with self.lock:
            return {
                "id": self.id,
                "prompt": self.prompt,
                "pipeline": self.pipeline,
                "platform": self.platform,
                "duration_seconds": self.duration_seconds,
                "budget_cap_usd": self.budget_cap_usd,
                "approval_mode": self.approval_mode,
                "reference_url": self.reference_url,
                "created_at": self.created_at,
                "updated_at": self.updated_at,
                "status": self.status,
                "error": self.error,
                "current_stage": self.current_stage,
                "stage_order": self.stage_order,
                "stages": self.stages,
                "pending_gate": self.pending_gate,
                "moderation": self.moderation,
                "costs": self.costs,
                "output_url": self.output_url,
                "thumbnail_url": self.thumbnail_url,
                "logs": self.logs[-400:],
            }


class Store:
    def __init__(self) -> None:
        self.bus = EventBus()
        self.productions: dict[str, Production] = {}
        self.projects_dir = PROJECTS_DIR
        self.projects_dir.mkdir(parents=True, exist_ok=True)

    def create(self, **kwargs) -> Production:
        prod = Production(**kwargs)
        prod.dir.mkdir(parents=True, exist_ok=True)
        (prod.dir / "artifacts").mkdir(exist_ok=True)
        (prod.dir / "media").mkdir(exist_ok=True)
        (prod.dir / "media" / "images").mkdir(exist_ok=True)
        (prod.dir / "media" / "audio").mkdir(exist_ok=True)
        (prod.dir / "media" / "subtitles").mkdir(exist_ok=True)
        (prod.dir / "renders").mkdir(exist_ok=True)
        (prod.dir / "export").mkdir(exist_ok=True)
        self.productions[prod.id] = prod
        self._save_metadata(prod)
        return prod

    def get(self, production_id: str) -> Production | None:
        return self.productions.get(production_id)

    def list(self) -> list[dict[str, Any]]:
        items = []
        for prod in self.productions.values():
            items.append(
                {
                    "id": prod.id,
                    "prompt": prod.prompt,
                    "pipeline": prod.pipeline,
                    "status": prod.status,
                    "platform": prod.platform,
                    "current_stage": prod.current_stage,
                    "costs": prod.costs,
                    "created_at": prod.created_at,
                    "updated_at": prod.updated_at,
                    "output_url": prod.output_url,
                    "thumbnail_url": prod.thumbnail_url,
                }
            )
        return sorted(items, key=lambda p: p["created_at"], reverse=True)

    def emit(self, prod: Production, event_type: str, **payload: Any) -> None:
        event = {"type": event_type, "ts": utcnow(), **payload}
        prod.logs.append({"ts": event["ts"], "level": "info", "msg": _event_text(event_type, payload)})
        prod.updated_at = utcnow()
        self.bus.publish(prod.id, event)
        try:
            om_events.emit_event(prod.dir, {"type": event_type, **payload})
        except Exception:
            pass
        self._save_metadata(prod)

    def save_artifact(self, prod: Production, name: str, data: Any) -> Path:
        path = prod.dir / "artifacts" / f"{name}.json"
        path.write_text(json.dumps(data, indent=2, default=str))
        return path

    def _save_metadata(self, prod: Production) -> None:
        try:
            (prod.dir / "metadata.json").write_text(json.dumps(prod.to_public(), indent=2, default=str))
        except Exception:
            pass


def _event_text(event_type: str, payload: dict[str, Any]) -> str:
    mapping = {
        "production.started": f"Production started: {payload.get('pipeline', '')}",
        "stage.start": f"Stage started: {payload.get('stage', '')}",
        "stage.done": f"Stage completed: {payload.get('stage', '')}",
        "stage.skipped": f"Stage skipped: {payload.get('stage', '')}",
        "gate.waiting": f"Awaiting approval: {payload.get('stage', '')}",
        "gate.approved": f"Approved: {payload.get('stage', '')}",
        "gate.rejected": f"Rejected: {payload.get('stage', '')}",
        "asset.generated": f"Asset generated: {payload.get('label', payload.get('name', ''))}",
        "cost": f"Cost {payload.get('amount', 0)} — running total ${payload.get('total', 0):.2f}",
        "budget.warning": f"Budget warning: ${payload.get('spent', 0):.2f} of ${payload.get('cap', 0):.2f}",
        "render.started": "Render started",
        "render.done": f"Render complete: {payload.get('path', '')}",
        "moderation.blocked": f"Moderation blocked ({payload.get('source', 'content')}): {payload.get('reason', '')}",
        "moderation.checked": f"Moderation passed: {payload.get('source', 'content')}",
        "production.done": "Production complete",
        "production.error": f"Production failed: {payload.get('error', '')}",
        "production.cancelled": "Production cancelled",
        "log": str(payload.get("message", "")),
    }
    return mapping.get(event_type, f"{event_type}: {json.dumps(payload, default=str)[:120]}")
