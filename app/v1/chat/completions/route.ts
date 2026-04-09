import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

export async function POST(request: NextRequest) {
  // 解析请求体，使用类型断言绕过 unknown 检查
  const body = (await request.json()) as {
    stream?: boolean;
    model?: string;
    messages?: unknown[];
    [key: string]: unknown;
  };

  const apiKey =
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing NVIDIA API Key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 安全读取 stream 字段
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