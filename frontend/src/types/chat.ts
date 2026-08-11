export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  mode?: string
}

export interface ChatResponse {
  answer: string
  sources?: string[]
  mode?: string
}

export interface KnowledgeSource {
  id: string
  title: string
  chunks: number
}

export interface AgentStatus {
  status: string
  aiEnabled: boolean
  model: string
}
