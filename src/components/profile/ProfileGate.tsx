'use client';

import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/useProfileStore';
import { ProfileSelectionScreen } from './ProfileSelectionScreen';

export const ProfileGate = ({ children }: { children: React.ReactNode }) => {
  const { activeProfileId } = useProfileStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by blocking render until Zustand reads local storage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-primary animate-spin" />
      </div>
    );
  }

  // Intercept traffic if no active profile is set
  if (!activeProfileId) {
    return <ProfileSelectionScreen />;
  }

  // Pass through if validated
  return <>{children}</>;
};
