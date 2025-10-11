import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '@/lib/firebase';

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
    const imageBlob = await response.blob();
    const fileExtension = imageBlob.type.split('/')[1];
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const storageRef = ref(storage, `battery-images/${fileName}`);

    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, imageBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ downloadURL });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}