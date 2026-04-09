// pages/api/proxy/[...path].js

export default async function handler(req, res) {
  // 提取动态路径（例如 chat/completions）
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;
  const targetUrl = `https://integrate.api.nvidia.com/v1/${targetPath}`;

  // 从客户端请求中获取 Authorization 头
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        // 原样转发客户端提供的认证头
        'Authorization': authHeader,
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    };

    // 处理请求体（POST/PUT 等方法）
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // 转发状态码
    res.status(response.status);

    // 处理响应头与内容
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (contentType?.includes('text/event-stream')) {
      // 流式响应：逐块转发
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const reader = response.body.getReader();
      res.flushHeaders();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const data = await response.text();
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}