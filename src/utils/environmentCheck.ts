// Environment utilities to prevent development features in production

/**
 * Disable Vite HMR in production environments
 */
export const disableHMRInProduction = () => {
  if (typeof window !== "undefined" && import.meta.env.PROD) {
    // Override the Vite client to prevent HMR connections in production
    if ("__vite_ping" in window) {
      (window as any).__vite_ping = () => Promise.resolve();
    }

    // Disable any WebSocket connections that might be related to HMR
    if ("__vite_ws" in window) {
      const ws = (window as any).__vite_ws;
      if (ws && typeof ws.close === "function") {
        ws.close();
      }
    }

    console.log("🚀 Production mode: HMR disabled");
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
