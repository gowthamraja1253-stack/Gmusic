import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Song } from '@/types';

export type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  originalQueue: Song[]; // To maintain order when shuffle is toggled off
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  lastProgress: number; // for Continue Listening
  
  setCurrentSong: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setLastProgress: (progress: number) => void;
  
  playNext: () => void;
  playPrevious: () => void;
  
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  removeFromQueue: (index: number) => void;
}

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      originalQueue: [],
      isPlaying: false,
      volume: 1, 
      isShuffle: false,
      repeatMode: 'none',
      lastProgress: 0,

      setCurrentSong: (song) => {
        set({ currentSong: song, isPlaying: true });
        
        // Add to recently played via library store (Global history tracking)
        import('./useLibraryStore').then(({ useLibraryStore }) => {
          useLibraryStore.getState().addRecentlyPlayed(song);
        });
      },
      
      setQueue: (songs) => {
        const { isShuffle, currentSong } = get();
        const original = [...songs];
        
        let targetQueue = [...songs];
        if (isShuffle) {
          // Keep current song at index 0 if exists
          if (currentSong) {
             const withoutCurrent = targetQueue.filter(s => s.id !== currentSong.id);
             targetQueue = [currentSong, ...shuffleArray(withoutCurrent)];
          } else {
             targetQueue = shuffleArray(targetQueue);
          }
        }
        
        set({ queue: targetQueue, originalQueue: original });
      },
      
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      setVolume: (volume) => set({ volume }),
      
      setLastProgress: (progress) => set({ lastProgress: progress }),
      
      playNext: () => {
        const { currentSong, queue, repeatMode } = get();
        if (!currentSong || queue.length === 0) return;
        
        // If repeat one is on, we don't necessarily want playNext to loop the same track 
        // unless it's an auto-finish. For manual 'next', we go to next unless it's only 1 song
        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        
        if (currentIndex !== -1 && currentIndex < queue.length - 1) {
          get().setCurrentSong(queue[currentIndex + 1]);
        } else if (repeatMode === 'all' && queue.length > 0) {
          // Loop back to start
          get().setCurrentSong(queue[0]);
        } else {
          // End of queue. Stop playing.
          set({ isPlaying: false, lastProgress: 0 });
        }
      },
      
      playPrevious: () => {
        const { currentSong, queue, lastProgress } = get();
        if (!currentSong || queue.length === 0) return;
        
        // If we are more than 3 seconds in, previous should just restart the current song
        if (lastProgress > 3) {
          set({ lastProgress: 0 }); // reset time
          return;
        }

        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        if (currentIndex > 0) {
          get().setCurrentSong(queue[currentIndex - 1]);
        }
      },

      toggleShuffle: () => {
        const { isShuffle, originalQueue, currentSong, queue } = get();
        const nextShuffle = !isShuffle;
        
        if (nextShuffle) {
          // Turn logic into shuffle
          const withoutCurrent = originalQueue.filter(s => s.id !== currentSong?.id);
          const shuffled = shuffleArray(withoutCurrent);
          set({ 
            isShuffle: nextShuffle, 
            queue: currentSong ? [currentSong, ...shuffled] : shuffled 
          });
        } else {
          // Unshuffle
          set({ isShuffle: nextShuffle, queue: originalQueue });
        }
      },

      toggleRepeat: () => {
        const { repeatMode } = get();
        const nextMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
        set({ repeatMode: nextMode });
      },

      reorderQueue: (startIndex, endIndex) => {
        const { queue } = get();
        const result = [...queue];
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        set({ queue: result });
      },

      removeFromQueue: (index) => {
        const { queue } = get();
        const result = [...queue];
        result.splice(index, 1);
        set({ queue: result });
      }
    }),
    {
      name: 'gmusic-player-persist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        ...state, 
        isPlaying: false // always pause when reopening app
      })
    }
  )
);
