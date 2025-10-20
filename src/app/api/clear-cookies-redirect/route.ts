import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();

  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));

  for (const [name] of cookieStore) {
    response.cookies.set(name, '', { expires: new Date(0) });
  }

  return response;
}
