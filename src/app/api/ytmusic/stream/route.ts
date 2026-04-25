import { NextResponse } from 'next/server';
import { resolveAudioStreamUrl } from '@/lib/ytmusic-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId')?.trim() ?? '';

  if (!YOUTUBE_VIDEO_ID.test(videoId)) {
    return new NextResponse('Invalid or missing videoId', { status: 400 });
  }

  const streamUrl = await resolveAudioStreamUrl(videoId);

  if (!streamUrl) {
    return new NextResponse('Could not resolve an audio stream for this track.', {
      status: 502,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.redirect(streamUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
