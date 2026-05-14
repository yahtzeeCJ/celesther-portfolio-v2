import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelUrl = searchParams.get('url');

  if (!modelUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(modelUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    // Get the response as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'model/gltf-binary');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Failed to fetch model', { status: 500 });
  }
}
