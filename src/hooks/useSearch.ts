/**
 * useSearch Hook
 * 
 * Connects the search engine to React components.
 * Handles debouncing, loading states, and result management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SearchResponse, ISearchEngine } from '@/types';
import { validateQuery } from '@/core/search/queryParser';

// =============================================================================
// TYPES
// =============================================================================

export interface UseSearchOptions {
  /** Debounce delay in ms (default: 150) */
  debounceMs?: number;
  
  /** Minimum query length to trigger search (default: 2) */
  minLength?: number;
  
  /** Auto-search on query change (default: true) */
  autoSearch?: boolean;
}

export interface UseSearchReturn {
  /** Current search query */
  query: string;
  
  /** Update query (triggers search if autoSearch) */
  setQuery: (query: string) => void;
  
  /** Search results */
  results: SearchResponse | null;
  
  /** Is currently searching */
  isSearching: boolean;
  
  /** Manually trigger search */
  search: (query?: string) => void;
  
  /** Clear results */
  clear: () => void;
  
  /** Error message if any */
  error: string | null;
}

const MAX_CACHE_ENTRIES = 150;

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useSearch(
  engine: ISearchEngine,
  options: UseSearchOptions = {}
): UseSearchReturn {
  const {
    debounceMs = 150,
    minLength = 2,
    autoSearch = true,
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, SearchResponse>>(new Map());

  const cacheResult = useCallback((cacheKey: string, response: SearchResponse) => {
    const cache = cacheRef.current;
    if (cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
    cache.set(cacheKey, response);

    if (cache.size > MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
  }, []);

  // Perform search
  const performSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    const cacheKey = trimmed.toLowerCase();

    const queryValidation = validateQuery(trimmed);
    if (!queryValidation.valid && trimmed.length >= minLength) {
      setError(queryValidation.error ?? 'Invalid query');
      setResults(null);
      setIsSearching(false);
      return;
    }

    // Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Check minimum length
    if (trimmed.length < minLength) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setError(cached.error ?? null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    // Debounced search
    debounceRef.current = window.setTimeout(() => {
      try {
        const response = engine.search(trimmed);
        cacheResult(cacheKey, response);
        setResults(response);

        if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError((err as Error).message);
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);
  }, [engine, debounceMs, minLength, cacheResult]);

  // Update query
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);

    if (autoSearch) {
      performSearch(newQuery);
    }
  }, [autoSearch, performSearch]);

  // Manual search
  const search = useCallback((overrideQuery?: string) => {
    const searchQuery = overrideQuery ?? query;
    performSearch(searchQuery);
  }, [query, performSearch]);

  // Clear results
  const clear = useCallback(() => {
    setQueryState('');
    setResults(null);
    setError(null);
    setIsSearching(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    cacheRef.current.clear();
  }, [engine]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    search,
    clear,
    error,
  };
}
