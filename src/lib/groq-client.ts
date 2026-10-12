export interface GroqGenerateOptions {
  prompt: string
  systemPrompt?: string
  task?: 'spec' | 'whatsapp' | 'chat'
  model?: string
}

export interface GroqResponse {
  content?: string
  error?: string
  requiresKey?: boolean
  model?: string
}

export function getStoredGroqKey(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('groq_api_key') || ''
}

export function setStoredGroqKey(key: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('groq_api_key', key.trim())
}

export async function generateWithGroq(options: GroqGenerateOptions): Promise<GroqResponse> {
  const apiKey = getStoredGroqKey()

  try {
    const res = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        apiKey: apiKey || undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return {
        error: data.error || 'Groq API request failed',
        requiresKey: Boolean(data.requiresKey),
      }
    }

    return {
      content: data.content,
      model: data.model,
    }
  } catch (err: any) {
    return {
      error: err?.message || 'Network error connecting to Groq API route',
    }
  }
}
