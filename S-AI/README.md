# S-AI v5.1 — Multi-Agent Swarm Intelligence

> **Status:** Published to npm as `@saikarun/s-ai@5.1.0`
> **License:** MIT | **Platform:** Node.js >= 18 | **Module:** ESM (TypeScript)

```
  ╔═══════════════════════════════════════════════╗
  ║  S-AI v5.1 - Multi-Agent Swarm Intelligence  ║
  ╚═══════════════════════════════════════════════╝
```

A CLI-first multi-agent swarm system with **neural mapping (Digital Twin persona adaptation)**, **Research Mapper (Paperscape-style arXiv visualization)**, **Bhashini multilingual AI**, crawl4ai web scraping, MCP integration, knowledge graph, and bias-reduced consensus. Coordinates 6 specialized AI agents that analyze from different perspectives to reduce bias, then adapts its communication style to match the user's persona.

**No advanced hardware required** — runs on any device with a browser or Node.js. Zero inference cost with OpenRouter free models. Your data stays on your device.

## Quick Start

```bash
npm install -g @saikarun/s-ai@latest    # Global install
npx @saikarun/s-ai ask "What are the pros and cons of microservices?"  # Or run directly
s-ai setup                               # Interactive setup wizard
s-ai serve                               # Start web dashboard
```

## What's in v5.1

| Feature | Status |
|---------|--------|
| 6-agent swarm with bias-reduced consensus | Done |
| Neural mapping (Digital Twin persona) | Done |
| 20+ AI provider support (OpenRouter, OpenAI, Anthropic, Google, Ollama, etc.) | Done |
| crawl4ai web scraping | Done |
| MCP server + client integration | Done |
| Knowledge graph persistence | Done |
| AI Engine (prompt-to-app builder) | Done |
| Web dashboard with 4 themes | Done |
| Voice I/O (browser speech API) | Done |
| TypeScript migration (ESM) | Done |
| **Study Buddy** (teach-the-bot + mentor + session limits) | Done |
| **Research Mapper** (Paperscape-style arXiv citation graph) | **New in 5.1** |
| **Bhashini Multilingual AI** (translation, TTS, ASR for Indian languages) | **New in 5.1** |

## Research Mapper (Paperscape-style)

Visualize academic papers as an interactive force-directed citation graph — inspired by Paperscape.

```bash
s-ai research search "quantum computing transformers"   # Search arXiv
s-ai research graph 2301.12345,2302.67890                # Build citation graph from IDs
s-ai research map                                        # Open visualization dashboard
```

Features:
- **Force-directed graph**: papers are circles sized by citations, connected by reference edges
- **Color-coded by arXiv category** (hep-th red, astro-ph blue, quant-ph purple, etc.)
- **Interactive**: drag nodes, scroll to zoom, double-click to reset, click for details
- **Category filters**: filter results by arXiv category
- **S-AI Swarm integration**: click "Analyze with S-AI Swarm" on any paper for AI-powered analysis
- **Server endpoints**: `GET /api/research/search`, `GET /api/research/graph`

## Bhashini Multilingual AI

India's national language AI platform integrated directly into S-AI. Translate, transcribe, and synthesize speech across 22 Indian languages.

```bash
export BHASHINI_API_KEY=your-key
s-ai bhashini translate "Hello, how are you?" hi          # English -> Hindi
s-ai bhashini translate "Namaste" hi en                   # Hindi -> English
s-ai bhashini status                                      # Check connection
s-ai bhashini pipelines                                    # List available pipelines
```

API endpoints:
- `POST /api/bhashini/translate` — NMT translation (en, hi, ta, te, bn, mr, gu, etc.)
- `POST /api/bhashini/tts` — Text-to-speech (returns base64 audio)
- `POST /api/bhashini/asr` — Speech-to-text

ClI Bhashini tools for swarm agents:
- `bhashini_translate` — Translate text between Indian languages
- `bhashini_tts` — Convert text to speech
- `bhashini_asr` — Transcribe audio to text

## CLI Commands

```
Core:        s-ai ask | setup | serve | status | help
Neural:      s-ai persona set | show | clear | node | profiles
Swarm:       s-ai swarm status | reset | agents
Graph:       s-ai graph query | stats | store
Research:    s-ai research search | map | graph
Bhashini:    s-ai bhashini translate | status | pipelines
Web:         s-ai crawl | search
MCP:         s-ai mcp serve | tools | servers
Providers:   s-ai provider list | set | test | models | model
Skills:      s-ai skill list | install | remove
AI Engine:   s-ai engine build | skill | mcp | swarm | list | ui
Config:      s-ai config | get | set | init | setup
```

## Supported Providers

OpenRouter (100+ models), OpenAI, Anthropic, Google AI, Ollama (local), Nvidia, Cohere, Grok (xAI), Kimi, Pi, Together AI, Fireworks AI, AWS Bedrock, Claude on AWS, Vertex AI, Azure Foundry, KoboldCPP, Oobabooga, MLC LLM, OpenAI-Compatible, **Bhashini (multilingual)**.

## Programmatic Usage

```typescript
import { Swarm, NeuralMap, searchArxiv, buildCitationGraph, getBhashiniProvider } from '@saikarun/s-ai';

// Neural mapping
const neuralMap = getNeuralMap();
neuralMap.setProfile({ name: 'Alice', bio: 'Senior architect' });

// Swarm
const swarm = new Swarm();
swarm.setPersonaContext(neuralMap.buildPersonaContext());
const result = await swarm.run('Should we use microservices?');

// Research Mapper
const arxivResult = await searchArxiv('quantum machine learning', 0, 10);
const graph = buildCitationGraph(arxivResult.papers);
console.log(`${graph.nodes} papers, ${graph.edges} citations`);

// Bhashini translation
const bhashini = getBhashiniProvider();
const translated = await bhashini.translate('Hello', 'en', 'hi');
console.log(translated.targetText); // नमस्ते
```

## Package Exports

```typescript
// Core
import { Swarm } from '@saikarun/s-ai/swarm';
import { Agent } from '@saikarun/s-ai/agent';
import { NeuralMap, getNeuralMap } from '@saikarun/s-ai/neural';
import { getConfig } from '@saikarun/s-ai/config';
import { createProvider } from '@saikarun/s-ai/providers';
import { KnowledgeGraph } from '@saikarun/s-ai/graph';
import { CrawlEngine } from '@saikarun/s-ai/crawl';
import { createSwarmMcpServer } from '@saikarun/s-ai/mcp';
import { getMcpClientManager } from '@saikarun/s-ai/mcp/client';

// Research Mapper (v5.1)
import { searchArxiv, buildCitationGraph } from '@saikarun/s-ai/arxiv';

// Bhashini Multilingual AI (v5.1)
import { getBhashiniProvider, BhashiniProvider } from '@saikarun/s-ai/bhashini';
import { getBhashiniTools } from '@saikarun/s-ai/bhashini/tools';
```

## Environment Variables

`OPENROUTER_API_KEY` | `OPENAI_API_KEY` | `ANTHROPIC_API_KEY` | `GOOGLE_API_KEY` | `OLLAMA_BASE_URL` | `NVIDIA_API_KEY` | `AWS_BEDROCK_REGION` | `AWS_ACCESS_KEY_ID` | `AWS_SECRET_ACCESS_KEY` | `AWS_SESSION_TOKEN` | `CLAUDE_AWS_API_KEY` | `VERTEX_AI_PROJECT_ID` | `VERTEX_AI_REGION` | `VERTEX_AI_ACCESS_TOKEN` | `FOUNDRY_RESOURCE` | `FOUNDRY_API_KEY` | `TOGETHER_API_KEY` | `FIREWORKS_API_KEY` | `COHERE_API_KEY` | `GROK_API_KEY` | `KIMI_API_KEY` | `PI_API_KEY` | `OPENAI_COMPATIBLE_BASE_URL` | `OPENAI_COMPATIBLE_API_KEY` | `SAI_PRIMARY_PROVIDER` | `BHASHINI_API_KEY` | `BHASHINI_USER_ID` | `BHASHINI_PIPELINE_ID`

## License

MIT
