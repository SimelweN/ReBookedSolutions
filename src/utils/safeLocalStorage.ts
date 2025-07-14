/**
 * Safe localStorage utility with SSR compatibility
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage item "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.clear();
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  },

  // Check if localStorage is available
  isAvailable: (): boolean => {
    try {
      if (typeof window === "undefined") return false;
      const testKey = "__localStorage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get sessionStorage item "${key}":`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === "undefined") return;
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set sessionStorage item "${key}":`, error);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === "undefined") return;
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove sessionStorage item "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      if (typeof window === "undefined") return;
      sessionStorage.clear();
    } catch (error) {
      console.warn("Failed to clear sessionStorage:", error);
    }
  },
};
