import { Song } from '@/types';

export const fetchTrendingTamil = async (): Promise<Song[]> => {
  try {
    const res = await fetch(`/api/ytmusic/trending?type=trending`);
    if (!res.ok) throw new Error('Failed to fetch trending');
    const data = await res.json();
    return data?.data?.results || [];
  } catch (error) {
    console.error("Error loading Tamil hits:", error);
    return [];
  }
};

export const fetchLatestTamil = async (): Promise<Song[]> => {
  try {
    const res = await fetch(`/api/ytmusic/trending?type=latest`);
    if (!res.ok) throw new Error('Failed to fetch latest');
    const data = await res.json();
    return data?.data?.results || [];
  } catch (error) {
    console.error('Error fetching latest tamil:', error);
    return [];
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`/api/ytmusic/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search');
    const data = await res.json();
    return data?.data?.results || [];
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};

// Helper to get max quality image
export const getHighestQualityImage = (images: Song['image'] | undefined) => {
  const defaultImage = 'https://c.saavncdn.com/default_album.jpg';
  if (!images || images.length === 0) return defaultImage; 
  // For YouTube Music, the first thumbnail might be low res, the last might be high res.
  // Our api route maps them as widthxheight, so we can try to sort by width.
  const sorted = [...images].sort((a, b) => {
    const qA = parseInt(a.quality.split('x')[0]) || 0;
    const qB = parseInt(b.quality.split('x')[0]) || 0;
    return qB - qA;
  });
  return sorted[0].url || sorted[0].link || defaultImage;
};

// Helper to get play URL (preferably highest quality, 320kbps)
export const getPlayUrl = (downloadUrls: Song['downloadUrl'] | undefined) => {
  if (!downloadUrls || downloadUrls.length === 0) return '';
  // Since we inject `/api/ytmusic/stream?videoId=XXX` in downloadUrl, we just return the link
  return downloadUrls[0].url || downloadUrls[0].link || '';
};
