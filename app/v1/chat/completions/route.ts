import { NextRequest } from 'next/server';

// 优化 1：开启 Edge Runtime 显著降低网络代理的延迟和冷启动时间
export const runtime = 'edge'; 

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

export async function POST(request: NextRequest) {
  try {
    // 优化 2：更安全的 Header 解析方式，避免 .replace 匹配异常
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : process.env.NVIDIA_API_KEY;

    // 优化 3：直接透传请求流 (ReadableStream)，移除 await request.json()
    // 这样避免了解析 JSON 再序列化的内存消耗，提升转发效率
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 已删除判断拦截。如果 apiKey 未定义，传入空字符串，将鉴权失败的 401 报错交给上游处理
        'Authorization': `Bearer ${apiKey || ''}`,
      },
      body: request.body, 
      // 在 Node/Edge 中使用 Fetch API 发送流式 body 必须声明 duplex: 'half'
      // @ts-expect-error TS DOM lib 可能缺少对 duplex 的定义，但运行时必须存在
      duplex: 'half',
    });

    // 优化 4：直接返回上游的响应流，移除 await response.json()
    // 核心改进：这天然支持了 LLM 的打字机流式输出 (前端传入 stream: true 时不会被代理阻塞)
    // 复制上游的 status 和 headers 确保 CORS 等配置一并返回
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });

  } catch (error) {
    // 优化 5：增强错误捕获时的类型安全和返回格式
    return new Response(
      JSON.stringify({ 
        error: 'Proxy Error', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}