import express from 'express'
import cors from 'cors'
import chatRoutes from './routes/chat.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    name: 'AI Knowledge Agent API',
    endpoints: {
      health: 'GET /api/health',
      knowledge: 'GET /api/knowledge',
      chat: 'POST /api/chat',
    },
  })
})

app.use('/api', chatRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

export default app
