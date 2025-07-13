// Environment utilities to prevent development features in production

/**
 * Disable Vite HMR in production environments
 */
export const disableHMRInProduction = () => {
  if (
    typeof window !== "undefined" &&
    (import.meta.env.PROD || isProductionDeployment())
  ) {
    // Override fetch to block Vite client requests
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const url = args[0];
      if (
        typeof url === "string" &&
        (url.includes("/@vite/client") || url.includes("__vite_ping"))
      ) {
        console.log("🚫 Blocked Vite client request in production");
        return Promise.reject(new Error("Vite client disabled in production"));
      }
      return originalFetch.apply(window, args);
    };

    // Override ping function
    if ("__vite_ping" in window) {
      (window as any).__vite_ping = () => Promise.resolve();
    }

    // Disable WebSocket connections
    if ("__vite_ws" in window) {
      const ws = (window as any).__vite_ws;
      if (ws && typeof ws.close === "function") {
        ws.close();
      }
    }

    // Block WebSocket creation for Vite HMR
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = class extends OriginalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        const urlStr = typeof url === "string" ? url : url.toString();
        if (urlStr.includes("__vite_hmr") || urlStr.includes("vite-hmr")) {
          console.log("🚫 Blocked Vite WebSocket in production");
          throw new Error("Vite WebSocket disabled in production");
        }
        super(url, protocols);
      }
    };

    console.log("🚀 Production mode: HMR aggressively disabled");
  }
};

/**
 * Check if we're running in a production deployment
 */
export const isProductionDeployment = () => {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;

  // Check for common production domains
  return (
    import.meta.env.PROD ||
    hostname.includes(".fly.dev") ||
    hostname.includes(".vercel.app") ||
    hostname.includes(".netlify.app") ||
    (!hostname.includes("localhost") && !hostname.includes("127.0.0.1"))
  );
};
