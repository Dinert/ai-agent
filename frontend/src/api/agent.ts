import type { AgentStatus, ChatResponse, KnowledgeSource } from '@/types/chat'

export async function fetchAgentStatus(): Promise<AgentStatus> {
  const res = await fetch('/ai-agent/api/health')
  if (!res.ok) throw new Error('Failed to fetch agent status')
  return res.json()
}

export async function fetchKnowledgeSources(): Promise<KnowledgeSource[]> {
  const res = await fetch('/ai-agent/api/knowledge')
  if (!res.ok) throw new Error('Failed to fetch knowledge sources')
  const data = await res.json()
  return data.sources
}

export async function sendQuestion(
  question: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<ChatResponse> {
  const res = await fetch('/ai-agent/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || err.error || 'Request failed')
  }

  return res.json()
}
