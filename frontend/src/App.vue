<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { fetchAgentStatus, fetchKnowledgeSources, sendQuestion } from '@/api/agent'
import type { ChatMessage, KnowledgeSource } from '@/types/chat'

const messages = ref<ChatMessage[]>([])
const input = ref('')
const loading = ref(false)
const error = ref('')
const aiEnabled = ref(false)
const model = ref('')
const sources = ref<KnowledgeSource[]>([])
const chatBodyRef = ref<HTMLElement | null>(null)

const suggestions = [
  '年假有多少天？怎么申请？',
  '报销时限是多久？',
  '每周可以远程办公几天？',
]

const canSend = computed(() => input.value.trim().length > 0 && !loading.value)

async function scrollToBottom() {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

async function ask(question: string) {
  const text = question.trim()
  if (!text || loading.value) return

  error.value = ''
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  await scrollToBottom()

  loading.value = true
  try {
    const history = messages.value.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }))
    const result = await sendQuestion(text, history)
    messages.value.push({
      role: 'assistant',
      content: result.answer,
      sources: result.sources,
      mode: result.mode,
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '请求失败'
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function onSubmit() {
  ask(input.value)
}

onMounted(async () => {
  try {
    const [status, knowledge] = await Promise.all([
      fetchAgentStatus(),
      fetchKnowledgeSources(),
    ])
    aiEnabled.value = status.aiEnabled
    model.value = status.model
    sources.value = knowledge
  } catch {
    error.value = '无法连接后端服务，请先启动'
  }
})
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <h1>知识库助手</h1>
        <p>基于企业文档的智能问答</p>
      </div>

      <div class="status" :class="{ on: aiEnabled }">
        <span class="dot" />
        {{ aiEnabled ? `AI 已启用 · ${model}` : '检索模式（未配置 API Key）' }}
      </div>

      <section class="panel">
        <h2>知识库文档</h2>
        <ul>
          <li v-for="item in sources" :key="item.id">
            <span>{{ item.title }}</span>
            <small>{{ item.chunks }} 段</small>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2>试试这些问题</h2>
        <button
          v-for="item in suggestions"
          :key="item"
          type="button"
          class="suggestion"
          @click="ask(item)"
        >
          {{ item }}
        </button>
      </section>
    </aside>

    <main class="chat">
      <header class="chat-header">
        <h2>对话</h2>
        <span>向知识库提问，获取政策与流程说明</span>
      </header>

      <div ref="chatBodyRef" class="chat-body">
        <div v-if="!messages.length" class="empty">
          <p>你好，我是知识库助手。</p>
          <p>你可以询问年假、报销、远程办公等公司制度相关问题。</p>
        </div>

        <article
          v-for="(msg, index) in messages"
          :key="index"
          class="message"
          :class="msg.role"
        >
          <div class="avatar">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
          <div class="bubble">
            <p class="content">{{ msg.content }}</p>
            <div v-if="msg.sources?.length" class="refs">
              参考来源：{{ msg.sources.join('、') }}
            </div>
          </div>
        </article>

        <div v-if="loading" class="message assistant">
          <div class="avatar">AI</div>
          <div class="bubble typing">正在思考...</div>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <form class="chat-input" @submit.prevent="onSubmit">
        <input
          v-model="input"
          type="text"
          placeholder="输入你的问题，例如：年假怎么申请？"
          :disabled="loading"
        />
        <button type="submit" :disabled="!canSend">发送</button>
      </form>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: #f4f6fb;
  color: #1f2937;
}

.sidebar {
  width: 280px;
  padding: 24px 20px;
  background: #111827;
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.brand h1 {
  margin: 0;
  font-size: 22px;
}

.brand p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #1f2937;
  font-size: 12px;
}

.status.on {
  background: #064e3b;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
}

.status.on .dot {
  background: #34d399;
}

.panel h2 {
  margin: 0 0 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.panel li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #1f2937;
  font-size: 13px;
}

.panel small {
  color: #9ca3af;
}

.suggestion {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 10px 12px;
  border: 1px solid #374151;
  border-radius: 10px;
  background: transparent;
  color: #e5e7eb;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
}

.suggestion:hover {
  border-color: #60a5fa;
  color: #fff;
}

.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
}

.chat-header span {
  font-size: 13px;
  color: #6b7280;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty {
  margin: auto;
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 760px;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.message.user .avatar {
  background: #dbeafe;
  color: #1d4ed8;
}

.message.assistant .avatar {
  background: #dcfce7;
  color: #166534;
}

.bubble {
  padding: 12px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
}

.message.user .bubble {
  background: #2563eb;
  color: #fff;
}

.content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.refs {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
}

.typing {
  color: #6b7280;
}

.error {
  margin: 0 24px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
}

.chat-input input:focus {
  outline: none;
  border-color: #2563eb;
}

.chat-input button {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
