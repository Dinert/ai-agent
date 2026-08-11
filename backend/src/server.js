import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3008

app.listen(PORT, () => {
  console.log(`AI Agent API running at http://localhost:${PORT}`)
  console.log(
    process.env.OPENAI_API_KEY
      ? 'AI mode: enabled'
      : 'AI mode: disabled (retrieval-only, set OPENAI_API_KEY to enable)',
  )
})
