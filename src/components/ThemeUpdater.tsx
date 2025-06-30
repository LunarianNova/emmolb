'use client';
import { useEffect } from 'react';
import { useSettings } from '@/components/Settings';

export const ThemeUpdater = () => {
  const { settings, ready } = useSettings();

  useEffect(() => {
    if (!ready || !settings.theme) return;

    const root = document.documentElement;
    const theme: any = settings.theme;

    for (const key in theme) {
      root.style.setProperty(`--theme-${key}`, theme[key]);
    }
  }, [settings.theme, ready]);

  return null; // it doesn't render anything
};
