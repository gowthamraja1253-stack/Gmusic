import { useState, useEffect } from 'react';
import { Song } from '@/types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Song[]>([]);

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem('tamil_beats_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.id === song.id);
      let newFavorites;
      if (isFav) {
        newFavorites = prev.filter(f => f.id !== song.id);
      } else {
        newFavorites = [...prev, song];
      }
      localStorage.setItem('tamil_beats_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (songId: string) => {
    return favorites.some(f => f.id === songId);
  };

  return { favorites, toggleFavorite, isFavorite };
};
