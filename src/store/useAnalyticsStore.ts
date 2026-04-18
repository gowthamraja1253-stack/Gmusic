import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Song } from '@/types';

export interface ProfileAnalytics {
  totalListeningTime: number; // in seconds
  artistPlays: Record<string, number>;
  history: Song[];
}

interface AnalyticsState {
  // Map profileId -> Analytics
  analyticsMap: Record<string, ProfileAnalytics>;
  
  incrementListeningTime: (profileId: string) => void;
  trackSongPlay: (profileId: string, song: Song) => void;
  getAnalytics: (profileId: string) => ProfileAnalytics;
}

const DEFAULT_ANALYTICS: ProfileAnalytics = {
  totalListeningTime: 0,
  artistPlays: {},
  history: [],
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      analyticsMap: {},

      incrementListeningTime: (profileId) => set((state) => {
        const current = state.analyticsMap[profileId] || { ...DEFAULT_ANALYTICS };
        return {
          analyticsMap: {
            ...state.analyticsMap,
            [profileId]: { ...current, totalListeningTime: current.totalListeningTime + 1 }
          }
        };
      }),

      trackSongPlay: (profileId, song) => set((state) => {
        const current = state.analyticsMap[profileId] || { ...DEFAULT_ANALYTICS };
        
        // Update artist plays
        const artist = song.artists?.primary?.[0]?.name || 'Unknown Artist';
        const newArtistPlays = { ...current.artistPlays };
        newArtistPlays[artist] = (newArtistPlays[artist] || 0) + 1;

        // Update exact unique history
        const newHistory = [song, ...current.history.filter(s => s.id !== song.id)].slice(0, 30);

        return {
          analyticsMap: {
            ...state.analyticsMap,
            [profileId]: {
              ...current,
              artistPlays: newArtistPlays,
              history: newHistory
            }
          }
        };
      }),

      getAnalytics: (profileId) => {
        return get().analyticsMap[profileId] || { ...DEFAULT_ANALYTICS };
      }
    }),
    {
      name: 'gmusic-analytics-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
