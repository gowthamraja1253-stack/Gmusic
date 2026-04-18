'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, TrendingUp, Clock } from 'lucide-react';
import { fetchTrendingTamil, searchSongs } from '@/lib/api';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { SongCard } from '@/components/shared/SongCard';
import { Song } from '@/types';
import { motion } from 'framer-motion';
import { DynamicGreeting } from '@/components/home/DynamicGreeting';
import { ListeningStatsBanner } from '@/components/home/ListeningStatsBanner';
import { TimeState } from '@/lib/time';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [recommended, setRecommended] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<TimeState | null>(null);
  
  const { recentlyPlayed } = useLibraryStore();
  const { activeProfileId } = useProfileStore();
  const { getAnalytics } = useAnalyticsStore();

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Trending
      const data = await fetchTrendingTamil();
      setTrending(data);
      
      // 2. Compute Recommendations
      let artistQuery = 'Anirudh';
      if (activeProfileId) {
        const stats = getAnalytics(activeProfileId);
        if (stats && Object.keys(stats.artistPlays).length > 0) {
          const sortedArtists = Object.entries(stats.artistPlays).sort((a, b) => b[1] - a[1]);
          artistQuery = sortedArtists[0][0]; 
        }
      }
      const recs = await searchSongs(artistQuery);
      setRecommended(recs.slice(0, 5));
      
      setLoading(false);
    };
    loadData();
  }, [activeProfileId, getAnalytics]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 transition-colors duration-1000">
        <div 
          className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out ${
            theme ? `${theme.gradientFrom} ${theme.gradientTo}` : 'from-primary/20 to-black'
          } pointer-events-none`} 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left md:w-2/3 lg:w-1/2"
          >
            <DynamicGreeting onThemeUpdate={setTheme} />
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">
              Feel the Isai
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Listen to the latest and trending Tamil hits, find your new favorite artists, and experience music like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/explore">
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                  <PlayCircle className="w-5 h-5" />
                  Start Listening
                </button>
              </Link>
              <Link href="/search">
                <button className="flex items-center justify-center gap-2 px-8 py-4 glass rounded-full font-semibold text-white hover:bg-white/10 transition-all">
                  <SearchIcon className="w-5 h-5" />
                  Search Tracks
                </button>
              </Link>
            </div>
            
            {/* Display user listening analytics natively inside hero section */}
            <ListeningStatsBanner />

          </motion.div>
        </div>
      </section>

      {recentlyPlayed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 relative z-20 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">Recently Played</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar snap-x">
            {recentlyPlayed.slice(0, 8).map((song, index) => (
              <div key={song.id} className="min-w-[160px] sm:min-w-[200px] snap-start">
                <SongCard song={song} queue={recentlyPlayed} priority={index < 3} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Section */}
      {recommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommended.map((song) => (
              <SongCard key={`rec-${song.id}`} song={song} queue={recommended} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Section Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 mb-20">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="animate-pulse flex flex-col gap-3">
                 <div className="aspect-square bg-gray-800 rounded-xl" />
                 <div className="h-4 bg-gray-800 rounded w-3/4" />
                 <div className="h-3 bg-gray-800 rounded w-1/2" />
               </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {trending.slice(0, 5).map((song, index) => (
              <SongCard key={song.id} song={song} queue={trending} priority={index < 4} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/explore" className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline">
            View All Trending Hits →
          </Link>
        </div>
      </section>
    </div>
  );
}

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
