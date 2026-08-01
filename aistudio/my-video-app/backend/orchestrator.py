"""Pipeline orchestrator. One worker thread per production drives the stages
declared in the pipeline manifest, pausing at human-approval gates when the
production runs in 'gates' mode."""

from __future__ import annotations

import json
import threading
import traceback
from pathlib import Path
from typing import Any

import media
import moderator
from budget import Budget
from llm import LLMClient
from moderator import ModerationError
from store import Store, utcnow

MAX_SCENES = 10


class Cancelled(Exception):
    pass


def run_production(prod, store: Store, llm: LLMClient) -> None:
    try:
        _run(prod, store, llm)
    except Cancelled:
        pass
    except Exception as e:
        if prod.status not in ("done", "cancelled"):
            prod.status = "error"
            prod.error = str(e)
            store.emit(prod, "production.error", error=str(e))
            traceback.print_exc()


def _run(prod, store: Store, llm: LLMClient) -> None:
    manifest = prod.manifest
    if not manifest:
        raise RuntimeError(f"Pipeline {prod.pipeline!r} not found")
    stages = manifest.get("stages", [])
    prod.stage_order = [s["name"] for s in stages]
    for s in stages:
        prod.stages[s["name"]] = {"status": "pending", "name": s["name"]}
    prod.status = "running"
    store.emit(prod, "production.started", pipeline=prod.pipeline, prompt=prod.prompt)

    try:
        moderator.gate_prompt(prod, store, llm)
    except ModerationError as e:
        prod.status = "blocked"
        prod.current_stage = None
        prod.error = str(e)
        store.emit(prod, "production.error", stage="moderation", error=str(e))
        return
    store.emit(prod, "moderation.checked", source="prompt")

    budget = Budget(prod)
    handlers = {
        "research": stage_research,
        "proposal": stage_proposal,
        "script": stage_script,
        "scene_plan": stage_scene_plan,
        "assets": stage_assets,
        "edit": stage_edit,
        "compose": stage_compose,
        "review": stage_review,
        "publish": stage_publish,
    }

    for stage in stages:
        _check_cancel(prod)
        name = stage["name"]
        prod.current_stage = name
        prod.stages[name]["status"] = "running"
        store.emit(prod, "stage.start", stage=name)

        handler = handlers.get(name)
        if handler is None:
            prod.stages[name]["status"] = "skipped"
            store.emit(prod, "stage.skipped", stage=name)
            continue
        try:
            handler(prod, store, llm, budget, stage)
            prod.stages[name]["status"] = "done"
            store.emit(prod, "stage.done", stage=name)
        except Cancelled:
            raise
        except ModerationError as e:
            prod.stages[name]["status"] = "blocked"
            prod.status = "blocked"
            prod.error = f"moderation: {e}"
            store.emit(prod, "production.error", stage=name, error=str(e))
            return
        except Exception as e:
            prod.stages[name]["status"] = "error"
            prod.status = "error"
            prod.error = f"{name}: {e}"
            store.emit(prod, "production.error", stage=name, error=str(e))
            return

    _check_cancel(prod)
    if prod.status != "error":
        prod.status = "done"
        prod.current_stage = None
        store.emit(prod, "production.done")


def _check_cancel(prod) -> None:
    if prod.cancel_requested:
        prod.status = "cancelled"
        prod.current_stage = None
        raise Cancelled()


def require_approval(prod, store: Store, stage_name: str, payload: dict[str, Any], default: bool) -> None:
    if prod.approval_mode == "auto" or not default:
        store.emit(prod, "gate.approved", stage=stage_name, auto=True)
        return
    prod.status = "awaiting_approval"
    prod.pending_gate = {"stage": stage_name, **payload}
    prod.stages[stage_name]["status"] = "awaiting"
    store.emit(prod, "gate.waiting", stage=stage_name, **payload)
    prod.approval_event(stage_name).wait()
    decision = prod.gate_decisions.get(stage_name, "rejected")
    if decision == "approved":
        store.emit(prod, "gate.approved", stage=stage_name)
    else:
        store.emit(prod, "gate.rejected", stage=stage_name)
        raise Cancelled()


def _llm_json(prod, store: Store, llm: LLMClient, system: str, user: str, fallback: dict[str, Any]) -> dict[str, Any]:
    if not llm.available:
        store.emit(prod, "log", message="No LLM key configured — using offline template")
        return fallback
    try:
        data = llm.complete_json(system, user)
        return data or fallback
    except Exception as e:
        store.emit(prod, "log", message=f"LLM stage failed ({e}); using offline template")
        return fallback


def stage_research(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    system = (
        "You are a research director for a video production pipeline. "
        "Return ONLY valid JSON with this exact shape: "
        '{"topic": str, "audience": str, "key_facts": [str], '
        '"data_points": [{"fact": str, "detail": str}], '
        '"angles": [{"title": str, "hook": str}], '
        '"sources": [{"name": str, "url": str, "relevance": str}]}. '
        "Ground everything in well-known, verifiable facts about the topic."
    )
    fallback = _research_template(prod.prompt)
    brief = _llm_json(prod, store, llm, system, f"Topic: {prod.prompt}", fallback)
    prod.research = brief
    store.save_artifact(prod, "research_brief", brief)
    moderator.check_research(prod, store, llm)
    store.emit(prod, "log", message=f"Research complete: {len(brief.get('data_points', []))} data points, {len(brief.get('angles', []))} angles")


def _research_template(topic: str) -> dict[str, Any]:
    return {
        "topic": topic,
        "audience": "General audience curious about the topic",
        "key_facts": [f"Core ideas around {topic} explained simply"],
        "data_points": [{"fact": f"{topic} in context", "detail": "Accurate, widely documented overview"}],
        "angles": [
            {"title": "The Story", "hook": "Start from the human story behind the topic"},
            {"title": "The Science", "hook": "How it actually works, step by step"},
            {"title": "Why It Matters", "hook": "What this changes for everyday life"},
        ],
        "sources": [
            {"name": "Encyclopedic overview", "url": "https://en.wikipedia.org", "relevance": "General reference"},
        ],
    }


def stage_proposal(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    research = prod.research or _research_template(prod.prompt)
    system = (
        "You are an executive producer. Given research, produce a proposal packet. "
        "Return ONLY valid JSON with this exact shape: "
        '{"concepts": [{"id": str, "title": str, "summary": str, "hook": str, '
        '"structure": str, "duration_target": int}], '
        '"selected_concept_id": str, '
        '"cost_estimate": {"total_usd": float, "line_items": [{"label": str, "amount": float}]}, '
        '"production_plan": {"render_runtime": "ffmpeg", "platform": str, "tone": str, "playbook": str}}. '
        "Pick the strongest concept as selected_concept_id. Estimate a realistic itemized cost under $5."
    )
    fallback = _proposal_template(prod)
    packet = _llm_json(prod, store, llm, system, f"Topic: {prod.prompt}\nResearch: {json.dumps(research)[:1500]}", fallback)
    concepts = packet.get("concepts") or []
    if concepts and not any(c.get("id") == packet.get("selected_concept_id") for c in concepts):
        packet["selected_concept_id"] = concepts[0].get("id")
    prod.proposal = packet
    est = float((packet.get("cost_estimate") or {}).get("total_usd", 0) or 0)
    if est > 0:
        budget.add(f"Estimated production budget (proposal)", min(est, prod.budget_cap_usd))
    store.save_artifact(prod, "proposal_packet", packet)
    moderator.check_proposal(prod, store, llm)
    require_approval(prod, store, "proposal", {"title": packet.get("selected_concept_id", "Concept"), "cost": est}, True)


def _proposal_template(prod) -> dict[str, Any]:
    return {
        "concepts": [
            {
                "id": "story",
                "title": "The Story of Your Topic",
                "summary": f"A warm, narrative explainer about {prod.prompt}.",
                "hook": "Open with a surprising question.",
                "structure": "hook -> story -> payoff",
                "duration_target": prod.duration_seconds,
            },
            {
                "id": "how-it-works",
                "title": "How It Actually Works",
                "summary": f"A clear, step-by-step breakdown of {prod.prompt}.",
                "hook": "Open with the most common misconception.",
                "structure": "hook -> steps -> recap",
                "duration_target": prod.duration_seconds,
            },
            {
                "id": "why-it-matters",
                "title": "Why It Matters",
                "summary": f"How {prod.prompt} changes daily life.",
                "hook": "Open with a relatable scenario.",
                "structure": "hook -> impact -> call to think",
                "duration_target": prod.duration_seconds,
            },
        ],
        "selected_concept_id": "story",
        "cost_estimate": {
            "total_usd": 0.0,
            "line_items": [{"label": "Stock imagery (free keys)", "amount": 0.0}, {"label": "Local render", "amount": 0.0}],
        },
        "production_plan": {"render_runtime": "ffmpeg", "platform": prod.platform, "tone": "informative", "playbook": "clean-professional"},
    }


def stage_script(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    proposal = prod.proposal or _proposal_template(prod)
    research = prod.research or _research_template(prod.prompt)
    target = max(15, min(prod.duration_seconds, 180))
    system = (
        "You are a script director. Write a narration script for a video. "
        "Return ONLY valid JSON with this exact shape: "
        '{"title": str, "voice": str, "tone": str, '
        '"sections": [{"index": int, "heading": str, "narration": str, '
        '"subtitle_text": str, "duration_seconds": float}], '
        '"total_duration_seconds": float}. '
        f"Total duration must be about {target} seconds. "
        "Each section: narration 2-4 sentences, subtitle_text a punchy 6-12 word caption. "
        "Section durations must sum to total_duration_seconds. Use 6-10 sections."
    )
    fallback = _script_template(prod.prompt, target)
    script = _llm_json(prod, store, llm, system, f"Topic: {prod.prompt}\nConcept: {json.dumps(proposal)[:1200]}\nResearch: {json.dumps(research)[:1200]}", fallback)
    sections = script.get("sections") or []
    if not sections:
        script = fallback
        sections = script.get("sections") or []
    for i, sec in enumerate(sections):
        sec["index"] = i
        sec.setdefault("subtitle_text", sec.get("heading", ""))
    _normalize_durations(sections, target)
    script["total_duration_seconds"] = round(sum(s.get("duration_seconds", 3) for s in sections), 1)
    prod.script = script
    store.save_artifact(prod, "script", script)
    moderator.check_script(prod, store, llm)
    words = sum(len(s.get("narration", "").split()) for s in sections)
    store.emit(prod, "log", message=f"Script ready: {len(sections)} sections, ~{words} words, {script['total_duration_seconds']}s")
    require_approval(prod, store, "script", {"title": script.get("title"), "sections": len(sections), "duration": script["total_duration_seconds"]}, True)


def _script_template(topic: str, target: int) -> dict[str, Any]:
    n = min(MAX_SCENES, max(4, round(target / 10)))
    per = target / n
    sections = []
    for i in range(n):
        if i == 0:
            heading, nar, sub = "Open", f"Let's talk about {topic} and why it matters.", f"What is {topic}?"
        elif i == n - 1:
            heading, nar, sub = "Close", f"That's {topic} in a nutshell. Now you know — and knowing changes the way you see it.", "Now you know."
        else:
            heading, nar, sub = f"Part {i}", f"Here is another important piece of {topic} worth understanding clearly.", f"{topic} — part {i + 1}"
        sections.append({"index": i, "heading": heading, "narration": nar, "subtitle_text": sub, "duration_seconds": round(per, 1)})
    _normalize_durations(sections, target)
    return {"title": topic[:60], "voice": "warm, clear, calm", "tone": "informative", "sections": sections, "total_duration_seconds": round(target, 1)}


def _normalize_durations(sections: list[dict[str, Any]], target: float) -> None:
    total = sum(s.get("duration_seconds", 3) or 3 for s in sections)
    if total <= 0:
        return
    scale = target / total
    for s in sections:
        s["duration_seconds"] = round(max(2.0, (s.get("duration_seconds", 3) or 3) * scale), 1)


def stage_scene_plan(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    script = prod.script or _script_template(prod.prompt, prod.duration_seconds)
    sections = script.get("sections") or []
    system = (
        "You are a scene director. Turn a narration script into a visual scene plan. "
        "Return ONLY valid JSON with this exact shape: "
        '{"scenes": [{"index": int, "title": str, "scene_type": str, '
        '"image_prompt": str, "shot_prompt": str, "mood": str, '
        '"narration_index": int, "duration_seconds": float, "transition": str}]}. '
        "One scene per script section. image_prompt must describe a vivid, safe, "
        "photoreal or illustrated still in 16:9 landscape. Match durations to sections."
    )
    fallback = _scene_template(sections)
    plan = _llm_json(prod, store, llm, system, f"Script: {json.dumps(script)[:2000]}", fallback)
    scenes = plan.get("scenes") or []
    if not scenes:
        scenes = fallback.get("scenes") or []
    for i, sc in enumerate(scenes):
        sc.setdefault("index", i)
        sc.setdefault("title", f"Scene {i + 1}")
        sc.setdefault("scene_type", "cinematic")
        sc.setdefault("mood", "evocative")
        sc.setdefault("transition", "crossfade")
        sc.setdefault("narration_index", i)
    _normalize_durations(scenes, sum(s.get("duration_seconds", 3) for s in sections) or prod.duration_seconds)
    prod.scenes = scenes
    store.save_artifact(prod, "scene_plan", plan)
    moderator.check_scene_plan(prod, store, llm)
    store.emit(prod, "log", message=f"Scene plan ready: {len(scenes)} scenes")
    require_approval(prod, store, "scene_plan", {"scenes": len(scenes)}, True)


def _scene_template(sections: list[dict[str, Any]]) -> dict[str, Any]:
    scenes = []
    for i, sec in enumerate(sections):
        topic = sec.get("heading", "The topic")
        scenes.append(
            {
                "index": i,
                "title": f"Scene {i + 1}",
                "scene_type": "cinematic",
                "image_prompt": f"{topic}, cinematic wide shot, golden hour, atmospheric, 16:9",
                "shot_prompt": "slow push-in, shallow depth of field",
                "mood": "evocative",
                "narration_index": i,
                "duration_seconds": sec.get("duration_seconds", 3.0),
                "transition": "crossfade",
            }
        )
    return {"scenes": scenes}


def stage_assets(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    scenes = prod.scenes or []
    if not scenes:
        raise RuntimeError("No scenes to generate assets for")
    images_dir = prod.dir / "media" / "images"
    assets = []
    for sc in scenes:
        _check_cancel(prod)
        out = images_dir / f"scene_{sc.get('index', 0):03d}.jpg"
        result = media.fetch_image(sc.get("image_prompt", prod.prompt), out)
        assets.append(
            {
                "type": "image",
                "scene": sc.get("index", 0),
                "label": sc.get("title", f"Scene {sc.get('index', 0)}"),
                "path": result["path"],
                "url": f"/projects/{prod.id}/media/images/scene_{sc.get('index', 0):03d}.jpg",
                "source": result["source"],
                "cost": result["cost"],
            }
        )
        budget.add(f"Image scene {sc.get('index', 0)} ({result['source']})", result["cost"])
        store.emit(prod, "asset.generated", name=sc.get("title", "image"), index=sc.get("index", 0), source=result["source"])

    script = prod.script or {}
    sections = script.get("sections") or []
    narration = media.synthesize_narration(sections, prod.dir / "media" / "audio")
    for n in narration:
        budget.add("Narration (TTS)", n["cost"])
        store.emit(prod, "asset.generated", name="narration", index=n["section"], source="openai_tts")

    total_dur = sum(s.get("duration_seconds", 3) for s in scenes) or prod.duration_seconds
    music = media.synthesize_music(total_dur, prod.dir / "media" / "audio" / "music.wav")
    if music.get("path"):
        store.emit(prod, "asset.generated", name="music", source=music["source"])

    prod.assets = assets
    store.save_artifact(
        prod,
        "asset_manifest",
        {
            "assets": assets,
            "narration": narration,
            "music": music,
            "total_duration_seconds": total_dur,
        },
    )
    store.emit(prod, "log", message=f"Assets ready: {len(assets)} images, {len(narration)} narration clips, {music['source']} score")
    require_approval(prod, store, "assets", {"images": len(assets), "narration": len(narration)}, True)


def stage_edit(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    scenes = prod.scenes or []
    script = prod.script or {}
    sections = script.get("sections") or []
    start = 0.0
    for i, sc in enumerate(scenes):
        sc["start"] = round(start, 2)
        sc["duration"] = sc.get("duration_seconds", 3.0)
        sc.setdefault("index", i)
        start += sc["duration_seconds"]
        narration = ""
        idx = sc.get("narration_index", i)
        if idx < len(sections):
            narration = sections[idx].get("narration", "")
        sc.setdefault("subtitle_text", narration or sc.get("title", ""))
    total = start
    edits = {
        "render_runtime": "ffmpeg",
        "platform": prod.platform,
        "total_duration_seconds": round(total, 1),
        "scenes": [
            {
                "index": sc.get("index", i),
                "source": sc.get("image_path"),
                "start": sc.get("start"),
                "duration": sc.get("duration_seconds"),
                "subtitle_text": sc.get("subtitle_text"),
                "transition": sc.get("transition", "crossfade"),
            }
            for i, sc in enumerate(scenes)
        ],
        "subtitles": {"enabled": True, "style": "clean"},
        "music": {"enabled": True, "ducking": "auto"},
    }
    prod.edit = edits
    store.save_artifact(prod, "edit_decisions", edits)
    store.emit(prod, "log", message=f"Edit plan ready: {len(edits['scenes'])} cuts, {edits['total_duration_seconds']}s total")


def stage_compose(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    scenes = prod.scenes or []
    asset_manifest = json.loads((prod.dir / "artifacts" / "asset_manifest.json").read_text()) if (prod.dir / "artifacts" / "asset_manifest.json").exists() else {}
    by_scene = {}
    for a in asset_manifest.get("assets", []):
        by_scene[a.get("scene")] = a
    narration = asset_manifest.get("narration", [])
    music = asset_manifest.get("music", {}) or {}
    for i, sc in enumerate(scenes):
        idx = sc.get("index", i)
        asset = by_scene.get(idx)
        if asset:
            sc["image_path"] = asset["path"]
    missing = [sc.get("index") for sc in scenes if not sc.get("image_path")]
    if missing:
        for idx in missing:
            out = prod.dir / "media" / "images" / f"scene_{idx:03d}.jpg"
            res = media.fetch_image(prod.prompt, out)
            for sc in scenes:
                if sc.get("index") == idx:
                    sc["image_path"] = res["path"]
    total = sum(sc.get("duration_seconds", 3) for sc in scenes)
    store.emit(prod, "render.started")
    work = prod.dir / "renders"
    result = media.compose_video(
        scenes,
        narration=narration,
        music_path=music.get("path", ""),
        total_duration=total,
        work=work,
        final_out=work / "final.mp4",
    )
    if not result.get("ok"):
        raise RuntimeError(f"Render failed: {result.get('error', 'unknown')}")
    prod.output_url = f"/projects/{prod.id}/renders/final.mp4"
    _make_thumbnail(prod)
    dur = media.ffprobe_duration(Path(result["path"]))
    prod.render = {"path": str(result["path"]), "url": prod.output_url, "duration": round(dur, 2), "ok": True}
    store.save_artifact(prod, "render_report", prod.render)
    store.emit(prod, "render.done", path=result["path"], duration=round(dur, 2))


def _make_thumbnail(prod) -> None:
    try:
        out = prod.dir / "renders" / "thumbnail.jpg"
        media._run([
            "ffmpeg", "-y", "-i", str(prod.dir / "renders" / "final.mp4"),
            "-vf", "thumbnail=24,scale=640:-1", "-frames:v", "1", str(out),
        ], timeout=60)
        if out.exists():
            prod.thumbnail_url = f"/projects/{prod.id}/renders/thumbnail.jpg"
    except Exception:
        pass


def stage_review(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    final = prod.dir / "renders" / "final.mp4"
    if not final.exists():
        raise RuntimeError("final.mp4 missing before review")
    probe = json.loads(
        media._run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(final)], timeout=60).stdout
        or "{}"
    )
    streams = probe.get("streams", [])
    fmt = probe.get("format", {})
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
    duration = float(fmt.get("duration", 0) or 0)
    checks = [
        {"name": "duration", "pass": duration > 0, "detail": f"{duration:.1f}s"},
        {"name": "video_stream", "pass": video is not None, "detail": (video or {}).get("codec_name", "none")},
        {"name": "audio_stream", "pass": audio is not None, "detail": (audio or {}).get("codec_name", "none")},
        {"name": "file_size", "pass": final.stat().st_size > 5000, "detail": f"{final.stat().st_size / 1024:.0f} KB"},
    ]
    ok = all(c["pass"] for c in checks)
    prod.review = {"ok": ok, "duration": round(duration, 2), "checks": checks}
    store.save_artifact(prod, "final_review", prod.review)
    if not ok:
        store.emit(prod, "log", message="Review warnings: " + ", ".join(c["name"] for c in checks if not c["pass"]))
    else:
        store.emit(prod, "log", message=f"Review passed: {duration:.1f}s, {video['codec_name']} / {audio['codec_name']}")


def stage_publish(prod, store: Store, llm: LLMClient, budget: Budget, stage) -> None:
    export = prod.dir / "export"
    final = prod.dir / "renders" / "final.mp4"
    if not final.exists():
        raise RuntimeError("Cannot publish: no render")
    import shutil

    shutil.copy2(final, export / "final.mp4")
    thumb = prod.dir / "renders" / "thumbnail.jpg"
    if thumb.exists():
        shutil.copy2(thumb, export / "thumbnail.jpg")
    script = prod.script or {}
    sections = script.get("sections") or []
    text = "\n\n".join(s.get("narration", "") for s in sections)
    (export / "script.txt").write_text(text)
    srt_src = prod.dir / "renders" / "subtitles.srt"
    if srt_src.exists():
        shutil.copy2(srt_src, export / "subtitles.srt")
    metadata = {
        "title": script.get("title", prod.prompt[:60]),
        "prompt": prod.prompt,
        "pipeline": prod.pipeline,
        "platform": prod.platform,
        "duration_seconds": prod.render.get("duration") if prod.render else None,
        "created_at": utcnow(),
        "cost_usd": prod.costs.get("total_usd", 0),
        "credits": {"system": "AI Studio on OpenMontage", "render_runtime": "ffmpeg"},
    }
    (export / "metadata.json").write_text(json.dumps(metadata, indent=2))
    prod.publish = {"path": str(export), "files": sorted(p.name for p in export.iterdir())}
    store.save_artifact(prod, "publish_log", prod.publish)
    store.emit(prod, "log", message=f"Exported package: {', '.join(prod.publish['files'])}")
    require_approval(prod, store, "publish", {"files": prod.publish["files"]}, True)
