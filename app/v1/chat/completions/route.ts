import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // 关键：启用 Edge Runtime

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

export async function POST(request: NextRequest) {
  // 解析请求体（Edge 环境下 body 只能读一次）
  const body = await request.json();

  // 优先使用请求头中的 API Key，否则回退到环境变量
  const apiKey =
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing NVIDIA API Key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 判断是否为流式请求
  const isStream = body.stream === true;

  try {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // 流式响应：直接透传 response.body
    if (isStream && response.body) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // 非流式响应：等待完整 JSON 后返回
    const data = await response.json();
    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Proxy error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}