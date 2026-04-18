import { Song, SearchResponse } from '@/types';

// No API Key needed for this public instance
const API_BASE = process.env.NEXT_PUBLIC_SAAVN_API || 'https://saavn.sumit.co/api';

export const fetchTrendingTamil = async (): Promise<Song[]> => {
  try {
    // The endpoint for this specific API is /search/songs
    const res = await fetch(`${API_BASE}/search/songs?query=tamil&limit=10`);
    
    if (!res.ok) throw new Error('Failed to fetch from Saavn API');
    
    const data = await res.json();
    
    // This API returns data inside a 'data' object
    // Path: data.data.results
    return data?.data?.results || [];
  } catch (error) {
    console.error("Error loading Tamil hits:", error);
    return [];
  }
};

export const fetchLatestTamil = async (): Promise<Song[]> => {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=latest tamil&limit=20`);
    if (!res.ok) throw new Error('Failed to fetch queries');
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
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&limit=30`);
    if (!res.ok) throw new Error('Failed to fetch queries');
    const data = await res.json();
    return data?.data?.results || [];
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};

// Helper to get max quality image
export const getHighestQualityImage = (images: any[]) => {
  const defaultImage = 'https://c.saavncdn.com/default_album.jpg';
  if (!images || images.length === 0) return defaultImage; 
  const sorted = images.sort((a, b) => {
    const qA = parseInt(a.quality.replace(/\D/g, '')) || 0;
    const qB = parseInt(b.quality.replace(/\D/g, '')) || 0;
    return qB - qA;
  });
  return sorted[0].url || sorted[0].link || defaultImage;
};

// Helper to get play URL (preferably highest quality, 320kbps)
export const getPlayUrl = (downloadUrls: any[]) => {
  if (!downloadUrls || downloadUrls.length === 0) return '';
  const sorted = downloadUrls.sort((a, b) => {
    const qA = parseInt(a.quality.replace(/\D/g, '')) || 0;
    const qB = parseInt(b.quality.replace(/\D/g, '')) || 0;
    return qB - qA;
  });
  return sorted[0].url || sorted[0].link || '';
};
