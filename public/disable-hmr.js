// Early HMR blocker for production environments
// This script runs before any other code to prevent Vite HMR from initializing

(function () {
  "use strict";

  // Check if we're in a production environment
  const isProduction =
    window.location.hostname.includes(".fly.dev") ||
    window.location.hostname.includes(".vercel.app") ||
    window.location.hostname.includes(".netlify.app") ||
    (!window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1"));

  if (isProduction) {
    console.log("🚫 Production environment detected - blocking Vite HMR");

    // Block fetch requests to Vite endpoints
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0];
      if (
        typeof url === "string" &&
        (url.includes("/@vite/client") || url.includes("__vite_ping"))
      ) {
        console.log("🚫 Blocked Vite client fetch:", url);
        return Promise.reject(new Error("Vite client disabled in production"));
      }
      return originalFetch.apply(this, args);
    };

    // Block WebSocket connections to Vite HMR
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (
        urlStr.includes("__vite_hmr") ||
        urlStr.includes("vite-hmr") ||
        urlStr.includes("ws://") ||
        urlStr.includes("wss://")
      ) {
        console.log("🚫 Blocked Vite WebSocket:", urlStr);
        throw new Error("Vite WebSocket disabled in production");
      }
      return new OriginalWebSocket(url, protocols);
    };

    // Disable any Vite globals that might be set
    window.__vite_ping = () => Promise.resolve();

    // Block script loading for Vite client
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName) {
      const element = originalCreateElement.call(document, tagName);

      if (tagName.toLowerCase() === "script") {
        const originalSrc = Object.getOwnPropertyDescriptor(
          HTMLScriptElement.prototype,
          "src",
        );
        Object.defineProperty(element, "src", {
          get: originalSrc.get,
          set: function (value) {
            if (typeof value === "string" && value.includes("/@vite/client")) {
              console.log("🚫 Blocked Vite client script:", value);
              return;
            }
            originalSrc.set.call(this, value);
          },
        });
      }

      return element;
    };
  }
})();
