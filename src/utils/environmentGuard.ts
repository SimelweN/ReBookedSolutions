/**
 * Environment Guard Utility
 *
 * Provides consistent environment detection across the application
 * to prevent Workers build failures and runtime errors
 */

// Conservative environment detection
export const isBrowserEnvironment = typeof window !== "undefined";
export const isServerEnvironment = !isBrowserEnvironment;
export const isWorkersEnvironment =
  isServerEnvironment && typeof importScripts === "undefined";

// Guard function for browser-only code
export const runInBrowser = <T>(fn: () => T, fallback?: T): T | undefined => {
  if (isBrowserEnvironment) {
    try {
      return fn();
    } catch (error) {
      console.error("Browser code execution failed:", error);
      return fallback;
    }
  }
  return fallback;
};

// Guard function for safe array/object operations
export const safeArray = <T>(array: T[] | undefined | null): T[] => {
  return Array.isArray(array) ? array : [];
};

export const safeObject = <T>(obj: T | undefined | null): T | {} => {
  return obj && typeof obj === "object" ? obj : ({} as T);
};
