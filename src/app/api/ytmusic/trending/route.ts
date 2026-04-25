import { NextResponse } from 'next/server';
import { getTamilDiscoverySongs } from '@/lib/ytmusic-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') === 'latest' ? 'latest' : 'trending';

  try {
    const results = await getTamilDiscoverySongs(type);
    return NextResponse.json(
      { data: { results } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error(`YTMusic ${type} Error:`, error);
    return NextResponse.json(
      { data: { results: [] } },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
