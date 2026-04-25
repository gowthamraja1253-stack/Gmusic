import { NextResponse } from 'next/server';
import { searchTamilSongs } from '@/lib/ytmusic-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ data: { results: [] } });
  }

  try {
    const results = await searchTamilSongs(query);
    return NextResponse.json(
      { data: { results } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('YTMusic Search Error:', error);
    return NextResponse.json(
      { data: { results: [] } },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
