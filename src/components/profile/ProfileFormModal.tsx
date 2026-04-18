'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smile, User, Star, Zap, Heart, Sparkles, Moon, Sun } from 'lucide-react';
import { useProfileStore, Profile } from '@/store/useProfileStore';

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProfile?: Profile | null;
}

export const AVATAR_OPTIONS = [
  { id: 'av1', icon: User, color: 'from-blue-400 to-blue-600' },
  { id: 'av2', icon: Smile, color: 'from-pink-400 to-pink-600' },
  { id: 'av3', icon: Star, color: 'from-yellow-400 to-amber-600' },
  { id: 'av4', icon: Zap, color: 'from-purple-400 to-purple-600' },
  { id: 'av5', icon: Heart, color: 'from-red-400 to-red-600' },
  { id: 'av6', icon: Sparkles, color: 'from-emerald-400 to-emerald-600' },
  { id: 'av7', icon: Moon, color: 'from-indigo-400 to-indigo-600' },
  { id: 'av8', icon: Sun, color: 'from-orange-400 to-orange-600' },
];

export const ProfileFormModal: React.FC<ProfileFormModalProps> = ({ isOpen, onClose, editProfile }) => {
  const { addProfile, updateProfile } = useProfileStore();
  const [name, setName] = useState(editProfile?.name || '');
  const [avatarId, setAvatarId] = useState(editProfile?.avatarId || AVATAR_OPTIONS[0].id);

  // reset form when modal opens with new constraints
  React.useEffect(() => {
    if (isOpen) {
      setName(editProfile?.name || '');
      setAvatarId(editProfile?.avatarId || AVATAR_OPTIONS[0].id);
    }
  }, [isOpen, editProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editProfile) {
      updateProfile(editProfile.id, name.trim(), avatarId);
    } else {
      addProfile(name.trim(), avatarId);
    }
    onClose();
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
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[120] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {editProfile ? 'Edit Profile' : 'Create Profile'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter profile name"
                  maxLength={15}
                  autoFocus
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Choose Avatar</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      className={`relative aspect-square rounded-xl flex items-center justify-center transition-all ${
                        avatarId === av.id ? 'ring-2 ring-primary scale-105' : 'hover:scale-105 hover:bg-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-full h-full rounded-xl bg-gradient-to-br ${av.color} flex items-center justify-center`}>
                        <av.icon className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-medium border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-pink-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
