import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1;
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    enabled?: boolean;
  }
) {
  const { ttl = DEFAULT_TTL, enabled = true } = options || {};
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const cacheKey = `offline_cache_${key}`;

  const getFromCache = useCallback((): CacheEntry<T> | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const entry: CacheEntry<T> = JSON.parse(cached);
      if (entry.version !== CACHE_VERSION) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return entry;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const saveToCache = useCallback((data: T) => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (e) {
      // Storage full - clear old caches
      clearOldCaches();
    }
  }, [cacheKey]);

  const clearOldCaches = () => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_cache_'));
      // Sort by timestamp (oldest first) and remove half
      const entries = keys.map(k => {
        try {
          const entry = JSON.parse(localStorage.getItem(k) || '{}');
          return { key: k, timestamp: entry.timestamp || 0 };
        } catch {
          return { key: k, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);
      
      entries.slice(0, Math.ceil(entries.length / 2)).forEach(e => {
        localStorage.removeItem(e.key);
      });
    } catch {
      // Ignore
    }
  };

  const refresh = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const freshData = await fetcher();
      setData(freshData);
      setIsStale(false);
      setError(null);
      saveToCache(freshData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Fetch failed'));
      // Keep stale data if available
    } finally {
      setLoading(false);
    }
  }, [fetcher, enabled, saveToCache]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const cached = getFromCache();
    
    if (cached) {
      setData(cached.data);
      const isExpired = Date.now() - cached.timestamp > ttl;
      setIsStale(isExpired);
      setLoading(false);
      
      // Revalidate in background (stale-while-revalidate)
      refresh();
    } else {
      // No cache, must fetch
      refresh();
    }
  }, [enabled, getFromCache, ttl, refresh]);

  return { data, loading, error, isStale, refresh };
}

// Utility to invalidate specific cache
export function invalidateCache(key: string) {
  try {
    localStorage.removeItem(`offline_cache_${key}`);
  } catch {
    // Ignore
  }
}

// Utility to clear all offline caches
export function clearAllCaches() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('offline_cache_'))
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}
