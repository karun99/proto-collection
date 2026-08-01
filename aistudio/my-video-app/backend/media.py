"""Asset sourcing + FFmpeg composition. Everything here is time-boxed and
degrades to free/local fallbacks so production never hard-fails on a missing key.
"""

from __future__ import annotations

import json
import math
import os
import re
import subprocess
from pathlib import Path
from typing import Any

import requests
from PIL import Image, ImageDraw, ImageFilter

TIMEOUT = 15
PROVIDER_COST = {
    "pexels": 0.0,
    "pixabay": 0.0,
    "unsplash": 0.0,
    "unsplash_scrape": 0.0,
    "openai_tts": 0.0015,
    "placeholder": 0.0,
}


def _run(cmd: list[str], timeout: int = 180) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def ffprobe_duration(path: Path) -> float:
    try:
        r = _run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)])
        return float(json.loads(r.stdout).get("format", {}).get("duration", 0) or 0)
    except Exception:
        return 0.0


def _download(url: str, out: Path, timeout: int = TIMEOUT) -> bool:
    try:
        r = requests.get(url, timeout=timeout, stream=True, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code != 200:
            return False
        with open(out, "wb") as f:
            for chunk in r.iter_content(1024 * 128):
                f.write(chunk)
        return out.stat().st_size > 1000
    except Exception:
        return False


def _pick_stock_image(prompt: str, out: Path) -> str:
    key = os.environ.get("PEXELS_API_KEY", "").strip()
    if key:
        try:
            r = requests.get(
                "https://api.pexels.com/v1/search",
                params={"query": prompt, "per_page": 8, "orientation": "landscape"},
                headers={"Authorization": key},
                timeout=TIMEOUT,
            )
            if r.ok:
                photos = r.json().get("photos", [])
                for p in photos:
                    url = (p.get("src") or {}).get("large2x")
                    if url and _download(url, out):
                        return "pexels"
        except Exception:
            pass

    key = os.environ.get("PIXABAY_API_KEY", "").strip()
    if key:
        try:
            r = requests.get(
                "https://pixabay.com/api/",
                params={"key": key, "q": prompt, "per_page": 8, "image_type": "photo", "orientation": "horizontal"},
                timeout=TIMEOUT,
            )
            if r.ok:
                hits = r.json().get("hits", [])
                for p in hits:
                    url = p.get("largeImageURL") or p.get("webformatURL")
                    if url and _download(url, out):
                        return "pixabay"
        except Exception:
            pass

    key = os.environ.get("UNSPLASH_ACCESS_KEY", "").strip()
    if key:
        try:
            r = requests.get(
                "https://api.unsplash.com/search/photos",
                params={"query": prompt, "per_page": 8, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {key}"},
                timeout=TIMEOUT,
            )
            if r.ok:
                for p in r.json().get("results", []):
                    url = (p.get("urls") or {}).get("raw")
                    if url:
                        url = url.split("?")[0] + "?w=1600&q=80"
                        if _download(url, out):
                            return "unsplash"
        except Exception:
            pass

    try:
        r = requests.get(
            f"https://r.jina.ai/https://unsplash.com/s/photos/{requests.utils.quote(prompt)}",
            headers={"Accept": "text/plain"},
            timeout=20,
        )
        if r.ok:
            urls = re.findall(r"https://images\.unsplash\.com/[^\"')\s]+", r.text)
            seen = set()
            for url in urls:
                clean = url.split("?")[0]
                if clean in seen:
                    continue
                seen.add(clean)
                if _download(clean + "?w=1600&q=80", out):
                    return "unsplash_scrape"
    except Exception:
        pass
    return ""


def fetch_image(prompt: str, out: Path) -> dict[str, Any]:
    source = _pick_stock_image(prompt, out)
    if source:
        return {"path": str(out), "source": source, "cost": PROVIDER_COST.get(source, 0.0)}
    _placeholder_image(prompt, out)
    return {"path": str(out), "source": "placeholder", "cost": 0.0}


def _placeholder_image(prompt: str, out: Path) -> None:
    import hashlib

    seed = int(hashlib.md5(prompt.encode()).hexdigest()[:8], 16)
    W, H = 1920, 1080
    palette = [(30, 58, 138), (6, 78, 122), (129, 52, 175), (5, 102, 141), (38, 50, 100), (89, 26, 100)]
    c1, c2 = palette[seed % len(palette)], palette[(seed + 3) % len(palette)]
    base = Image.new("RGB", (W, H), c1)
    grad = Image.new("L", (1, H))
    for y in range(H):
        grad.putpixel((0, y), int(255 * y / H))
    grad = grad.resize((W, H))
    overlay = Image.new("RGB", (W, H), c2)
    img = Image.composite(overlay, base, grad).convert("RGB")
    draw = ImageDraw.Draw(img)
    for i in range(6):
        cx = int((seed >> i) % W)
        cy = int(((seed >> (i + 6)) % H))
        r = 60 + int((seed >> (i + 12)) % 200)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=tuple(20 + i * 8 for _ in range(3)))
    img = img.filter(ImageFilter.GaussianBlur(radius=18))
    draw = ImageDraw.Draw(img)
    draw.text((80, 80), "AI STUDIO", fill=(255, 255, 255))
    words = prompt[:140]
    y = H - 160
    for line in _wrap(words, 46):
        draw.text((80, y), line, fill=(255, 255, 255, 220))
        y += 44
    img.save(out, "JPEG", quality=85)


def _wrap(text: str, width: int) -> list[str]:
    lines, cur = [], ""
    for word in text.split():
        if len(cur) + len(word) + 1 > width:
            lines.append(cur)
            cur = word
        else:
            cur = f"{cur} {word}".strip()
    if cur:
        lines.append(cur)
    return lines or [""]


def synthesize_narration(sections: list[dict[str, Any]], out_dir: Path) -> list[dict[str, Any]]:
    """Synthesize per-section narration. Returns list with section + audio_path + cost."""
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    voice = os.environ.get("OPENAI_TTS_VOICE", "onyx").strip()
    result = []
    if not key:
        return result
    for sec in sections:
        text = (sec.get("narration") or sec.get("subtitle_text") or "").strip()
        if not text:
            continue
        try:
            r = requests.post(
                "https://api.openai.com/v1/audio/speech",
                headers={"Authorization": f"Bearer {key}"},
                json={"model": "gpt-4o-mini-tts", "voice": voice, "input": text[:2000]},
                timeout=90,
            )
            if r.status_code == 200:
                path = out_dir / f"narration_{sec.get('index', len(result)):02d}.mp3"
                path.write_bytes(r.content)
                result.append({"section": sec.get("index"), "audio_path": str(path), "cost": PROVIDER_COST["openai_tts"]})
        except Exception:
            pass
    return result


def synthesize_music(duration: float, out: Path) -> dict[str, Any]:
    """Ambient chord pad via pure FFmpeg synthesis — zero-key background score."""
    chords = [
        (220.00, 261.63, 329.63, 392.00),
        (174.61, 220.00, 261.63, 349.23),
        (196.00, 246.94, 293.66, 349.23),
        (146.83, 220.00, 293.66, 369.99),
    ]
    chord_dur = 5.0
    parts = []
    i = 0
    pos = 0.0
    while pos < duration:
        chord = chords[i % len(chords)]
        n = min(chord_dur, duration - pos)
        exprs = "+".join(f"{f:.2f}*sin(2*PI*{f:.2f}*t)" for f in chord)
        cmd = [
            "ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc={exprs}:s=44100:d={n:.2f}",
            "-af", "lowpass=f=1200,volume=0.18,afade=t=in:d=1.2", str(out.with_name(f"chord_{i:02d}.wav")),
        ]
        _run(cmd)
        parts.append(str(out.with_name(f"chord_{i:02d}.wav")))
        pos += chord_dur
        i += 1
    if not parts:
        return {"path": "", "source": "none", "cost": 0.0}
    concat = out.with_suffix(".concat.txt")
    concat.write_text("\n".join(f"file '{p}'" for p in parts))
    _run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
          "-af", "atrim=0:%.2f,afade=t=out:st=%.2f:d=1.5" % (duration, max(0.0, duration - 1.5)),
          str(out)])
    for p in parts:
        try:
            Path(p).unlink()
        except OSError:
            pass
    try:
        concat.unlink()
    except OSError:
        pass
    return {"path": str(out), "source": "synthesized", "cost": 0.0}


def _zoompan_expr(index: int, n: int) -> str:
    if index % 4 == 0:
        return f"z='min(1.0+0.0016*on,1.22)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps=30"
    if index % 4 == 1:
        return f"z='max(1.22-0.0016*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps=30"
    if index % 4 == 2:
        return f"z='min(1.0+0.0016*on,1.22)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps=30"
    return f"z='min(1.0+0.0016*on,1.22)':x='iw-(iw/zoom)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps=30"


def build_scene_clip(index: int, image_path: str, duration: float, out: Path) -> bool:
    n = max(2, int(round(duration * 30)))
    vf = (
        "scale=1920:1080:force_original_aspect_ratio=increase,"
        "crop=1920:1080,"
        + _zoompan_expr(index, n)
        + ",format=yuv420p"
    )
    cmd = [
        "ffmpeg", "-y", "-i", image_path,
        "-filter_complex", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-t", f"{duration:.2f}", str(out),
    ]
    try:
        _run(cmd, timeout=300)
        return out.exists() and out.stat().st_size > 1000
    except Exception:
        return False


def _pad_audio_to(input_audio: str, duration: float, out: Path) -> None:
    try:
        _run([
            "ffmpeg", "-y", "-i", input_audio,
            "-af", f"apad=pad_dur={max(0.1, duration):.2f},atrim=0:{duration:.2f}",
            "-ar", "44100", "-ac", "2", str(out),
        ], timeout=120)
    except Exception:
        pass


def _silence(duration: float, out: Path) -> None:
    try:
        _run([
            "ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo",
            "-t", f"{duration:.2f}", "-c:a", "pcm_s16le", str(out),
        ], timeout=60)
    except Exception:
        pass


def _write_srt(scenes: list[dict[str, Any]]) -> str:
    lines = []
    for i, sc in enumerate(scenes):
        text = (sc.get("subtitle_text") or sc.get("title") or "").strip()
        if not text:
            continue
        start, dur = sc.get("start", 0.0), sc.get("duration", 3.0)
        a, b = start, start + dur
        lines.append(f"{len(lines) + 1}")
        lines.append(f"{_srt_ts(a)} --> {_srt_ts(b)}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines)


def _srt_ts(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def compose_video(
    scenes: list[dict[str, Any]],
    *,
    narration: list[dict[str, Any]],
    music_path: str,
    total_duration: float,
    work: Path,
    final_out: Path,
) -> dict[str, Any]:
    """Assemble final.mp4: Ken-Burns clips + narration + music + burned subtitles."""
    clips: list[str] = []
    for i, sc in enumerate(scenes):
        out = work / f"clip_{i:03d}.mp4"
        ok = build_scene_clip(i, sc["image_path"], sc["duration"], out)
        if ok:
            clips.append(str(out))

    concat_file = work / "clips.txt"
    concat_file.write_text("\n".join(f"file '{p}'" for p in clips))
    silent = work / "silence.wav"
    _silence(0.1, silent)

    narration_parts = []
    for i, sc in enumerate(scenes):
        seg = None
        for n in narration:
            if n.get("section") == sc.get("index"):
                seg = n.get("audio_path")
                break
        if seg and Path(seg).exists():
            padded = work / f"nar_seg_{i:03d}.wav"
            _pad_audio_to(seg, sc["duration"], padded)
            narration_parts.append(str(padded))
        else:
            pad = work / f"nar_sil_{i:03d}.wav"
            _silence(sc["duration"], pad)
            narration_parts.append(str(pad))

    nar_file = work / "narration.txt"
    nar_file.write_text("\n".join(f"file '{p}'" for p in narration_parts))
    _run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(nar_file), str(work / "narration.wav")], timeout=180)

    music_mixed = work / "music.wav"
    if music_path and Path(music_path).exists():
        _run([
            "ffmpeg", "-y", "-i", music_path,
            "-af", f"atrim=0:{total_duration:.2f},volume=0.13,afade=t=in:d=1,afade=t=out:st={max(0.0, total_duration - 1.5):.2f}:d=1.5",
            "-ar", "44100", "-ac", "2", str(music_mixed),
        ], timeout=120)
    else:
        _silence(total_duration, music_mixed)

    mixed = work / "mixed.wav"
    _run([
        "ffmpeg", "-y", "-i", str(work / "narration.wav"), "-i", str(music_mixed),
        "-filter_complex", "[1:a]volume=0.35[mu];[0:a][mu]amix=inputs=2:duration=first:dropout_transition=3[a]",
        "-map", "[a]", "-ar", "44100", "-ac", "2", str(mixed),
    ], timeout=180)

    concat_video = work / "concat.mp4"
    _run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file),
        "-c", "copy", str(concat_video),
    ], timeout=120)

    srt_path = work / "subtitles.srt"
    srt_path.write_text(_write_srt(scenes))
    escaped = str(srt_path).replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
    style = "FontName=Arial,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=1,Alignment=2,MarginV=42"
    try:
        _run([
            "ffmpeg", "-y", "-i", str(concat_video), "-i", str(mixed),
            "-vf", f"subtitles='{escaped}':force_style='{style}'",
            "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            "-shortest", str(final_out),
        ], timeout=600)
        return {"path": str(final_out), "ok": final_out.exists() and final_out.stat().st_size > 5000}
    except subprocess.TimeoutExpired:
        return {"path": str(final_out), "ok": False, "error": "render timed out"}
    except Exception as e:
        return {"path": str(final_out), "ok": False, "error": str(e)}
