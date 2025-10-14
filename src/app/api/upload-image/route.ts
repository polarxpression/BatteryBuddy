import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '@/lib/firebase';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();

  if (!imageUrl) {
    return new NextResponse('Image URL is missing', { status: 400 });
  }

  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }
    const imageBuffer = await response.arrayBuffer();
    
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

    const fileName = `${crypto.randomUUID()}.png`;
    const storageRef = ref(storage, `battery-images/${fileName}`);

    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, processedImageBuffer, { contentType: 'image/png' });
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ downloadURL });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}