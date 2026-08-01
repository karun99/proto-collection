/**
 * AI Studio content moderator.
 *
 * Two-layer safety gate used by every server action:
 *   1. Deterministic keyword / leet-speak blocklist (always on, no keys needed).
 *   2. LLM semantic review via OpenRouter (optional, only when an API key exists).
 *
 * Any text that fails either layer is rejected — NSFW content never reaches a
 * model provider or the UI.
 */

export interface ModerationResult {
  allowed: boolean
  category?: string
  reason?: string
  matched?: string
}

const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  $: 's',
  '!': 'i',
  '+': '',
  _: ' ',
  '-': ' ',
  '.': ' ',
}

export interface BlockedTerm {
  term: string
  category: string
}

const BLOCKED_TERMS: BlockedTerm[] = [
  { term: 'porn', category: 'sexually-explicit' },
  { term: 'porno', category: 'sexually-explicit' },
  { term: 'pornography', category: 'sexually-explicit' },
  { term: 'x rated', category: 'sexually-explicit' },
  { term: 'adult content', category: 'sexually-explicit' },
  { term: 'nude', category: 'sexually-explicit' },
  { term: 'nudity', category: 'sexually-explicit' },
  { term: 'naked', category: 'sexually-explicit' },
  { term: 'topless', category: 'sexually-explicit' },
  { term: 'bottomless', category: 'sexually-explicit' },
  { term: 'naked body', category: 'sexually-explicit' },
  { term: 'sextape', category: 'sexually-explicit' },
  { term: 'sex tape', category: 'sexually-explicit' },
  { term: 'masturbat', category: 'sexually-explicit' },
  { term: 'fellatio', category: 'sexually-explicit' },
  { term: 'cunnilingus', category: 'sexually-explicit' },
  { term: 'oral sex', category: 'sexually-explicit' },
  { term: 'anal sex', category: 'sexually-explicit' },
  { term: 'sexually explicit', category: 'sexually-explicit' },
  { term: 'explicit content', category: 'sexually-explicit' },
  { term: 'erotic', category: 'sexually-explicit' },
  { term: 'erotica', category: 'sexually-explicit' },
  { term: 'hardcore', category: 'sexually-explicit' },
  { term: 'pornhub', category: 'sexually-explicit' },
  { term: 'onlyfans', category: 'sexually-explicit' },
  { term: 'only fans', category: 'sexually-explicit' },
  { term: 'camgirl', category: 'sexually-explicit' },
  { term: 'camsite', category: 'sexually-explicit' },
  { term: 'escort', category: 'sexually-explicit' },
  { term: 'prostitut', category: 'sexually-explicit' },
  { term: 'prostitution', category: 'sexually-explicit' },
  { term: 'stripper', category: 'sexually-explicit' },
  { term: 'striptease', category: 'sexually-explicit' },
  { term: 'strip tease', category: 'sexually-explicit' },
  { term: 'hentai', category: 'sexually-explicit' },
  { term: 'yaoi', category: 'sexually-explicit' },
  { term: 'yuri', category: 'sexually-explicit' },
  { term: 'futanari', category: 'sexually-explicit' },
  { term: 'lolicon', category: 'sexually-explicit' },
  { term: 'rule34', category: 'sexually-explicit' },
  { term: 'rule 34', category: 'sexually-explicit' },
  { term: 'milf', category: 'sexually-explicit' },
  { term: 'nsfw', category: 'sexually-explicit' },
  { term: 'shemale', category: 'sexually-explicit' },
  { term: 'blowjob', category: 'sexually-explicit' },
  { term: 'handjob', category: 'sexually-explicit' },
  { term: 'deepthroat', category: 'sexually-explicit' },
  { term: 'squirt', category: 'sexually-explicit' },
  { term: 'cumshot', category: 'sexually-explicit' },
  { term: 'creampie', category: 'sexually-explicit' },
  { term: 'gangbang', category: 'sexually-explicit' },
  { term: 'threesome', category: 'sexually-explicit' },
  { term: 'orgy', category: 'sexually-explicit' },
  { term: 'kamasutra', category: 'sexually-explicit' },
  { term: 'bdsm', category: 'sexually-explicit' },
  { term: 'bondage', category: 'sexually-explicit' },
  { term: 'fetish', category: 'sexually-explicit' },
  { term: 'fetishism', category: 'sexually-explicit' },
  { term: 'penis', category: 'sexually-explicit' },
  { term: 'vagina', category: 'sexually-explicit' },
  { term: 'breasts', category: 'sexually-explicit' },
  { term: 'buttocks', category: 'sexually-explicit' },
  { term: 'genitals', category: 'sexually-explicit' },
  { term: 'genitalia', category: 'sexually-explicit' },
  { term: 'phallus', category: 'sexually-explicit' },
  { term: 'cleavage', category: 'sexually-explicit' },
  { term: 'lingerie', category: 'sexually-explicit' },
  { term: 'thong', category: 'sexually-explicit' },
  { term: 'gore', category: 'violent' },
  { term: 'snuff', category: 'violent' },
  { term: 'beheading', category: 'violent' },
  { term: 'decapitat', category: 'violent' },
  { term: 'mutilat', category: 'violent' },
  { term: 'dismember', category: 'violent' },
  { term: 'bloodbath', category: 'violent' },
  { term: 'massacre', category: 'violent' },
  { term: 'genocide', category: 'violent' },
  { term: 'torture', category: 'violent' },
  { term: 'execution footage', category: 'violent' },
  { term: 'suicide', category: 'self-harm' },
  { term: 'self harm', category: 'self-harm' },
  { term: 'self harm methods', category: 'self-harm' },
  { term: 'cutting wrists', category: 'self-harm' },
  { term: 'kill yourself', category: 'self-harm' },
  { term: 'kill myself', category: 'self-harm' },
  { term: 'child porn', category: 'child-exploitation' },
  { term: 'cp (children)', category: 'child-exploitation' },
  { term: 'child sexual', category: 'child-exploitation' },
  { term: 'pedophile', category: 'child-exploitation' },
  { term: 'pedophilia', category: 'child-exploitation' },
  { term: 'paedophile', category: 'child-exploitation' },
  { term: 'paedophilia', category: 'child-exploitation' },
  { term: 'underage sex', category: 'child-exploitation' },
  { term: 'minor sex', category: 'child-exploitation' },
  { term: 'rape', category: 'violent' },
  { term: 'sexual assault', category: 'violent' },
  { term: 'molest', category: 'violent' },
  { term: 'drugs for sale', category: 'illegal' },
  { term: 'buy cocaine', category: 'illegal' },
  { term: 'buy heroin', category: 'illegal' },
  { term: 'synthesize drugs', category: 'illegal' },
  { term: 'bomb making', category: 'illegal' },
  { term: 'explosives instructions', category: 'illegal' },
  { term: 'credit card fraud', category: 'illegal' },
  { term: 'hate speech', category: 'hate' },
  { term: 'racial slur', category: 'hate' },
  { term: 'slur', category: 'hate' },
]

const BLOCKLIST = BLOCKED_TERMS.map((b) => b.term.toLowerCase())

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => LEET_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function blocklistCheck(text: string): ModerationResult {
  const normalized = normalizeText(text)
  for (const entry of BLOCKED_TERMS) {
    const term = entry.term.toLowerCase()
    if (normalized.includes(term)) {
      return {
        allowed: false,
        category: entry.category,
        reason: `Blocked term detected: "${entry.term}"`,
        matched: entry.term,
      }
    }
  }
  return { allowed: true }
}

export function blocklistCheckAll(texts: string[]): ModerationResult {
  for (const t of texts) {
    if (!t) continue
    const result = blocklistCheck(t)
    if (!result.allowed) return result
  }
  return { allowed: true }
}

const MODERATION_SYSTEM_PROMPT = `You are an expert content safety moderator for an AI media studio.
Your job is to decide whether a piece of text is SAFE for a general audience.
Flag content that is sexually explicit, pornographic, nude/erotic, gory, promoting violence,
self-harm, hate speech, or otherwise NSFW (not safe for work).
Everyday topics like education, health, nature, cooking, sports, or casual language are SAFE.
Medical or anatomical words used in a neutral, scientific context are SAFE.
Respond with ONLY valid JSON: {"safe": true|false, "category": "string|null", "reason": "string|null"}.`

interface LLMJudgeResult {
  safe: boolean
  category?: string | null
  reason?: string | null
}

async function llmJudge(text: string): Promise<LLMJudgeResult | null> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: MODERATION_SYSTEM_PROMPT },
          { role: 'user', content: text.slice(0, 2000) },
        ],
        max_tokens: 120,
        temperature: 0,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content ?? ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end <= start) return null
    const parsed = JSON.parse(raw.slice(start, end + 1)) as LLMJudgeResult
    return { safe: parsed.safe !== false, category: parsed.category ?? null, reason: parsed.reason ?? null }
  } catch {
    return null
  }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || !text.trim()) return { allowed: true }

  const blocklist = blocklistCheck(text)
  if (!blocklist.allowed) return blocklist

  const judge = await llmJudge(text)
  if (judge && !judge.safe) {
    return {
      allowed: false,
      category: judge.category ?? 'nsfw',
      reason: judge.reason ?? 'Content flagged by AI moderation',
    }
  }
  return { allowed: true }
}

export async function moderateTexts(texts: string[]): Promise<ModerationResult> {
  const nonEmpty = texts.filter((t) => t && t.trim())
  const blocklist = blocklistCheckAll(nonEmpty)
  if (!blocklist.allowed) return blocklist
  for (const t of nonEmpty) {
    const result = await moderateText(t)
    if (!result.allowed) return result
  }
  return { allowed: true }
}

export function moderationError(result: ModerationResult): string {
  const category = result.category ? result.category.replace(/-/g, ' ') : 'nsfw'
  return `Moderation blocked: this content was flagged as ${category}. Please revise your request to keep it family-friendly.`
}
