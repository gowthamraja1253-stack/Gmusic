'use client';

import React, { useState } from 'react';
import { useLibraryStore } from '@/store/useLibraryStore';
import { SongCard } from '@/components/shared/SongCard';
import { PlaylistModal } from '@/components/shared/PlaylistModal';
import { Music, ListMusic, Clock, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function LibraryPage() {
  const { playlists, recentlyPlayed, deletePlaylist, removeSongFromPlaylist } = useLibraryStore();
  const { setQueue, setCurrentSong } = usePlayerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlists' | 'recent'>('playlists');
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);

  const playPlaylist = (pl: any) => {
    if (pl.songs.length === 0) return;
    setQueue(pl.songs);
    setCurrentSong(pl.songs[0]);
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ListMusic className="w-8 h-8 text-primary" />
          Your Library
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
        >
          New Playlist
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'playlists' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <ListMusic className="w-4 h-4" />
          Playlists ({playlists.length})
        </button>
        <button 
          onClick={() => setActiveTab('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'recent' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Clock className="w-4 h-4" />
          Recently Played
        </button>
      </div>

      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {playlists.length === 0 ? (
            <div className="text-center py-20 text-gray-400 glass-panel rounded-2xl">
              <ListMusic className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium text-white mb-2">No Playlists Yet</h3>
              <p className="mb-6">Create a playlist to start collecting your favorite tracks.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-primary hover:text-pink-400 font-medium">Create Playlist &rarr;</button>
            </div>
          ) : (
            <div className="grid gap-6">
              {playlists.map((pl) => (
                <div key={pl.id} className="glass-panel rounded-2xl overflow-hidden">
                  <div 
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedPlaylist(expandedPlaylist === pl.id ? null : pl.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/40 to-purple-600/40 rounded-xl flex items-center justify-center">
                        <Music className="w-8 h-8 text-white/50" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{pl.name}</h3>
                        <p className="text-sm text-gray-400">{pl.songs.length} tracks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); playPlaylist(pl); }}
                        className="bg-primary text-white p-3 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                        disabled={pl.songs.length === 0}
                      >
                        <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                        className="text-gray-500 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-white/5"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedPlaylist === pl.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-white/10 p-6 bg-black/20"
                    >
                      {pl.songs.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No tracks in this playlist yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {pl.songs.map((song) => (
                             <div key={song.id} className="relative group">
                               <SongCard song={song} queue={pl.songs} />
                               <button 
                                 onClick={(e) => { e.stopPropagation(); removeSongFromPlaylist(pl.id, song.id); }}
                                 className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500 shadow-lg"
                                 title="Remove from playlist"
                               >
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <div>
          {recentlyPlayed.length === 0 ? (
             <div className="text-center py-20 text-gray-400 glass-panel rounded-2xl">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium text-white mb-2">No Listening History</h3>
              <p>Listen to some tracks to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentlyPlayed.map((song) => (
                <SongCard key={song.id} song={song} queue={recentlyPlayed} />
              ))}
            </div>
          )}
        </div>
      )}

      <PlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
