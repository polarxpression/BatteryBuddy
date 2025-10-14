
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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

    const imageBuffer = Buffer.from(base64Image, 'base64');
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const height = metadata.height || 200;

    // Process the image with sharp
    const processedImageBuffer = await image
      .resize({ height, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .resize(height, height)
      .toFormat('png')
      .toBuffer();

    const processedBase64Image = processedImageBuffer.toString('base64');

    const formData = new FormData();
    formData.append('image', processedBase64Image);

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
