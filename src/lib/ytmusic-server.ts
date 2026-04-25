import ytdl from '@distube/ytdl-core';
import type { videoFormat } from '@distube/ytdl-core';
import YTMusic, { type SongDetailed } from 'ytmusic-api';
import { Innertube, UniversalCache } from 'youtubei.js';
import { Song, type Artist, type MediaAsset } from '@/types';

const YTMUSIC_REGION = {
  GL: 'IN',
  HL: 'en',
} as const;

const PIPED_INSTANCES = [
  'https://pipedapi.smnz.de',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.in.projectsegfau.lt',
  'https://pipedapi.lunar.icu',
];

const TAMIL_HINT = /\b(tamil|tamizh|kollywood)\b/i;

let ytmusicPromise: Promise<YTMusic> | null = null;
let innertubePromise: Promise<Innertube> | null = null;

const buildMediaAsset = (url: string, width = 0, height = 0): MediaAsset => ({
  quality: `${width}x${height}`,
  link: url,
  url,
});

const buildArtist = (artist: SongDetailed['artist']): Artist => ({
  id: artist.artistId ?? '',
  name: artist.name,
  role: 'primary',
  type: 'artist',
  url: artist.artistId ? `https://music.youtube.com/channel/${artist.artistId}` : '',
});

const withTamilContext = (query: string) => {
  const normalized = query.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return 'tamil songs';
  }

  return TAMIL_HINT.test(normalized) ? normalized : `${normalized} tamil`;
};

const dedupeSongs = (songs: SongDetailed[]) => {
  const seen = new Set<string>();

  return songs.filter((song) => {
    if (!song.videoId || seen.has(song.videoId)) {
      return false;
    }

    seen.add(song.videoId);
    return true;
  });
};

const sortAudioFormats = (formats: videoFormat[]) =>
  [...formats].sort(
    (left, right) =>
      (right.audioBitrate ?? right.bitrate ?? 0) -
      (left.audioBitrate ?? left.bitrate ?? 0),
  );

const getInnertubeClient = async () => {
  if (!innertubePromise) {
    innertubePromise = Innertube.create({
      cache: new UniversalCache(false),
    });
  }

  return innertubePromise;
};

export const getYTMusicClient = async () => {
  if (!ytmusicPromise) {
    const client = new YTMusic();
    ytmusicPromise = client
      .initialize(YTMUSIC_REGION)
      .then((instance) => instance ?? client);
  }

  return ytmusicPromise;
};

export const mapYTMusicSong = (ytSong: SongDetailed): Song => {
  const primaryArtist = buildArtist(ytSong.artist);
  const images = ytSong.thumbnails.map((thumbnail) =>
    buildMediaAsset(thumbnail.url, thumbnail.width, thumbnail.height),
  );

  return {
    id: ytSong.videoId,
    name: ytSong.name,
    type: 'song',
    album: {
      id: ytSong.album?.albumId ?? '',
      name: ytSong.album?.name ?? '',
      url: ytSong.album?.albumId
        ? `https://music.youtube.com/browse/${ytSong.album.albumId}`
        : '',
    },
    year: '',
    duration: ytSong.duration ?? 0,
    playCount: 0,
    language: 'tamil',
    hasLyrics: false,
    url: `https://music.youtube.com/watch?v=${ytSong.videoId}`,
    copyright: '',
    image: images,
    downloadUrl: [
      {
        quality: 'stream',
        link: `/api/ytmusic/stream?videoId=${ytSong.videoId}`,
      },
    ],
    artists: {
      primary: [primaryArtist],
      featured: [],
      all: [primaryArtist],
    },
  };
};

export const searchTamilSongs = async (query: string, limit = 30) => {
  const ytmusic = await getYTMusicClient();
  const results = await ytmusic.searchSongs(withTamilContext(query));

  return dedupeSongs(results)
    .slice(0, limit)
    .map(mapYTMusicSong);
};

export const getTamilDiscoverySongs = async (
  type: 'trending' | 'latest',
  limit = 20,
) => {
  const ytmusic = await getYTMusicClient();
  const year = new Date().getFullYear();
  const queries =
    type === 'latest'
      ? [
          `latest tamil songs ${year}`,
          `new tamil songs ${year}`,
          'tamil official audio',
        ]
      : [
          'trending tamil songs',
          `best tamil songs ${year}`,
          'tamil hits playlist',
        ];

  const settled = await Promise.allSettled(
    queries.map((query) => ytmusic.searchSongs(query)),
  );

  const merged = settled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  );

  return dedupeSongs(merged)
    .slice(0, limit)
    .map(mapYTMusicSong);
};

const resolveAudioFromYtdl = async (videoId: string) => {
  const info = await ytdl.getInfo(videoId, {
    playerClients: ['ANDROID', 'IOS', 'WEB'],
  });
  const formats = sortAudioFormats(ytdl.filterFormats(info.formats, 'audioonly'));

  return formats[0]?.url ?? null;
};

const resolveAudioFromInnertube = async (videoId: string) => {
  const innertube = await getInnertubeClient();
  const info = await innertube.getBasicInfo(videoId);
  const format = info.chooseFormat({
    type: 'audio',
    quality: 'best',
    format: 'any',
  });

  if (format.url) {
    return format.url;
  }

  try {
    return await format.decipher(innertube.session.player);
  } catch {
    return null;
  }
};

const resolveAudioFromPiped = async (videoId: string) => {
  for (const instance of PIPED_INSTANCES) {
    try {
      const response = await fetch(`${instance}/streams/${videoId}`, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as {
        audioStreams?: { bitrate?: number; url?: string }[];
      };
      const audioStreams = [...(data.audioStreams ?? [])].sort(
        (left, right) => (right.bitrate ?? 0) - (left.bitrate ?? 0),
      );

      if (audioStreams[0]?.url) {
        return audioStreams[0].url;
      }
    } catch {
      continue;
    }
  }

  return null;
};

export const resolveAudioStreamUrl = async (videoId: string) => {
  const resolvers = [
    resolveAudioFromYtdl,
    resolveAudioFromInnertube,
    resolveAudioFromPiped,
  ];

  for (const resolve of resolvers) {
    try {
      const streamUrl = await resolve(videoId);
      if (streamUrl) {
        return streamUrl;
      }
    } catch (error) {
      console.error(`Failed to resolve stream with ${resolve.name}:`, error);
    }
  }

  return null;
};
