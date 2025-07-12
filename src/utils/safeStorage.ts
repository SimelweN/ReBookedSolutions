/**
 * Safe Storage Wrapper
 * Handles storage quota and access issues gracefully
 */

export class SafeStorage {
  private static fallbackData = new Map<string, string>();

  /**
   * Safely set an item in localStorage
   */
  static setItem(key: string, value: string): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        this.fallbackData.set(key, value);
        return false;
      }

      window.localStorage.setItem(key, value);
      return true;
    } catch (error: any) {
      console.debug(
        "📦 Storage setItem failed, using fallback:",
        error.message,
      );
      this.fallbackData.set(key, value);

      // If quota exceeded, try to clean up old entries
      if (error.name === "QuotaExceededError" || error.code === 22) {
        this.cleanupOldEntries();

        // Try again after cleanup
        try {
          window.localStorage.setItem(key, value);
          return true;
        } catch {
          // Still failed, use fallback
          return false;
        }
      }

      return false;
    }
  }

  /**
   * Safely get an item from localStorage
   */
  static getItem(key: string): string | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return this.fallbackData.get(key) || null;
      }

      const item = window.localStorage.getItem(key);
      if (item !== null) return item;

      // Check fallback data
      return this.fallbackData.get(key) || null;
    } catch (error) {
      console.debug("📦 Storage getItem failed, using fallback:", error);
      return this.fallbackData.get(key) || null;
    }
  }

  /**
   * Safely remove an item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        this.fallbackData.delete(key);
        return false;
      }

      window.localStorage.removeItem(key);
      this.fallbackData.delete(key);
      return true;
    } catch (error) {
      console.debug("📦 Storage removeItem failed:", error);
      this.fallbackData.delete(key);
      return false;
    }
  }

  /**
   * Safely clear localStorage
   */
  static clear(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        this.fallbackData.clear();
        return false;
      }

      window.localStorage.clear();
      this.fallbackData.clear();
      return true;
    } catch (error) {
      console.debug("📦 Storage clear failed:", error);
      this.fallbackData.clear();
      return false;
    }
  }

  /**
   * Get all keys
   */
  static getAllKeys(): string[] {
    const keys = new Set<string>();

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) keys.add(key);
        }
      }
    } catch (error) {
      console.debug("📦 Failed to get localStorage keys:", error);
    }

    // Add fallback keys
    for (const key of this.fallbackData.keys()) {
      keys.add(key);
    }

    return Array.from(keys);
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }

      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  static getUsageInfo(): {
    used: number;
    available: boolean;
    fallback: boolean;
  } {
    let used = 0;
    let available = false;
    let fallback = false;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        available = true;
        const keys = this.getAllKeys();
        for (const key of keys) {
          const value = window.localStorage.getItem(key);
          if (value) {
            used += key.length + value.length;
          }
        }
      } else {
        fallback = true;
      }
    } catch {
      fallback = true;
    }

    return { used, available, fallback };
  }

  /**
   * Clean up old or unnecessary entries
   */
  private static cleanupOldEntries(): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;

      const keysToRemove: string[] = [];
      const currentTime = Date.now();
      const oneWeekAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

      // Look for keys that might be safe to remove
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;

        // Remove old temporary/cache entries
        if (
          key.startsWith("temp_") ||
          key.startsWith("cache_") ||
          key.startsWith("_dd_") || // Datadog entries
          key.includes("analytics") ||
          key.includes("tracking")
        ) {
          try {
            const value = window.localStorage.getItem(key);
            if (value) {
              // Try to parse timestamp if it's JSON
              try {
                const parsed = JSON.parse(value);
                if (parsed.timestamp && parsed.timestamp < oneWeekAgo) {
                  keysToRemove.push(key);
                }
              } catch {
                // If not JSON or no timestamp, remove if it's a tracking key
                if (
                  key.includes("analytics") ||
                  key.includes("tracking") ||
                  key.startsWith("_dd_")
                ) {
                  keysToRemove.push(key);
                }
              }
            }
          } catch {
            // Error reading value, mark for removal
            keysToRemove.push(key);
          }
        }
      }

      // Remove identified keys
      for (const key of keysToRemove) {
        try {
          window.localStorage.removeItem(key);
          console.debug("🧹 Cleaned up storage key:", key);
        } catch (error) {
          console.debug("🧹 Failed to remove key:", key, error);
        }
      }

      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} storage entries`);
      }
    } catch (error) {
      console.debug("🧹 Storage cleanup failed:", error);
    }
  }

  /**
   * Initialize safe storage and polyfill if needed
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Suppress Datadog SDK storage warnings
    this.suppressDatadogWarnings();

    // Create a polyfill for localStorage if it's not available or broken
    if (!this.isAvailable()) {
      console.warn("📦 localStorage not available, using memory fallback");

      // Create a minimal localStorage polyfill
      (window as any).localStorage = {
        getItem: (key: string) => this.getItem(key),
        setItem: (key: string, value: string) => this.setItem(key, value),
        removeItem: (key: string) => this.removeItem(key),
        clear: () => this.clear(),
        get length() {
          return SafeStorage.getAllKeys().length;
        },
        key: (index: number) => {
          const keys = SafeStorage.getAllKeys();
          return keys[index] || null;
        },
      };
    }

    // Clean up periodically
    this.schedulePeriodicCleanup();
  }

  /**
   * Suppress Datadog SDK warnings about storage
   */
  private static suppressDatadogWarnings(): void {
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    console.warn = (...args: any[]) => {
      const message = args.join(" ");

      // Suppress Datadog storage warnings
      if (
        message.includes("Datadog Browser SDK") &&
        (message.includes("No storage available") ||
          message.includes("session") ||
          message.includes("not send any data"))
      ) {
        console.debug(
          "🔇 Suppressed Datadog storage warning:",
          message.substring(0, 100),
        );
        return;
      }

      originalConsoleWarn.apply(console, args);
    };

    console.log = (...args: any[]) => {
      const message = args.join(" ");

      // Suppress Datadog logs about storage issues
      if (
        message.includes("Datadog Browser SDK") &&
        message.includes("storage")
      ) {
        return;
      }

      originalConsoleLog.apply(console, args);
    };
  }

  /**
   * Schedule periodic cleanup
   */
  private static schedulePeriodicCleanup(): void {
    // Clean up every 30 minutes
    setInterval(
      () => {
        this.cleanupOldEntries();
      },
      30 * 60 * 1000,
    );
  }
}

// Auto-initialize
if (typeof window !== "undefined") {
  SafeStorage.initialize();
}

export default SafeStorage;
