import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Song } from '@/types';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface LibraryState {
  playlists: Playlist[];
  recentlyPlayed: Song[];

  createPlaylist: (name: string) => void;
  renamePlaylist: (id: string, newName: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;

  addRecentlyPlayed: (song: Song) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      playlists: [],
      recentlyPlayed: [],

      createPlaylist: (name) =>
        set((state) => ({
          playlists: [
            ...state.playlists,
            {
              id: Date.now().toString(),
              name,
              songs: [],
              createdAt: Date.now(),
            },
          ],
        })),

      renamePlaylist: (id, newName) =>
        set((state) => ({
          playlists: state.playlists.map((pl) =>
            pl.id === id ? { ...pl, name: newName } : pl
          ),
        })),

      deletePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((pl) => pl.id !== id),
        })),

      addSongToPlaylist: (playlistId, song) =>
        set((state) => ({
          playlists: state.playlists.map((pl) => {
            if (pl.id === playlistId) {
              // Prevent duplicates
              if (pl.songs.some((s) => s.id === song.id)) return pl;
              return { ...pl, songs: [...pl.songs, song] };
            }
            return pl;
          }),
        })),

      removeSongFromPlaylist: (playlistId, songId) =>
        set((state) => ({
          playlists: state.playlists.map((pl) =>
            pl.id === playlistId
              ? { ...pl, songs: pl.songs.filter((s) => s.id !== songId) }
              : pl
          ),
        })),

      addRecentlyPlayed: (song) =>
        set((state) => {
          // Remove if it exists to move it to the top
          const filtered = state.recentlyPlayed.filter((s) => s.id !== song.id);
          const newRecentlyPlayed = [song, ...filtered].slice(0, 50); // Keep max 50
          return { recentlyPlayed: newRecentlyPlayed };
        }),
    }),
    {
      name: 'tamil-beats-library',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
