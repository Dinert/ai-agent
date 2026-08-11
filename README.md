# AI Knowledge Agent

一个简单的知识库问答 AI Agent 项目。前端 Vue 3 + Vite，后端 Node.js + Express。

## 功能

- 基于本地 Markdown 知识库文档检索
- 支持 OpenAI API 生成自然语言回答（可选）
- 未配置 API Key 时自动降级为检索模式
- Vue 3 聊天界面，展示参考来源

## 项目结构

```
ai-knowledge-agent/
├── backend/                 # Node.js API
│   └── src/
│       ├── data/knowledge/  # 知识库文档 (.md)
│       ├── services/        # 检索 + Agent 逻辑
│       └── routes/          # API 路由
└── frontend/                # Vue 3 聊天界面
```

## 快速开始

### 1. 启动后端

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

后端地址：http://localhost:3001

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：http://localhost:5173

### 3. 启用 AI 回答（可选）

编辑 `backend/.env`：

```env
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
```

支持兼容 OpenAI 的第三方 API，修改 `OPENAI_BASE_URL` 即可。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务状态 |
| GET | `/api/knowledge` | 知识库列表 |
| POST | `/api/chat` | 发送问题 |

### 聊天请求示例

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"年假有多少天？"}'
```

## 添加知识库文档

在 `backend/src/data/knowledge/` 下新增 `.md` 文件，重启后端后自动加载。

## 工作原理

1. 用户提问
2. 后端在知识库中检索相关段落
3. 将检索结果作为上下文交给 LLM（或降级返回原文）
4. 返回答案 + 参考来源
