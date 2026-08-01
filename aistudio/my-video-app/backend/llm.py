"""Small, dependency-free LLM client.

Tries OpenRouter, then Anthropic, then OpenAI. When no API key is present it
returns a caller-provided offline fallback so the full pipeline still runs
deterministically with zero keys.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

import requests


class LLMClient:
    def __init__(self) -> None:
        self.provider: str | None = None
        self.model: str | None = None
        self.key: str | None = None

        for name, key_var, model_default, url in (
            ("openrouter", "OPENROUTER_API_KEY", "openrouter/auto", "https://openrouter.ai/api/v1/chat/completions"),
            ("anthropic", "ANTHROPIC_API_KEY", "claude-sonnet-4-5", "https://api.anthropic.com/v1/messages"),
            ("openai", "OPENAI_API_KEY", "gpt-4o-mini", "https://api.openai.com/v1/chat/completions"),
        ):
            key = os.environ.get(key_var, "").strip()
            if not key:
                continue
            self.provider = name
            self.key = key
            self.model = (os.environ.get("LLM_MODEL", "").strip() or model_default)
            self._url = url
            break

    @property
    def available(self) -> bool:
        return self.provider is not None

    def complete(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.6,
        max_tokens: int = 2048,
        timeout: int = 120,
    ) -> str:
        if not self.available:
            raise RuntimeError("No LLM provider configured")
        if self.provider == "anthropic":
            payload = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "system": system,
                "messages": [{"role": "user", "content": user}],
            }
            headers = {
                "x-api-key": self.key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
        else:
            payload = {
                "model": self.model,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            }
            headers = {
                "Authorization": f"Bearer {self.key}",
                "Content-Type": "application/json",
            }
        resp = requests.post(self._url, json=payload, headers=headers, timeout=timeout)
        if resp.status_code != 200:
            raise RuntimeError(f"{self.provider} {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        if self.provider == "anthropic":
            return "".join(b.get("text", "") for b in data.get("content", []))
        return (data.get("choices") or [{}])[0].get("message", {}).get("content", "")

    def complete_json(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.4,
        max_tokens: int = 2048,
    ) -> dict[str, Any]:
        raw = self.complete(system, user, temperature=temperature, max_tokens=max_tokens)
        return _extract_json(raw)


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass
    raise ValueError(f"LLM returned invalid JSON: {text[:200]}")
