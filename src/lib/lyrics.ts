export interface ParsedLyric {
  time: number; // in seconds
  text: string;
}

export interface LyricsResponse {
  syncedLyrics: ParsedLyric[] | null;
  plainLyrics: string | null;
  error?: string;
}

// 1. Preprocessing Engine
export const cleanSongTitle = (title: string): string => {
  if (!title) return '';
  let clean = title.replace(/\(From "[^"]+"\)/i, ''); // Remove (From "Movie")
  clean = clean.replace(/\[[^\]]+\]/g, ''); // Remove anything in brackets [Remix]
  clean = clean.replace(/\(feat\..*?\)/i, ''); // Remove (feat. Artist)
  // Remove trailing details separated by ' - ' like "Song Title - Movie Name"
  clean = clean.split(' - ')[0]; 
  return clean.trim();
};

// 2. LRC Parser
export const parseLRC = (lrcString: string): ParsedLyric[] => {
  const lines = lrcString.split('\n');
  const parsed: ParsedLyric[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (!match) continue;

    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3]);
    
    // Normalize milliseconds if it's 2 digits vs 3 digits
    const msValue = match[3].length === 2 ? milliseconds * 10 : milliseconds;
    const totalSeconds = minutes * 60 + seconds + msValue / 1000;
    
    const text = line.replace(timeRegex, '').trim();
    if (text) { // ignore pure empty timed lines
      parsed.push({ time: totalSeconds, text });
    }
  }

  return parsed;
};

// Presentation Backup Data
const MANUAL_FALLBACKS: Record<string, string> = {
  "naa ready": `[00:00.00] (Instrumental Intro)
[00:15.50] Naa Ready dhan varava
[00:18.20] Annan na erangi varava
[00:21.00] Thanimaiyil irukkum singam
[00:24.15] Padaiyodu dhan varava
[00:27.50] (Beat Drop)
[00:30.00] Kaththi koorai veesum
[00:33.20] Ratham thekaiyil uraiyum
[00:45.00] (Music Continues...)`,
  "hukum": `[00:00.00] (Tiger Ka Hukum)
[00:08.50] Hukum! Tiger Ka Hukum!
[00:13.20] Alapparai kelappurom
[00:16.10] Thalaivar alapparai
[00:20.50] (Intense BGM)
[00:35.00] Oru valiyaa mudivu kattum`
};

// 3. Main Fetcher
export const fetchLyrics = async (rawTitle: string, rawArtist: string): Promise<LyricsResponse> => {
  const title = cleanSongTitle(rawTitle);
  const artist = rawArtist.split(',')[0].trim(); // take primary artist

  // 1. Check fallbacks first (case insensitive substring match)
  const lcaseTitle = title.toLowerCase();
  for (const [key, lrc] of Object.entries(MANUAL_FALLBACKS)) {
    if (lcaseTitle.includes(key)) {
      return { syncedLyrics: parseLRC(lrc), plainLyrics: null };
    }
  }

  try {
    // 2. Query LRCLib
    const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    const res = await fetch(searchUrl, { timeout: 4000 } as RequestInit);
    
    if (!res.ok) throw new Error('API request failed');
    
    const data = await res.json();
    if (!data || data.length === 0) {
      // 3. Fallback to just title search if strict artist match fails
      const looseUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}`;
      const looseRes = await fetch(looseUrl);
      const looseData = await looseRes.json();
      
      if (!looseData || looseData.length === 0) {
        throw new Error('Not found');
      }
      data[0] = looseData[0];
    }

    const bestMatch = data[0];
    
    if (bestMatch.syncedLyrics) {
      return { syncedLyrics: parseLRC(bestMatch.syncedLyrics), plainLyrics: bestMatch.plainLyrics };
    } else if (bestMatch.plainLyrics) {
      return { syncedLyrics: null, plainLyrics: bestMatch.plainLyrics };
    }

    throw new Error('No lyrics format found');
    
  } catch (error) {
    console.error("Lyrics fetch failed:", error);
    return { syncedLyrics: null, plainLyrics: null, error: 'Lyrics not available or not synced for this track.' };
  }
};
