import {
  FallbackStorage,
  QueuedFunction,
  CachedResponse,
} from "@/types/functionFallback";

class LocalFallbackStorage implements FallbackStorage {
  private queueKey = "ai_function_queue";
  private cachePrefix = "ai_function_cache_";
  private localPrefix = "ai_local_data_";

  // Queue operations
  async enqueue(item: QueuedFunction): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.push(item);

      // Sort by priority and nextRetry time
      queue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return a.nextRetry - b.nextRetry;
      });

      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error("Failed to enqueue function:", error);
    }
  }

  async dequeue(
    priority?: "high" | "normal" | "low",
  ): Promise<QueuedFunction | null> {
    try {
      const queue = await this.getQueue();
      const now = Date.now();

      let index = -1;
      if (priority) {
        index = queue.findIndex(
          (item) => item.priority === priority && item.nextRetry <= now,
        );
      } else {
        index = queue.findIndex((item) => item.nextRetry <= now);
      }

      if (index === -1) return null;

      const item = queue.splice(index, 1)[0];
      localStorage.setItem(this.queueKey, JSON.stringify(queue));

      return item;
    } catch (error) {
      console.error("Failed to dequeue function:", error);
      return null;
    }
  }

  async clearQueue(): Promise<void> {
    try {
      localStorage.removeItem(this.queueKey);
    } catch (error) {
      console.error("Failed to clear queue:", error);
    }
  }

  async getQueueSize(): Promise<number> {
    try {
      const queue = await this.getQueue();
      return queue.length;
    } catch (error) {
      console.error("Failed to get queue size:", error);
      return 0;
    }
  }

  private async getQueue(): Promise<QueuedFunction[]> {
    try {
      const queueData = localStorage.getItem(this.queueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error("Failed to parse queue data:", error);
      return [];
    }
  }

  // Cache operations
  async setCache<T>(key: string, data: T, ttl: number = 300000): Promise<void> {
    try {
      const cacheItem: CachedResponse<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        source: "fallback",
      };

      localStorage.setItem(this.cachePrefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Failed to set cache:", error);
    }
  }

  async getCache<T>(key: string): Promise<CachedResponse<T> | null> {
    try {
      const cacheData = localStorage.getItem(this.cachePrefix + key);
      if (!cacheData) return null;

      const cached: CachedResponse<T> = JSON.parse(cacheData);
      const now = Date.now();

      // Check if cache is expired
      if (now - cached.timestamp > cached.ttl) {
        localStorage.removeItem(this.cachePrefix + key);
        return null;
      }

      return cached;
    } catch (error) {
      console.error("Failed to get cache:", error);
      return null;
    }
  }

  async clearCache(pattern?: string): Promise<void> {
    try {
      if (!pattern) {
        // Clear all cache
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.cachePrefix)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Clear cache matching pattern
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.cachePrefix) && key.includes(pattern)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  // Local storage operations
  async storeLocally(key: string, data: any): Promise<void> {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        synced: false,
      };

      localStorage.setItem(this.localPrefix + key, JSON.stringify(item));
    } catch (error) {
      console.error("Failed to store data locally:", error);
    }
  }

  async getLocalData(key: string): Promise<any> {
    try {
      const itemData = localStorage.getItem(this.localPrefix + key);
      if (!itemData) return null;

      const item = JSON.parse(itemData);
      return item.data;
    } catch (error) {
      console.error("Failed to get local data:", error);
      return null;
    }
  }

  async clearLocalData(key?: string): Promise<void> {
    try {
      if (key) {
        localStorage.removeItem(this.localPrefix + key);
      } else {
        // Clear all local data
        const keys = Object.keys(localStorage);
        keys.forEach((k) => {
          if (k.startsWith(this.localPrefix)) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (error) {
      console.error("Failed to clear local data:", error);
    }
  }

  // Utility methods
  async getUnsyncedData(): Promise<
    Array<{ key: string; data: any; timestamp: number }>
  > {
    try {
      const keys = Object.keys(localStorage);
      const unsyncedData: Array<{ key: string; data: any; timestamp: number }> =
        [];

      keys.forEach((key) => {
        if (key.startsWith(this.localPrefix)) {
          try {
            const itemData = localStorage.getItem(key);
            if (itemData) {
              const item = JSON.parse(itemData);
              if (!item.synced) {
                unsyncedData.push({
                  key: key.replace(this.localPrefix, ""),
                  data: item.data,
                  timestamp: item.timestamp,
                });
              }
            }
          } catch (error) {
            console.error("Failed to parse local data item:", error);
          }
        }
      });

      return unsyncedData.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error("Failed to get unsynced data:", error);
      return [];
    }
  }

  async markAsSynced(key: string): Promise<void> {
    try {
      const itemData = localStorage.getItem(this.localPrefix + key);
      if (itemData) {
        const item = JSON.parse(itemData);
        item.synced = true;
        localStorage.setItem(this.localPrefix + key, JSON.stringify(item));
      }
    } catch (error) {
      console.error("Failed to mark as synced:", error);
    }
  }

  // Cleanup expired items
  async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith(this.cachePrefix)) {
          try {
            const cacheData = localStorage.getItem(key);
            if (cacheData) {
              const cached = JSON.parse(cacheData);
              if (now - cached.timestamp > cached.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted cache entries
            localStorage.removeItem(key);
          }
        }
      });

      // Clean up old local data (older than 7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      keys.forEach((key) => {
        if (key.startsWith(this.localPrefix)) {
          try {
            const itemData = localStorage.getItem(key);
            if (itemData) {
              const item = JSON.parse(itemData);
              if (item.synced && now - item.timestamp > maxAge) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted items
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error("Failed to cleanup storage:", error);
    }
  }

  // Get storage statistics
  getStorageStats(): {
    queueSize: number;
    cacheSize: number;
    localDataSize: number;
    totalSize: number;
  } {
    try {
      let queueSize = 0;
      let cacheSize = 0;
      let localDataSize = 0;

      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        try {
          const data = localStorage.getItem(key);
          const size = data ? data.length : 0;

          if (key === this.queueKey) {
            queueSize += size;
          } else if (key.startsWith(this.cachePrefix)) {
            cacheSize += size;
          } else if (key.startsWith(this.localPrefix)) {
            localDataSize += size;
          }
        } catch (error) {
          // Ignore errors for individual items
        }
      });

      return {
        queueSize,
        cacheSize,
        localDataSize,
        totalSize: queueSize + cacheSize + localDataSize,
      };
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return {
        queueSize: 0,
        cacheSize: 0,
        localDataSize: 0,
        totalSize: 0,
      };
    }
  }
}

// Lazy initialization to prevent "Cannot access before initialization" errors
let fallbackStorageInstance: LocalFallbackStorage | null = null;
let cleanupStarted = false;

export const getFallbackStorage = () => {
  if (!fallbackStorageInstance) {
    fallbackStorageInstance = new LocalFallbackStorage();

    // Initialize cleanup only once and only in browser
    if (!cleanupStarted && typeof window !== "undefined") {
      cleanupStarted = true;
      // Run cleanup periodically
      setInterval(
        () => {
          fallbackStorageInstance?.cleanup();
        },
        30 * 60 * 1000,
      ); // Every 30 minutes
    }
  }
  return fallbackStorageInstance;
};

// Initial cleanup is now handled in getFallbackStorage()
