import React, { useState } from 'react';
import { X, Plus, ListMusic, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Song } from '@/types';
import Image from 'next/image';
import { getHighestQualityImage } from '@/lib/api';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songToAdd?: Song | null;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose, songToAdd }) => {
  const { playlists, createPlaylist, addSongToPlaylist } = useLibraryStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleSelectPlaylist = (playlistId: string) => {
    if (songToAdd) {
      addSongToPlaylist(playlistId, songToAdd);
      setFeedback('Added to playlist');
      
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 glass-panel rounded-2xl shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {songToAdd ? 'Add to Playlist' : 'Your Playlists'}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {songToAdd && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="relative w-12 h-12 rounded-md overflow-hidden">
                   <Image src={getHighestQualityImage(songToAdd.image)} alt={songToAdd.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate" dangerouslySetInnerHTML={{ __html: songToAdd.name }}></p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{songToAdd.artists?.primary?.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            )}

            {feedback && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                {feedback}
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto mb-4 space-y-2 pr-2 custom-scrollbar">
              {playlists.length === 0 && !isCreating ? (
                <div className="text-center py-8 text-gray-400">
                  <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>You don't have any playlists yet.</p>
                </div>
              ) : (
                playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => handleSelectPlaylist(pl.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <ListMusic className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-primary transition-colors">{pl.name}</p>
                        <p className="text-xs text-gray-400">{pl.songs.length} tracks</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {isCreating ? (
              <form onSubmit={handleCreate} className="mt-4">
                <input
                  type="text"
                  autoFocus
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-3"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim()}
                    className="flex-1 py-2 bg-primary hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-primary rounded-lg text-white text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-primary hover:bg-primary/10 transition-all font-medium mt-2"
              >
                <Plus className="w-5 h-5" />
                New Playlist
              </button>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
