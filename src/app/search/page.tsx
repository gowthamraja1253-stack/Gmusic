'use client';

import React, { useState, useEffect } from 'react';
import { searchSongs } from '@/lib/api';
import { SongCard } from '@/components/shared/SongCard';
import { Song } from '@/types';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        setHasSearched(true);
        const data = await searchSongs(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 max-w-2xl mx-auto"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all glass-panel"
            placeholder="Search for Tamil songs, artists, or movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>
      </motion.div>

      <div className="min-h-[50vh]">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-20">
            <SearchIcon className="w-16 h-16 mb-4 text-gray-700" />
            <p className="text-lg">Discover your next favorite Tamil song</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
               <div key={i} className="animate-pulse flex flex-col gap-3">
                 <div className="aspect-square bg-gray-800 rounded-xl" />
                 <div className="h-4 bg-gray-800 rounded w-3/4" />
                 <div className="h-3 bg-gray-800 rounded w-1/2" />
               </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {results.map((song) => (
              <SongCard key={song.id} song={song} queue={results} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center pt-20 text-gray-400">
            <p className="text-xl mb-2">No results found for "{query}"</p>
            <p>Try searching for a different keyword</p>
          </div>
        )}
      </div>
    </div>
  );
}
