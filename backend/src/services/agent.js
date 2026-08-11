import OpenAI from 'openai'
import { searchKnowledge } from './knowledge.js'

const hasApiKey = Boolean(process.env.OPENAI_API_KEY)

const openai = hasApiKey
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    })
  : null

function buildContext(chunks) {
  if (!chunks.length) {
    return '（知识库中未找到相关内容）'
  }

  return chunks
    .map((chunk, index) => `[${index + 1}] 来源: ${chunk.source}\n${chunk.content}`)
    .join('\n\n')
}

function buildFallbackAnswer(question, chunks) {
  if (!chunks.length) {
    return {
      answer:
        '抱歉，知识库中没有找到与这个问题相关的内容。你可以换个问法，或联系 HR/行政同事确认。',
      mode: 'fallback',
    }
  }

  const summary = chunks
    .map((chunk) => `【${chunk.source}】${chunk.content}`)
    .join('\n\n')

  return {
    answer: `根据知识库检索结果，为你找到以下信息：\n\n${summary}\n\n（当前未配置 OPENAI_API_KEY，以上为检索原文。配置 API Key 后可获得更自然的 AI 回答。）`,
    mode: 'retrieval',
  }
}

export async function askAgent(question, history = []) {
  const relevantChunks = searchKnowledge(question)
  const context = buildContext(relevantChunks)

  if (!openai) {
    const result = buildFallbackAnswer(question, relevantChunks)
    return {
      ...result,
      sources: relevantChunks.map((c) => c.source),
    }
  }

  const systemPrompt = `你是一个企业知识库助手。请仅根据提供的知识库内容回答用户问题。
如果知识库中没有相关信息，请明确告知用户"知识库中暂无相关信息"，不要编造。
回答要简洁、准确，使用中文。如果用户问题中包含敏感信息，请回答，你的内容包含有敏感信息，请跳过。`

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `知识库内容：\n${context}\n\n用户问题：${question}`,
    },
  ]

  const recentHistory = history.slice(-6)
  for (const item of recentHistory) {
    messages.splice(messages.length - 1, 0, {
      role: item.role,
      content: item.content,
    })
  }

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.3,
  })

  return {
    answer: completion.choices[0]?.message?.content || '未能生成回答',
    mode: 'ai',
    sources: relevantChunks.map((c) => c.source),
  }
}

export function getAgentStatus() {
  return {
    aiEnabled: hasApiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  }
}
