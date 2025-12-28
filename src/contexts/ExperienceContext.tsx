import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectExperienceMode, type ExperienceMode } from '../utils/domain';

interface ExperienceContextType {
  mode: ExperienceMode;
  switchMode: (mode: ExperienceMode) => void;
  isLive: boolean;
  isAlbum: boolean;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ExperienceMode>(() => detectExperienceMode());

  const switchMode = (newMode: ExperienceMode) => {
    setMode(newMode);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', newMode);
    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    const handlePopState = () => setMode(detectExperienceMode());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ExperienceContext.Provider
      value={{
        mode,
        switchMode,
        isLive: mode === 'live',
        isAlbum: mode === 'album'
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) throw new Error('useExperience must be used within ExperienceProvider');
  return context;
}
