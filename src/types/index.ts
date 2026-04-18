export interface Artist {
  id: string;
  name: string;
  role: string;
  type: string;
  url: string;
  image?: { quality: string; link: string }[];
}

export interface Song {
  id: string;
  name: string;
  type: string;
  album: { id: string; name: string; url: string };
  year: string | number;
  duration: number;
  playCount: number;
  language: string;
  hasLyrics: boolean;
  url: string;
  copyright: string;
  image: { quality: string; link: string }[];
  downloadUrl: { quality: string; link: string }[];
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
}

export interface SearchResponse {
  results: Song[];
  start: number;
  total: number;
}
