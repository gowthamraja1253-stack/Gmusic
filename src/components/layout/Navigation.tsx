'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Search, Compass, Home, Heart, Menu, X, ListMusic, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/store/useProfileStore';
import { AVATAR_OPTIONS } from '@/components/profile/ProfileFormModal';

export const Navigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { profiles, activeProfileId, setActiveProfile } = useProfileStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const avatar = AVATAR_OPTIONS.find(a => a.id === activeProfile?.avatarId) || AVATAR_OPTIONS[0];
  const AvatarIcon = avatar.icon;

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/explore', icon: Compass },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: ListMusic },
    { name: 'Favorites', href: '/favorites', icon: Heart },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              Gmusic
            </span>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'text-primary bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeProfile && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 hover:bg-white/5 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-white/10 group"
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <AvatarIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden sm:block">
                    {activeProfile.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden glass-panel"
                    >
                      <div className="px-4 py-3 border-b border-white/10 bg-black/40">
                        <p className="text-sm text-gray-300">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{activeProfile.name}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setActiveProfile(null); // Return to selection screen
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Switch Profile
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-4 rounded-md text-base font-medium ${
                      isActive ? 'text-primary bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
