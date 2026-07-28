# S-AI v5.0 — Multi-Agent Swarm Intelligence

> **Status:** Published to npm as `@saikarun/s-ai@5.0.1`
> **License:** MIT | **Platform:** Node.js >= 18 | **Module:** ESM (TypeScript)

```
  ╔═══════════════════════════════════════════════╗
  ║  S-AI v5.0 - Multi-Agent Swarm Intelligence  ║
  ╚═══════════════════════════════════════════════╝
```

A CLI-first multi-agent swarm system with **neural mapping (Digital Twin persona adaptation)**, crawl4ai web scraping, MCP integration, knowledge graph, and bias-reduced consensus. Coordinates 6 specialized AI agents that analyze from different perspectives to reduce bias, then adapts its communication style to match the user's persona.

**No advanced hardware required** — runs on any device with a browser or Node.js. Zero inference cost with OpenRouter free models. Your data stays on your device.

## Quick Start

```bash
npm install -g @saikarun/s-ai@latest    # Global install
npx @saikarun/s-ai ask "What are the pros and cons of microservices?"  # Or run directly
s-ai setup                               # Interactive setup wizard
s-ai serve                               # Start web dashboard
```

## What's in v5.0

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

## Neural Mapping (Digital Twin)

Create a user persona and S-AI's swarm agents adapt their communication style:

```bash
s-ai persona set "Alice" "Senior architect who values simplicity"
s-ai persona show
s-ai persona node link "Architecture Philosophy" "https://example.com/simple-is-better"
s-ai ask "Should we migrate to microservices?"   # Response adapts to Alice's style
s-ai persona clear
```

## How the Swarm Works

6 agents collaborate per query:

| Agent | Role |
|-------|------|
| **Orchestrator** | Plans analysis tasks |
| **Researcher** | crawl4ai web scraping |
| **Analyst A** | Supporting arguments |
| **Analyst B** | Counter-arguments (devil's advocate) |
| **Critic** | Bias detection |
| **Synthesizer** | Final balanced synthesis (persona-adapted) |

## CLI Commands

```
Core:        s-ai ask | setup | serve | status | help
Neural:      s-ai persona set | show | clear | node | profiles
Swarm:       s-ai swarm status | reset | agents
Graph:       s-ai graph query | stats | store
Research:    s-ai crawl | search
MCP:         s-ai mcp serve | tools | servers
Providers:   s-ai provider list | set | test | models | model
Skills:      s-ai skill list | install | remove
AI Engine:   s-ai engine build | skill | mcp | swarm | list | ui
Config:      s-ai config | get | set | init | setup
```

## Supported Providers

OpenRouter (100+ models), OpenAI, Anthropic, Google AI, Ollama (local), Nvidia, Cohere, Grok (xAI), Kimi, Pi, Together AI, Fireworks AI, AWS Bedrock, Claude on AWS, Vertex AI, Azure Foundry, KoboldCPP, Oobabooga, MLC LLM, OpenAI-Compatible.

## Programmatic Usage

```typescript
import { Swarm, NeuralMap, getNeuralMap } from '@saikarun/s-ai';

const neuralMap = getNeuralMap();
neuralMap.setProfile({ name: 'Alice', bio: 'Senior architect' });

const swarm = new Swarm();
swarm.setPersonaContext(neuralMap.buildPersonaContext());
const result = await swarm.run('Should we use microservices?');
```

## Package Exports

```typescript
import { Swarm, Agent, NeuralMap, KnowledgeGraph, CrawlEngine } from '@saikarun/s-ai';
import { Swarm } from '@saikarun/s-ai/swarm';
import { Agent } from '@saikarun/s-ai/agent';
import { NeuralMap, getNeuralMap } from '@saikarun/s-ai/neural';
import { getConfig } from '@saikarun/s-ai/config';
import { createProvider } from '@saikarun/s-ai/providers';
import { KnowledgeGraph } from '@saikarun/s-ai/graph';
import { CrawlEngine } from '@saikarun/s-ai/crawl';
import { createSwarmMcpServer } from '@saikarun/s-ai/mcp';
import { getMcpClientManager } from '@saikarun/s-ai/mcp/client';
```

## Configuration

Config: `~/.config/s-ai/config.json`

```json
{
  "providers": { "primary": "openrouter", "fallback": "ollama" },
  "swarm": { "maxAgents": 6, "consensusThreshold": 0.7, "maxRounds": 3 },
  "neuralMap": { "enabled": true, "persistAcrossSessions": true },
  "crawl4ai": { "enabled": true, "method": "playwright" },
  "memory": { "backend": "graph", "maxNodes": 10000 },
  "mcp": { "enabled": true, "transport": "stdio" }
}
```

## Study Buddy (S-AI Feature — v5.0)

A study companion built into S-AI. Access at `http://localhost:3000/study-buddy.html` after `s-ai serve`.

- **Teach-the-bot loop** — student teaches a virtual bot, bot levels up (protégé effect)
- **Study Mentor mode** — 6 personas: Homework, Explain, Career, Resume, References, Pitch
- **3-layer session limiting** — per-session cap + cooldown + daily cap
- **Summary export** — PDF/PPTX/Voice session recap
- **Model routing** — auto-routes to free OpenRouter models with fallback
- **Voice I/O** — browser speech recognition + synthesis
- **Privacy-first** — data stays local, honest privacy claims
- **No advanced hardware required** — works on any device with a browser

## Environment Variables

`OPENROUTER_API_KEY` | `OPENAI_API_KEY` | `ANTHROPIC_API_KEY` | `GOOGLE_API_KEY` | `OLLAMA_BASE_URL` | `NVIDIA_API_KEY` | `AWS_BEDROCK_REGION` | `AWS_ACCESS_KEY_ID` | `AWS_SECRET_ACCESS_KEY` | `AWS_SESSION_TOKEN` | `CLAUDE_AWS_API_KEY` | `VERTEX_AI_PROJECT_ID` | `VERTEX_AI_REGION` | `VERTEX_AI_ACCESS_TOKEN` | `FOUNDRY_RESOURCE` | `FOUNDRY_API_KEY` | `TOGETHER_API_KEY` | `FIREWORKS_API_KEY` | `COHERE_API_KEY` | `GROK_API_KEY` | `KIMI_API_KEY` | `PI_API_KEY` | `OPENAI_COMPATIBLE_BASE_URL` | `OPENAI_COMPATIBLE_API_KEY` | `SAI_PRIMARY_PROVIDER`

## License

MIT
