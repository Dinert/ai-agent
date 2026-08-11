module.exports = {
  apps: [{
    name: 'ai-agent',
    cwd: '/opt/ai-agent/backend',
    script: 'src/server.js',
    env: {
      PORT: 3008,
      NODE_ENV: 'production',
      // 可选：不想依赖 .env 时把 Key 也写这里（注意别提交到 Git）
      OPENAI_API_KEY: 'sk-b58f89bf73ec4ae7998494f2bf0c9272',
      OPENAI_BASE_URL: 'https://api.deepseek.com',
      OPENAI_MODEL: 'deepseek-chat',
    },
  }],
}