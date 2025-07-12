// Workers-compatible environment utilities

// Safe environment variable getter for Workers
export const getEnv = (key: string, defaultValue?: string): string => {
  try {
    // Use a safer check for import.meta.env
    if (typeof window !== "undefined" && import.meta && import.meta.env) {
      return import.meta.env[key] || defaultValue || "";
    }
    return defaultValue || "";
  } catch {
    return defaultValue || "";
  }
};

// Development mode detection for Workers
export const isDev = (): boolean => {
  try {
    return getEnv("DEV") === "true" || getEnv("NODE_ENV") === "development";
  } catch {
    return false;
  }
};

// Production mode detection for Workers
export const isProd = (): boolean => {
  try {
    return getEnv("PROD") === "true" || getEnv("NODE_ENV") === "production";
  } catch {
    return true; // Default to production in Workers
  }
};

// Safe console logging for Workers
export const devLog = (message: string, ...args: any[]) => {
  if (isDev() && typeof console !== "undefined") {
    console.log(message, ...args);
  }
};

export const devWarn = (message: string, ...args: any[]) => {
  if (isDev() && typeof console !== "undefined") {
    console.warn(message, ...args);
  }
};

// Workers-compatible environment config
export const ENV_WORKERS = {
  VITE_SUPABASE_URL: getEnv("VITE_SUPABASE_URL"),
  VITE_SUPABASE_ANON_KEY: getEnv("VITE_SUPABASE_ANON_KEY"),
  VITE_PAYSTACK_PUBLIC_KEY: getEnv("VITE_PAYSTACK_PUBLIC_KEY"),
  VITE_GOOGLE_MAPS_API_KEY: getEnv("VITE_GOOGLE_MAPS_API_KEY"),
  VITE_COURIER_GUY_API_KEY: getEnv("VITE_COURIER_GUY_API_KEY"),
  VITE_FASTWAY_API_KEY: getEnv("VITE_FASTWAY_API_KEY"),
  VITE_SENDER_API: getEnv("VITE_SENDER_API"),
  VITE_RESEND_API_KEY: getEnv("VITE_RESEND_API_KEY"),
  NODE_ENV: getEnv("NODE_ENV", "production"),
  DEV: isDev(),
  PROD: isProd(),
};
