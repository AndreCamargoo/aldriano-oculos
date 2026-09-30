import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from './settings';

interface Ctx {
  settings: AppSettings;
  ready: boolean;
  update: (next: AppSettings) => Promise<void>;
  reset: () => Promise<void>;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setReady(true);
    });
  }, []);

  const update = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  }, []);

  const reset = useCallback(() => update(DEFAULT_SETTINGS), [update]);

  return (
    <SettingsContext.Provider value={{ settings, ready, update, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings fora do SettingsProvider');
  return ctx;
}
