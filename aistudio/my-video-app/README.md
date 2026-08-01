# AI Studio — Data-Driven Media Creator

> AI Studio is a data-driven media creation platform built with Next.js, React, and TypeScript. It combines **AI video generation**, **stock image search** (via Agent-Reach), and **usage analytics** in one dashboard. No API key needed for stock images.

## Features

### 🎬 Studio — AI Video Generation
- **OpenRouter** refines your rough idea into a detailed prompt
- **NVIDIA AI** generates the video
- **FFmpeg WASM** adds title overlays in-browser

### 🖼️ Images — Stock Photo Search
- Search millions of free stock photos via **Agent-Reach** (Unsplash channel)
- Browse popular images, search by keyword
- Preview and download high-resolution images
- **No API key required** — uses Jina Reader for web access

### 📊 Data — Usage Analytics
- Track every generation (timestamp, duration, status)
- View aggregate stats (total, success rate, avg duration, API calls)
- Export generation history as CSV
- Clear history on demand

### 🛡️ Content Moderation — NSFW Safe
- **Two-layer safety gate** on every input and every AI-generated artifact
- Deterministic blocklist with **leet-speak obfuscation detection** (always on, no API key)
- **AI semantic review** via OpenRouter when a key is configured
- Blocks sexually explicit, gore/violence, self-harm, hate, and illegal content
- Wired into: prompt refinement, video generation, stock-image search (frontend) and every pipeline stage (backend: research, proposal, script, scene plan)
- Backend rejects NSFW prompts with HTTP 400 and exposes a standalone `/api/moderate` endpoint

## Developer

**Sai Karun Nandipati**
Portfolio: [http://karun99.github.io](http://karun99.github.io)

## Company

**Guiding Key**
Website: [http://guidingkey.com](http://guidingkey.com)

## License

MIT — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Sai Karun Nandipati, Guiding Key Team

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **OpenRouter API key** — https://openrouter.ai/keys
- **NVIDIA API key** — https://build.nvidia.com/
- Stock images via Unsplash use Agent-Reach (no API key needed)

## Installation

```bash
cd aistudio/my-video-app
npm install
cp .env.local.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Studio
1. Enter a rough video idea in the text area
2. Click **Generate Video**
3. OpenRouter refines → NVIDIA generates → FFmpeg processes
4. Optionally add a title overlay and download

### Images
1. Switch to the **Images** tab
2. Browse popular photos or search by keyword
3. Click any image to preview and download

### Data
1. Switch to the **Data** tab to view generation history
2. Check usage stats at a glance
3. Export data as CSV or clear history

## Project Structure

```
ai-studio/
├── src/
│   └── app/
│       ├── actions.ts      # Server actions (OpenRouter, NVIDIA, Unsplash via Agent-Reach, data)
│       ├── moderator.ts    # Two-layer NSFW moderator (blocklist + AI review)
│       ├── globals.css     # Global styles (Tailwind CSS)
│       ├── layout.tsx      # Root layout
│       └── page.tsx        # Main UI with 3 tabs (client component)
├── backend/
│   ├── app.py              # FastAPI server (OpenMontage production pipeline)
│   ├── moderator.py        # Backend content moderator (blocks NSFW at every stage)
│   ├── orchestrator.py     # Stage runner (research → … → publish) with moderation gates
│   ├── store.py            # Production store + SSE event bus
│   ├── media.py            # Asset sourcing + FFmpeg composition
│   ├── budget.py           # Cost ledger with cap enforcement
│   └── openmontage/        # Pipeline manifests, skills, schemas, tools
├── public/                  # Static assets
├── .data/                   # Generation history (created at runtime)
├── .env.local               # Environment variables (API keys)
├── .env.local.example       # Environment template
├── eslint.config.mjs        # ESLint flat config
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.mjs       # PostCSS config (Tailwind)
├── tsconfig.json            # TypeScript configuration
└── LICENSE                  # MIT License
```

## Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `OPENROUTER_API_KEY` | Yes | https://openrouter.ai/keys |
| `NVIDIA_API_KEY` | Yes | https://build.nvidia.com/ |

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict)
- **UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Prompt Refinement:** [OpenRouter](https://openrouter.ai/)
- **Video Generation:** [NVIDIA AI](https://build.nvidia.com/)
- **Video Processing:** [FFmpeg WASM](https://github.com/ffmpegwasm/ffmpeg.wasm)
- **Stock Images:** Agent-Reach Unsplash Channel (Jina Reader)
- **Data Storage:** Local JSON files (`.data/` directory)

## Deployment

### Netlify
```bash
npm run build
netlify deploy --prod
```

### Vercel
```bash
npx vercel
```

## Acknowledgments

- Built by [Sai Karun Nandipati](http://karun99.github.io) at [Guiding Key](http://guidingkey.com)
- Stock photos via [Unsplash](https://unsplash.com) (accessed through Agent-Reach)
- Internet channel layer by [Agent-Reach](https://github.com/Panniantong/Agent-Reach)
