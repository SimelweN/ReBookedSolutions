// Utility to ensure React is fully loaded and available before any context files are evaluated

let reactLoadPromise: Promise<any> | null = null;
let reactInstance: any = null;

export const ensureReactLoaded = async (): Promise<any> => {
  if (reactInstance) {
    return reactInstance;
  }

  if (reactLoadPromise) {
    return reactLoadPromise;
  }

  reactLoadPromise = (async () => {
    try {
      // Dynamically import React
      const React = await import("react");

      // Make React globally available immediately
      if (typeof window !== "undefined") {
        (window as any).React = React;
        (globalThis as any).React = React;
      }

      // Store the instance
      reactInstance = React;

      console.log("✅ React loaded and made globally available");
      return React;
    } catch (error) {
      console.error("Failed to load React:", error);
      throw error;
    }
  })();

  return reactLoadPromise;
};

// Synchronous check if React is available
export const isReactAvailable = (): boolean => {
  try {
    return (
      reactInstance !== null ||
      (typeof window !== "undefined" && (window as any).React) ||
      (typeof globalThis !== "undefined" && (globalThis as any).React)
    );
  } catch {
    return false;
  }
};

// Get React instance (throws if not available)
export const getReact = (): any => {
  if (reactInstance) {
    return reactInstance;
  }

  if (typeof window !== "undefined" && (window as any).React) {
    return (window as any).React;
  }

  if (typeof globalThis !== "undefined" && (globalThis as any).React) {
    return (globalThis as any).React;
  }

  throw new Error(
    "React is not available yet. Call ensureReactLoaded() first.",
  );
};

// Safe createContext that waits for React
export const safeCreateContext = <T>(defaultValue: T): any => {
  try {
    const React = getReact();
    return React.createContext(defaultValue);
  } catch (error) {
    console.warn("React not available for createContext, returning mock");
    // Return a mock context for development
    return {
      Provider: ({ children }: { children: any }) => children,
      Consumer: ({ children }: { children: any }) => children(defaultValue),
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
    };
  }
};

// Initialize React loading immediately when this module is imported
if (typeof window !== "undefined") {
  ensureReactLoaded().catch(console.error);
}
