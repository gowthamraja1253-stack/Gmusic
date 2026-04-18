import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tamil_beats_user_name';

export const useUserPreferences = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const storedName = localStorage.getItem(STORAGE_KEY);
    if (storedName) {
      setUserName(storedName);
    }
    setIsReady(true);
  }, []);

  const saveUserName = (name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUserName(name);
  };

  return { userName, saveUserName, isReady };
};
