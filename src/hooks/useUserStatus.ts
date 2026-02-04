import { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch, AuthError } from '@/lib/api';
import type { UserStatus } from 'shared/types';

const CACHE_KEY = 'userStatus';
const CACHE_TIMESTAMP_KEY = 'statusFetchedAt';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

interface UseUserStatusReturn {
  status: UserStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

async function getCachedStatus(): Promise<UserStatus | null> {
  const result = await chrome.storage.local.get([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
  const cached = result[CACHE_KEY] as UserStatus | undefined;
  const timestamp = result[CACHE_TIMESTAMP_KEY] as number | undefined;

  if (!cached || !timestamp) return null;

  const cacheExpired = Date.now() - timestamp > FIVE_MINUTES_MS;
  if (cacheExpired) return null;

  return cached;
}

async function setCachedStatus(status: UserStatus): Promise<void> {
  await chrome.storage.local.set({
    [CACHE_KEY]: status,
    [CACHE_TIMESTAMP_KEY]: Date.now(),
  });
}

async function clearCachedStatus(): Promise<void> {
  await chrome.storage.local.remove([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
}

export function useUserStatus(): UseUserStatusReturn {
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authenticatedFetch<UserStatus>('/user/status');
      setStatus(data);
      await setCachedStatus(data);
    } catch (e) {
      if (e instanceof AuthError) {
        setStatus(null);
        await clearCachedStatus();
        setIsLoading(false);
        return;
      }

      const cached = await chrome.storage.local.get(CACHE_KEY);
      if (cached[CACHE_KEY]) {
        setStatus(cached[CACHE_KEY] as UserStatus);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load status');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCacheThenFetch = async () => {
      const cached = await getCachedStatus();
      if (cached && mounted) {
        setStatus(cached);
        setIsLoading(false);
      }

      if (mounted) {
        await fetchStatus();
      }
    };

    loadCacheThenFetch();

    return () => {
      mounted = false;
    };
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
