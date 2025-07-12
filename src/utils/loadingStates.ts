// Comprehensive loading states utility to replace missing loading states

import { useState, useEffect, useCallback } from "react";

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface LoadingStateConfig {
  minDuration?: number; // Minimum loading duration in ms
  maxDuration?: number; // Maximum loading duration before timeout
  retryAttempts?: number;
  retryDelay?: number;
}

export interface AsyncOperationState<T = unknown> {
  state: LoadingState;
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  retry: () => void;
  reset: () => void;
}

// Custom hook for managing async operations
export const useAsyncOperation = <T = unknown>(
  operation: () => Promise<T>,
  config: LoadingStateConfig = {},
): AsyncOperationState<T> => {
  const [state, setState] = useState<LoadingState>("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    minDuration = 500,
    maxDuration = 30000,
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  const execute = useCallback(async () => {
    setState("loading");
    setError(null);

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    try {
      // Set timeout for maximum duration
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Operation timed out"));
        }, maxDuration);
      });

      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);

      clearTimeout(timeoutId);

      // Ensure minimum duration
      const elapsed = Date.now() - startTime;
      if (elapsed < minDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, minDuration - elapsed),
        );
      }

      setData(result);
      setState("success");
      setRetryCount(0);
    } catch (err) {
      clearTimeout(timeoutId!);

      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setState("error");

      // Auto-retry if configured
      if (retryCount < retryAttempts) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
            execute();
          },
          retryDelay * (retryCount + 1),
        ); // Exponential backoff
      }
    }
  }, [
    operation,
    minDuration,
    maxDuration,
    retryAttempts,
    retryDelay,
    retryCount,
  ]);

  const retry = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState("idle");
    setData(null);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    state,
    data,
    error,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    retry,
    reset,
  };
};

// Hook for managing multiple async operations
export const useMultipleAsyncOperations = <T extends Record<string, unknown>>(
  operations: Record<keyof T, () => Promise<T[keyof T]>>,
  _config: LoadingStateConfig = {},
): AsyncOperationState<T> => {
  const [states, setStates] = useState<Record<keyof T, LoadingState>>(() =>
    Object.keys(operations).reduce(
      (acc, key) => ({ ...acc, [key]: "idle" }),
      {} as Record<keyof T, LoadingState>,
    ),
  );

  const [data, setData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(() =>
    Object.keys(operations).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {} as Record<keyof T, string | null>,
    ),
  );

  const executeOperation = useCallback(
    async <K extends keyof T>(key: K) => {
      setStates((prev) => ({ ...prev, [key]: "loading" }));
      setErrors((prev) => ({ ...prev, [key]: null }));

      try {
        const result = await operations[key]();
        setData((prev) => ({ ...prev, [key]: result }));
        setStates((prev) => ({ ...prev, [key]: "success" }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setErrors((prev) => ({ ...prev, [key]: errorMessage }));
        setStates((prev) => ({ ...prev, [key]: "error" }));
      }
    },
    [operations],
  );

  const executeAll = useCallback(async () => {
    const promises = Object.keys(operations).map((key) =>
      executeOperation(key as keyof T),
    );
    await Promise.allSettled(promises);
  }, [operations, executeOperation]);

  const isLoading = Object.values(states).some((state) => state === "loading");
  const isAllSuccess = Object.values(states).every(
    (state) => state === "success",
  );
  const hasErrors = Object.values(errors).some((error) => error !== null);

  return {
    states,
    data,
    errors,
    isLoading,
    isAllSuccess,
    hasErrors,
    executeOperation,
    executeAll,
  };
};

// Utility for creating loading states with Supabase
export const createSupabaseLoader = <T>(
  query: () => Promise<{ data: T | null; error: unknown }>,
) => {
  return async (): Promise<T> => {
    const { data, error } = await query();

    if (error) {
      throw new Error(error.message || "Database error occurred");
    }

    if (!data) {
      throw new Error("No data returned");
    }

    return data;
  };
};

// Utility for creating paginated loading states
export interface PaginatedState<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export const usePaginatedData = <T>(
  loadPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  _pageSize: number = 20,
): PaginatedState<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loadPage(currentPage);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setCurrentPage((prev) => prev + 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load more items";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadPage, currentPage, loading, hasMore]);

  const refresh = useCallback(async () => {
    setItems([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);

    setLoading(true);
    try {
      const result = await loadPage(0);
      setItems(result.items);
      setHasMore(result.hasMore);
      setCurrentPage(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh items";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadPage]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};

// Debounced loading state (useful for search)
export const useDebouncedAsyncOperation = <T>(
  operation: (query: string) => Promise<T>,
  delay: number = 300,
) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  // Execute operation when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    operation(debouncedQuery)
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : "Search failed";
          setError(errorMessage);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, operation]);

  return {
    query,
    setQuery,
    isLoading,
    data,
    error,
  };
};

// Loading state constants for consistent UX
export const LOADING_STATES = {
  MIN_DURATION: 500, // Minimum loading time to prevent flashing
  FAST_OPERATION: 1000, // For quick operations
  NORMAL_OPERATION: 5000, // For normal operations
  SLOW_OPERATION: 15000, // For slow operations like file uploads
  VERY_SLOW_OPERATION: 30000, // For very slow operations
} as const;

// Default configurations for common use cases
export const LOADING_CONFIGS = {
  fastOperation: {
    minDuration: LOADING_STATES.MIN_DURATION,
    maxDuration: LOADING_STATES.FAST_OPERATION,
    retryAttempts: 1,
    retryDelay: 500,
  },
  normalOperation: {
    minDuration: LOADING_STATES.MIN_DURATION,
    maxDuration: LOADING_STATES.NORMAL_OPERATION,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  slowOperation: {
    minDuration: LOADING_STATES.MIN_DURATION,
    maxDuration: LOADING_STATES.SLOW_OPERATION,
    retryAttempts: 2,
    retryDelay: 2000,
  },
  criticalOperation: {
    minDuration: 0,
    maxDuration: LOADING_STATES.VERY_SLOW_OPERATION,
    retryAttempts: 5,
    retryDelay: 3000,
  },
} as const;
