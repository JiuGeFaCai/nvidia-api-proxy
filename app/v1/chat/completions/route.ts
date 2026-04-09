import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '') 
    || process.env.NVIDIA_API_KEY;

  try {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy error', details: String(error) },
      { status: 500 }
    );
  }
}
