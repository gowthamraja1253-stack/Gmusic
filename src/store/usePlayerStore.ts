import { create } from 'zustand';
import { Song } from '@/types';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  
  setCurrentSong: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  volume: 1, // 0.0 to 1.0

  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),
  
  setQueue: (songs) => set({ queue: songs }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setVolume: (volume) => set({ volume }),
  
  playNext: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      set({ currentSong: queue[currentIndex + 1], isPlaying: true });
    }
  },
  
  playPrevious: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      set({ currentSong: queue[currentIndex - 1], isPlaying: true });
    }
  }
}));
