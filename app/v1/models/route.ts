import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

export async function GET() {
  const apiKey = process.env.NVIDIA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing NVIDIA_API_KEY in environment' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${NVIDIA_API_BASE}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
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
