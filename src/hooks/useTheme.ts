import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings } from '@/lib/storage';
import type { ExtensionSettings } from '@/types/profile';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    getSettings().then((settings) => {
      setThemeState(settings.theme);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    const effectiveTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    root.classList.add(effectiveTheme);
  }, [theme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    const settings = await getSettings();
    await saveSettings({ ...settings, theme: newTheme });
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
