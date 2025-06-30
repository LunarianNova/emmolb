'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

export type ThemeColors = {
  primary: string;
  secondary: string;
  score: string;
  accent: string;
  background: string;
  text: string;
  secondaryText: string;
};

type Settings = {
  useBlasesloaded: boolean;
  theme?: ThemeColors;
  [key: string]: any;
};

type SettingsContextType = {
  settings: Settings;
  updateSetting: (key: string, value: any) => void;
  resetSettings?: () => void;  // optional full reset
  resetTheme?: () => void;     // 👈 theme-only reset
  ready: boolean;
};

const defaultSettings: Settings = {
  useBlasesloaded: false,
  theme: {
    primary: '#1e2a36',
    secondary: '#0f1a2b',
    score: '#14532D',
    accent: '#17212b',
    background: '#0c111b',
    text: '#ffffff',
    secondaryText: '#fef4e5',
  },
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
  ready: false,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const hasLoadedRef = useRef(false); // NEW

  const resetTheme = () => {
    setSettings((prev) => ({
        ...prev,
        theme: defaultSettings.theme,
    }));
    };


  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
  };

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading settings', e);
    } finally {
      hasLoadedRef.current = true;
      setReady(true);
    }
  }, []);

  // Save to localStorage only AFTER initial load
  useEffect(() => {
    if (hasLoadedRef.current) {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings]);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => {
      const keys = key.split('.');
      const updated = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

return (
  <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, resetTheme, ready  }}>
    {ready ? children : null}
  </SettingsContext.Provider>
);
};

export const useSettings = () => useContext(SettingsContext);
