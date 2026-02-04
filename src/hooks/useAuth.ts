import { useState, useEffect, useCallback } from 'react';
import { getStoredUser, storeAuthTokens, clearAuth, STORAGE_KEYS } from '@/lib/storage';
import { loginWithGoogle } from '@/lib/auth';
import type { User } from '@/types/profile';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStoredUser()
      .then(setUser)
      .finally(() => setIsLoading(false));

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_KEYS.USER]) {
        setUser(changes[STORAGE_KEYS.USER].newValue || null);
      }
    };
    chrome.storage.local.onChanged.addListener(listener);
    return () => chrome.storage.local.onChanged.removeListener(listener);
  }, []);

  const login = useCallback(async () => {
    const result = await loginWithGoogle();
    await storeAuthTokens(result.jwt, result.refreshToken, result.user);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    const storedUser = await getStoredUser();
    setUser(storedUser);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };
}
