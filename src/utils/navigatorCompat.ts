/**
 * Workers-compatible navigator API wrapper
 * Provides safe access to navigator APIs that may not exist in Workers environment
 */

export const safeNavigator = {
  get onLine(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  },

  get userAgent(): string {
    return typeof navigator !== "undefined" ? navigator.userAgent : "server";
  },

  clipboard: {
    writeText: async (text: string): Promise<void> => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback: throw error or handle gracefully
      throw new Error("Clipboard API not available");
    },

    readText: async (): Promise<string> => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        return navigator.clipboard.readText();
      }
      throw new Error("Clipboard API not available");
    },
  },

  share: async (data: ShareData): Promise<void> => {
    if (typeof navigator !== "undefined" && navigator.share) {
      return navigator.share(data);
    }
    throw new Error("Web Share API not available");
  },

  canShare: (data?: ShareData): boolean => {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare(data)
    );
  },
};

// Safe performance API wrapper
export const safePerformance = {
  get now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  },

  mark: (name: string): void => {
    if (typeof performance !== "undefined" && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark?: string, endMark?: string): void => {
    if (typeof performance !== "undefined" && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        // Ignore if marks don't exist
      }
    }
  },
};

export default safeNavigator;
