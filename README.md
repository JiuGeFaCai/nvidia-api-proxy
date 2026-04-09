# NVIDIA API Proxy

反代 NVIDIA NIM API，解决国内访问问题。

## 部署到 Vercel

### 方法一：一键部署

1. 在 Vercel 创建新项目，导入这个文件夹
2. 设置环境变量：`NVIDIA_API_KEY` = 你的 NVIDIA API Key
3. 部署完成

### 方法二：手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 进入项目目录
cd nvidia-proxy

# 登录并部署
vercel
```

## 使用方法

部署后，把原来的 API 地址换成你的 Vercel 域名：

```bash
# 原来（需要梯子）
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer nvapi-xxx" \
  -d '{"model": "meta/llama-3.1-8b-instruct", "messages": [{"role": "user", "content": "Hi"}]}'

# 现在（不需要梯子）
curl https://your-app.vercel.app/api/chat \
  -H "Authorization: Bearer nvapi-xxx" \
  -d '{"model": "meta/llama-3.1-8b-instruct", "messages": [{"role": "user", "content": "Hi"}]}'
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `NVIDIA_API_KEY` | NVIDIA API Key（可选，也可以在请求头传递） |

## 注意事项

- Vercel 免费版每月有 100GB 流量限制，个人使用足够
- 如果要支持更多 endpoint（如 embeddings），可以在 `api/` 下添加更多 route
- 建议绑定自定义域名，防止被墙
