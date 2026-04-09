import { NextResponse } from 'next/server';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
const TIMEOUT_MS = 30000;

export async function GET() {
  // 获取 API Key（不做存在性校验）
  const apiKey = process.env.NVIDIA_API_KEY || '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${NVIDIA_API_BASE}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('NVIDIA models proxy error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}