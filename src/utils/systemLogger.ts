/**
 * Minimal system logger utility
 */

export const systemLogger = {
  log: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
  },
};

export const logError = (message: string, error?: any) => {
  console.error(message, error);
};

export default systemLogger;
