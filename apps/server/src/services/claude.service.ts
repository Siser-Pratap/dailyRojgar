import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env'
import { logger } from '../utils/logger'

// Lazily construct a single client. `undefined` = not yet resolved,
// `null` = no API key configured (AI features degrade to rule-based).
let client: Anthropic | null | undefined

function getClient(): Anthropic | null {
  if (client !== undefined) return client
  client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null
  return client
}

export function isClaudeEnabled(): boolean {
  return Boolean(env.ANTHROPIC_API_KEY)
}

/**
 * Generates a short, first-person worker bio with Claude. Returns null when
 * Claude is not configured or the call fails, so callers can fall back.
 */
export async function generateWorkerBio(input: {
  categoryId?: string
  skills: string[]
  currentBio?: string
}): Promise<string | null> {
  const anthropic = getClient()
  if (!anthropic) return null

  const prompt = `You help a daily-wage worker on an Indian gig-work marketplace write a trustworthy profile bio.
Category: ${input.categoryId ?? 'general work'}
Skills: ${input.skills.join(', ') || 'not specified'}
Current bio: ${input.currentBio?.trim() || '(none)'}

Write a concise, first-person bio (2-3 sentences, max 60 words) highlighting experience, key skills, and reliability. Plain text only — no markdown, no preamble. Return only the bio.`

  try {
    const message = await anthropic.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content.find((b) => b.type === 'text')
    return block && block.type === 'text' ? block.text.trim() : null
  } catch (error) {
    logger.warn('Claude bio generation failed; using rule-based fallback', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}
