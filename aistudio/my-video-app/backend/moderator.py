"""Content moderator for the AI Studio backend pipeline.

Two-layer safety gate that mirrors the frontend moderator:

  1. Deterministic keyword / leet-speak blocklist (always on, no keys needed).
  2. LLM semantic review (optional, only when an LLM client is configured).

Every entry point into the production pipeline is gated: the user prompt at
creation time, and every AI-generated artifact (research, proposal, script,
scene plan). Anything that fails either layer is hard-blocked so NSFW content
never reaches an image provider, a TTS provider, or the final render.
"""

from __future__ import annotations

import re
from typing import Any

LEET_MAP = {
    "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
    "9": "g", "@": "a", "$": "s", "!": "i", "+": "", "_": " ",
    "-": " ", ".": " ",
}

BLOCKED_TERMS: list[dict[str, str]] = [
    {"term": "porn", "category": "sexually-explicit"},
    {"term": "porno", "category": "sexually-explicit"},
    {"term": "pornography", "category": "sexually-explicit"},
    {"term": "x rated", "category": "sexually-explicit"},
    {"term": "adult content", "category": "sexually-explicit"},
    {"term": "nude", "category": "sexually-explicit"},
    {"term": "nudity", "category": "sexually-explicit"},
    {"term": "naked", "category": "sexually-explicit"},
    {"term": "topless", "category": "sexually-explicit"},
    {"term": "bottomless", "category": "sexually-explicit"},
    {"term": "naked body", "category": "sexually-explicit"},
    {"term": "sextape", "category": "sexually-explicit"},
    {"term": "sex tape", "category": "sexually-explicit"},
    {"term": "masturbat", "category": "sexually-explicit"},
    {"term": "fellatio", "category": "sexually-explicit"},
    {"term": "cunnilingus", "category": "sexually-explicit"},
    {"term": "oral sex", "category": "sexually-explicit"},
    {"term": "anal sex", "category": "sexually-explicit"},
    {"term": "sexually explicit", "category": "sexually-explicit"},
    {"term": "explicit content", "category": "sexually-explicit"},
    {"term": "erotic", "category": "sexually-explicit"},
    {"term": "erotica", "category": "sexually-explicit"},
    {"term": "hardcore", "category": "sexually-explicit"},
    {"term": "pornhub", "category": "sexually-explicit"},
    {"term": "onlyfans", "category": "sexually-explicit"},
    {"term": "only fans", "category": "sexually-explicit"},
    {"term": "camgirl", "category": "sexually-explicit"},
    {"term": "camsite", "category": "sexually-explicit"},
    {"term": "escort", "category": "sexually-explicit"},
    {"term": "prostitut", "category": "sexually-explicit"},
    {"term": "prostitution", "category": "sexually-explicit"},
    {"term": "stripper", "category": "sexually-explicit"},
    {"term": "striptease", "category": "sexually-explicit"},
    {"term": "strip tease", "category": "sexually-explicit"},
    {"term": "hentai", "category": "sexually-explicit"},
    {"term": "yaoi", "category": "sexually-explicit"},
    {"term": "yuri", "category": "sexually-explicit"},
    {"term": "futanari", "category": "sexually-explicit"},
    {"term": "lolicon", "category": "sexually-explicit"},
    {"term": "rule34", "category": "sexually-explicit"},
    {"term": "rule 34", "category": "sexually-explicit"},
    {"term": "milf", "category": "sexually-explicit"},
    {"term": "nsfw", "category": "sexually-explicit"},
    {"term": "shemale", "category": "sexually-explicit"},
    {"term": "blowjob", "category": "sexually-explicit"},
    {"term": "handjob", "category": "sexually-explicit"},
    {"term": "deepthroat", "category": "sexually-explicit"},
    {"term": "squirt", "category": "sexually-explicit"},
    {"term": "cumshot", "category": "sexually-explicit"},
    {"term": "creampie", "category": "sexually-explicit"},
    {"term": "gangbang", "category": "sexually-explicit"},
    {"term": "threesome", "category": "sexually-explicit"},
    {"term": "orgy", "category": "sexually-explicit"},
    {"term": "kamasutra", "category": "sexually-explicit"},
    {"term": "bdsm", "category": "sexually-explicit"},
    {"term": "bondage", "category": "sexually-explicit"},
    {"term": "fetish", "category": "sexually-explicit"},
    {"term": "fetishism", "category": "sexually-explicit"},
    {"term": "penis", "category": "sexually-explicit"},
    {"term": "vagina", "category": "sexually-explicit"},
    {"term": "breasts", "category": "sexually-explicit"},
    {"term": "buttocks", "category": "sexually-explicit"},
    {"term": "genitals", "category": "sexually-explicit"},
    {"term": "genitalia", "category": "sexually-explicit"},
    {"term": "phallus", "category": "sexually-explicit"},
    {"term": "cleavage", "category": "sexually-explicit"},
    {"term": "lingerie", "category": "sexually-explicit"},
    {"term": "thong", "category": "sexually-explicit"},
    {"term": "gore", "category": "violent"},
    {"term": "snuff", "category": "violent"},
    {"term": "beheading", "category": "violent"},
    {"term": "decapitat", "category": "violent"},
    {"term": "mutilat", "category": "violent"},
    {"term": "dismember", "category": "violent"},
    {"term": "bloodbath", "category": "violent"},
    {"term": "massacre", "category": "violent"},
    {"term": "genocide", "category": "violent"},
    {"term": "torture", "category": "violent"},
    {"term": "execution footage", "category": "violent"},
    {"term": "rape", "category": "violent"},
    {"term": "sexual assault", "category": "violent"},
    {"term": "molest", "category": "violent"},
    {"term": "suicide", "category": "self-harm"},
    {"term": "self harm", "category": "self-harm"},
    {"term": "cutting wrists", "category": "self-harm"},
    {"term": "kill yourself", "category": "self-harm"},
    {"term": "kill myself", "category": "self-harm"},
    {"term": "child porn", "category": "child-exploitation"},
    {"term": "child sexual", "category": "child-exploitation"},
    {"term": "pedophile", "category": "child-exploitation"},
    {"term": "pedophilia", "category": "child-exploitation"},
    {"term": "paedophile", "category": "child-exploitation"},
    {"term": "paedophilia", "category": "child-exploitation"},
    {"term": "underage sex", "category": "child-exploitation"},
    {"term": "minor sex", "category": "child-exploitation"},
    {"term": "drugs for sale", "category": "illegal"},
    {"term": "buy cocaine", "category": "illegal"},
    {"term": "buy heroin", "category": "illegal"},
    {"term": "synthesize drugs", "category": "illegal"},
    {"term": "bomb making", "category": "illegal"},
    {"term": "explosives instructions", "category": "illegal"},
    {"term": "credit card fraud", "category": "illegal"},
    {"term": "hate speech", "category": "hate"},
    {"term": "racial slur", "category": "hate"},
    {"term": "slur", "category": "hate"},
]

MODERATION_SYSTEM_PROMPT = (
    "You are an expert content safety moderator for an AI media studio. "
    "Decide whether the given text is SAFE for a general audience. Flag content "
    "that is sexually explicit, pornographic, nude/erotic, gory, promoting "
    "violence, self-harm, hate speech, or otherwise NSFW (not safe for work). "
    "Everyday topics like education, health, nature, cooking, sports or casual "
    "language are SAFE. Medical or anatomical words used in a neutral, "
    "scientific context are SAFE. "
    'Respond with ONLY valid JSON: {"safe": true|false, "category": "string|null", "reason": "string|null"}.'
)


class ModerationError(Exception):
    """Raised when content fails moderation and the production must stop."""

    def __init__(self, verdict: dict[str, Any]) -> None:
        self.verdict = verdict
        super().__init__(verdict.get("reason") or "Content failed moderation")


def normalize(text: str) -> str:
    out = []
    for ch in (text or "").lower():
        out.append(LEET_MAP.get(ch, ch))
    s = "".join(out)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def blocklist_check(text: str) -> dict[str, Any]:
    normalized = normalize(text)
    for entry in BLOCKED_TERMS:
        term = entry["term"].lower()
        if term in normalized:
            return {
                "allowed": False,
                "category": entry["category"],
                "reason": f'Blocked term detected: "{entry["term"]}"',
                "matched": entry["term"],
            }
    return {"allowed": True}


def _llm_judge(text: str, llm: Any) -> dict[str, Any] | None:
    if llm is None or not getattr(llm, "available", False):
        return None
    try:
        data = llm.complete_json(
            MODERATION_SYSTEM_PROMPT,
            text[:2000],
            temperature=0.0,
            max_tokens=120,
        )
        if not isinstance(data, dict):
            return None
        return {"safe": data.get("safe") is not False, "category": data.get("category"), "reason": data.get("reason")}
    except Exception:
        return None


def moderate_text(text: str, llm: Any = None) -> dict[str, Any]:
    """Blocklist + optional LLM review. Returns a verdict dict."""
    if not text or not text.strip():
        return {"allowed": True}

    verdict = blocklist_check(text)
    if not verdict["allowed"]:
        return verdict

    judge = _llm_judge(text, llm)
    if judge and not judge["safe"]:
        return {
            "allowed": False,
            "category": judge.get("category") or "nsfw",
            "reason": judge.get("reason") or "Content flagged by AI moderation",
        }
    return {"allowed": True}


def moderate_texts(texts: list[str], llm: Any = None) -> dict[str, Any]:
    for t in texts:
        if not t or not t.strip():
            continue
        verdict = moderate_text(t, llm)
        if not verdict["allowed"]:
            return verdict
    return {"allowed": True}


def _flag(prod, store, verdict: dict[str, Any], source: str) -> None:
    store.emit(
        prod,
        "moderation.blocked",
        source=source,
        category=verdict.get("category", "nsfw"),
        reason=verdict.get("reason", ""),
    )
    prod.moderation = {
        "status": "blocked",
        "source": source,
        "category": verdict.get("category"),
        "reason": verdict.get("reason"),
        "matched": verdict.get("matched"),
    }


def gate_prompt(prod, store, llm: Any = None) -> None:
    """Hard gate on the production prompt. Raises ModerationError when unsafe."""
    verdict = moderate_text(prod.prompt, llm)
    prod.moderation = {"status": "passed" if verdict["allowed"] else "blocked"}
    if not verdict["allowed"]:
        _flag(prod, store, verdict, "prompt")
        raise ModerationError(verdict)


def check_script(prod, store, llm: Any = None) -> None:
    sections = ((prod.script or {}).get("sections")) or []
    texts = []
    for s in sections:
        texts.extend([s.get("narration", ""), s.get("subtitle_text", ""), s.get("heading", "")])
    verdict = moderate_texts(texts, llm)
    if not verdict["allowed"]:
        _flag(prod, store, verdict, "script")
        raise ModerationError(verdict)


def check_scene_plan(prod, store, llm: Any = None) -> None:
    scenes = prod.scenes or []
    texts = []
    for sc in scenes:
        texts.extend([sc.get("title", ""), sc.get("image_prompt", ""), sc.get("shot_prompt", "")])
    verdict = moderate_texts(texts, llm)
    if not verdict["allowed"]:
        _flag(prod, store, verdict, "scene_plan")
        raise ModerationError(verdict)


def check_research(prod, store, llm: Any = None) -> None:
    research = prod.research or {}
    texts = [research.get("topic", "")]
    texts += [dp.get("fact", "") for dp in research.get("data_points", [])]
    texts += [a.get("title", "") for a in research.get("angles", [])]
    verdict = moderate_texts(texts, llm)
    if not verdict["allowed"]:
        _flag(prod, store, verdict, "research")
        raise ModerationError(verdict)


def check_proposal(prod, store, llm: Any = None) -> None:
    proposal = prod.proposal or {}
    texts = [c.get("title", "") + " " + c.get("summary", "") for c in proposal.get("concepts", [])]
    verdict = moderate_texts(texts, llm)
    if not verdict["allowed"]:
        _flag(prod, store, verdict, "proposal")
        raise ModerationError(verdict)


