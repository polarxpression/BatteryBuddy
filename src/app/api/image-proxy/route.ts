// src/app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL parameter is missing', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      credentials: 'omit',
    });
    if (!response.ok) {
      return new NextResponse(
        `Failed to fetch image. Status: ${response.status} ${response.statusText}`,
        { status: response.status }
      );
    }
    const stream = response.body as ReadableStream<Uint8Array>;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching image:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}