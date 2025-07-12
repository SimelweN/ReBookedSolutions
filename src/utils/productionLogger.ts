// Production-safe logging utility

const isDevelopment = import.meta.env.DEV;

export const logger = {
  // Keep error logging for debugging critical issues
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },

  // Keep warning logging for important issues
  warn: (message: string, ...args: unknown[]) => {
    console.warn(message, ...args);
  },

  // Only log in development
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },

  // Only log in development
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
};

// Production-safe performance logging
export const perfLogger = {
  start: (name: string) => {
    if (isDevelopment && performance.mark) {
      performance.mark(`${name}-start`);
    }
  },

  end: (name: string) => {
    if (isDevelopment && performance.measure && performance.mark) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name).pop();
      if (measure) {
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
    }
  },
};
