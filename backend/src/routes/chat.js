import { Router } from 'express'
import { askAgent, getAgentStatus } from '../services/agent.js'
import { listKnowledgeSources } from '../services/knowledge.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', ...getAgentStatus() })
})

router.get('/knowledge', (_req, res) => {
  res.json({ sources: listKnowledgeSources() })
})

router.post('/chat', async (req, res) => {
  const { question, history = [] } = req.body

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' })
  }

  try {
    const result = await askAgent(question.trim(), history)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Agent request failed', message: err.message })
  }
})

export default router
