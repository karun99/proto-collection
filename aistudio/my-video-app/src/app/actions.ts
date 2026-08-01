'use server'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { moderateText, moderationError } from './moderator'

const DATA_DIR = join(process.cwd(), '.data')
const HISTORY_FILE = join(DATA_DIR, 'generations.json')

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

interface GenerationRecord {
  id: string
  timestamp: string
  roughIdea: string
  refinedPrompt: string
  duration: number
  status: 'success' | 'failed'
  error?: string
}

interface UsageStats {
  totalGenerations: number
  successfulGenerations: number
  failedGenerations: number
  averageDuration: number
  totalApiCalls: number
}

// --- Data persistence ---

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
}

async function loadHistory(): Promise<GenerationRecord[]> {
  await ensureDataDir()
  try {
    const raw = await readFile(HISTORY_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveHistory(records: GenerationRecord[]) {
  await ensureDataDir()
  await writeFile(HISTORY_FILE, JSON.stringify(records, null, 2))
}

// --- OpenRouter ---

export async function refinePrompt(roughIdea: string): Promise<ActionResult<string>> {
  try {
    const moderation = await moderateText(roughIdea)
    if (!moderation.allowed) return { success: false, error: moderationError(moderation) }

    const key = process.env.OPENROUTER_API_KEY
    if (!key) return { success: false, error: 'Server config error: OPENROUTER_API_KEY not set' }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content:
              'You write concise, vivid prompts for text-to-video AI models. ' +
              'Given a rough idea, output ONE refined prompt (2-3 sentences max) ' +
              'describing subject, setting, camera movement, and mood. ' +
              'Only use original/generic subjects. Output only the prompt, no preamble.',
          },
          { role: 'user', content: roughIdea },
        ],
        max_tokens: 150,
      }),
    })

    if (!res.ok) return { success: false, error: `OpenRouter API ${res.status}: ${await res.text()}` }

    const data = await res.json()
    const refined = data.choices[0].message.content.trim()
    const outputModeration = await moderateText(refined)
    if (!outputModeration.allowed) return { success: false, error: moderationError(outputModeration) }
    return { success: true, data: refined }
  } catch (err) {
    return { success: false, error: `Prompt refinement failed: ${err instanceof Error ? err.message : String(err)}` }
  }
}

// --- NVIDIA ---

export async function generateVideo(prompt: string): Promise<ActionResult<string>> {
  try {
    const moderation = await moderateText(prompt)
    if (!moderation.allowed) return { success: false, error: moderationError(moderation) }

    const key = process.env.NVIDIA_API_KEY
    if (!key) return { success: false, error: 'Server config error: NVIDIA_API_KEY not set' }

    const invokeUrl = 'https://ai.api.nvidia.com/v1/cosmos/nvidia/cosmos-1.0-7b-diffusion-text2world'
    const statusUrl = 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/'

    const payload = {
      inputs: [
        { name: 'text2world', shape: [1], datatype: 'BYTES', data: [`text2world --prompt="${prompt}"`] },
      ],
      outputs: [{ name: 'status', datatype: 'BYTES', shape: [1] }],
    }

    const headers = {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    let res = await fetch(invokeUrl, { method: 'POST', headers, body: JSON.stringify(payload) })
    if (!res.ok) return { success: false, error: `NVIDIA API ${res.status}: ${await res.text()}` }

    let attempts = 0
    while (res.status === 202 && attempts < 60) {
      const requestId = res.headers.get('NVCF-REQID')
      if (!requestId) return { success: false, error: 'No NVCF-REQID header in NVIDIA response' }
      await new Promise((r) => setTimeout(r, 5000))
      res = await fetch(statusUrl + requestId, { method: 'GET', headers })
      if (!res.ok) break
      attempts++
    }

    if (res.status === 202) return { success: false, error: 'Video generation timed out after 5 minutes' }

    const data = await res.json()
    const videoUrl = data.video || data.video_url || (data.b64_video ? `data:video/mp4;base64,${data.b64_video}` : null)
    if (videoUrl) return { success: true, data: videoUrl }

    return { success: false, error: 'Unexpected NVIDIA response: ' + JSON.stringify(Object.keys(data)) }
  } catch (err) {
    return { success: false, error: `Video generation failed: ${err instanceof Error ? err.message : String(err)}` }
  }
}

// --- Unsplash via Agent-Reach pattern (Jina Reader, no API key) ---

const JINA_BASE = 'https://r.jina.ai'

interface UnsplashImage {
  id: string
  url: string
  thumb: string
  small: string
  alt: string
}

async function scrapeUnsplash(url: string): Promise<UnsplashImage[]> {
  const resp = await fetch(`${JINA_BASE}/${encodeURI(url)}`, {
    headers: { Accept: 'text/plain' },
  })
  if (!resp.ok) throw new Error(`Unsplash HTTP ${resp.status}`)
  const text = await resp.text()
  const images: UnsplashImage[] = []
  const re = /images\.unsplash\.com\/[^"'\s)]+/g
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const url = m[0]
    const clean = url.split('?')[0]
    if (!seen.has(clean)) {
      seen.add(clean)
      images.push({
        id: `us_${images.length}`,
        url: clean,
        thumb: `${clean}?w=200&h=200&fit=crop`,
        small: `${clean}?w=600`,
        alt: 'Unsplash image',
      })
    }
  }
  return images.slice(0, 30)
}

export async function searchUnsplash(query: string): Promise<ActionResult<UnsplashImage[]>> {
  try {
    const moderation = await moderateText(query)
    if (!moderation.allowed) return { success: false, error: moderationError(moderation) }
    const images = await scrapeUnsplash(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`)
    return { success: true, data: images }
  } catch (err) {
    return { success: false, error: `Unsplash search failed: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function getPopularUnsplash(): Promise<ActionResult<UnsplashImage[]>> {
  try {
    const images = await scrapeUnsplash('https://unsplash.com')
    return { success: true, data: images }
  } catch (err) {
    return { success: false, error: `Unsplash fetch failed: ${err instanceof Error ? err.message : String(err)}` }
  }
}

// --- Data tracking ---

export async function saveGeneration(record: Omit<GenerationRecord, 'id' | 'timestamp'>): Promise<void> {
  const history = await loadHistory()
  history.unshift({
    id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...record,
  })
  await saveHistory(history.slice(0, 500))
}

export async function getGenerationHistory(): Promise<GenerationRecord[]> {
  return loadHistory()
}

export async function getUsageStats(): Promise<UsageStats> {
  const history = await loadHistory()
  const total = history.length
  const successful = history.filter((r) => r.status === 'success').length
  const failed = history.filter((r) => r.status === 'failed').length
  const avgDur = total > 0 ? history.reduce((s, r) => s + r.duration, 0) / total : 0

  return {
    totalGenerations: total,
    successfulGenerations: successful,
    failedGenerations: failed,
    averageDuration: Math.round(avgDur),
    totalApiCalls: total * 2,
  }
}

export async function clearHistory(): Promise<void> {
  await saveHistory([])
}

export async function exportHistoryCsv(): Promise<ActionResult<string>> {
  const history = await loadHistory()
  if (history.length === 0) return { success: false, error: 'No data to export' }

  const header = 'id,timestamp,roughIdea,refinedPrompt,duration,status,error'
  const rows = history.map((r) =>
    `"${r.id}","${r.timestamp}","${(r.roughIdea || '').replace(/"/g, '""')}","${(r.refinedPrompt || '').replace(/"/g, '""')}",${r.duration},"${r.status}","${(r.error || '').replace(/"/g, '""')}"`
  )

  return { success: true, data: [header, ...rows].join('\n') }
}
