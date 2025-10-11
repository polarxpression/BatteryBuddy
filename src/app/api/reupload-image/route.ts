import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { base64Image } = await req.json();

  if (!base64Image) {
    return new NextResponse('Base64 image is missing', { status: 400 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error('ImgBB API key is not configured');
    }

    const formData = new FormData();
    formData.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image to ImgBB: ${errorText}`);
    }

    const result = await response.json();

    if (result.data && result.data.url) {
      return NextResponse.json({ downloadURL: result.data.url });
    } else {
      throw new Error('Invalid response from ImgBB');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
