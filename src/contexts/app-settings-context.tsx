
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '@/lib/types';
import { onAppSettingsSnapshot } from '@/lib/firebase';

interface AppSettingsContextType {
  appSettings: AppSettings | null;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const unsubscribe = onAppSettingsSnapshot((settings) => {
      setAppSettings(settings);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppSettingsContext.Provider value={{ appSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
