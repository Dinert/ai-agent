import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge')

function extractTerms(text) {
  const normalized = text.toLowerCase().trim()
  const terms = new Set()

  normalized
    .split(/[？?，,。.；;、\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)
    .forEach((part) => terms.add(part))

  const chineseSegments = normalized.match(/[\u4e00-\u9fff]+/g) || []
  for (const segment of chineseSegments) {
    if (segment.length >= 2) terms.add(segment)
    for (let i = 0; i < segment.length - 1; i++) {
      terms.add(segment.slice(i, i + 2))
    }
  }

  return [...terms]
}

function scoreChunk(query, content) {
  const contentLower = content.toLowerCase()
  const terms = extractTerms(query)
  let score = 0

  for (const term of terms) {
    if (contentLower.includes(term)) {
      score += term.length
    }
  }

  return score
}

function splitIntoChunks(content, source, chunkSize = 400) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks = []
  let buffer = ''

  for (const paragraph of paragraphs) {
    if ((buffer + paragraph).length > chunkSize && buffer) {
      chunks.push({ source, content: buffer.trim() })
      buffer = paragraph
    } else {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
    }
  }

  if (buffer) {
    chunks.push({ source, content: buffer.trim() })
  }

  return chunks
}

export function loadKnowledgeBase() {
  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((file) => file.endsWith('.md'))

  return files.flatMap((file) => {
    const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8')
    return splitIntoChunks(content, file.replace('.md', ''))
  })
}

export function searchKnowledge(query, topK = 3) {
  const chunks = loadKnowledgeBase()

  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(query, chunk.content),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return scored
}

function readSourceTitle(source) {
  const filePath = path.join(KNOWLEDGE_DIR, `${source}.md`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : source
}

export function listKnowledgeSources() {
  const chunks = loadKnowledgeBase()
  const sources = [...new Set(chunks.map((c) => c.source))]
  return sources.map((source) => ({
    id: source,
    title: readSourceTitle(source),
    chunks: chunks.filter((c) => c.source === source).length,
  }))
}
