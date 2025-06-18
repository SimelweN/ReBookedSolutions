// Simple deployment safety utilities
// Prevents blank screens and provides fallbacks

export const deploymentSafety = {
  // Handle chunk loading errors (common during deployments)
  handleChunkError: () => {
    window.addEventListener("error", (event) => {
      const { message, filename } = event;

      if (
        message?.includes("Loading chunk") ||
        message?.includes("Unexpected token") ||
        filename?.includes(".js")
      ) {
        console.warn("Chunk loading error detected, reloading page...");
        // Delay reload slightly to avoid infinite reload loops
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason?.toString() || "";

      if (
        reason.includes("Loading chunk") ||
        reason.includes("Failed to fetch")
      ) {
        console.warn("Chunk loading promise rejection, reloading page...");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  },

  // Prevent blank screens on navigation
  preventBlankScreen: () => {
    // Add a fallback if the app doesn't load within 10 seconds
    const loadTimeout = setTimeout(() => {
      const rootElement = document.getElementById("root");
      if (
        rootElement &&
        (!rootElement.innerHTML || rootElement.innerHTML.trim() === "")
      ) {
        console.warn("App appears to be blank, attempting recovery...");

        // Show a simple loading message
        rootElement.innerHTML = `
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui;
            background: #f9fafb;
            padding: 1rem;
          ">
            <div style="text-align: center;">
              <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
              "></div>
              <h2 style="color: #1f2937; margin-bottom: 0.5rem;">Loading ReBooked Solutions...</h2>
              <p style="color: #6b7280; margin-bottom: 1rem;">If this takes too long, try refreshing the page.</p>
              <button onclick="window.location.reload()" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 0.875rem;
              ">Refresh Page</button>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;

        // Try to reload after showing the message
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }, 10000);

    // Clear timeout if app loads successfully
    window.addEventListener("load", () => {
      clearTimeout(loadTimeout);
    });
  },

  // Handle routing issues
  handleRoutingIssues: () => {
    // If we're on a 404-like URL that might be from old bookmarks
    if (
      window.location.pathname !== "/" &&
      !document.querySelector("[data-react-app]")
    ) {
      const isLikelyAppRoute = [
        "/books",
        "/profile",
        "/admin",
        "/policies",
        "/terms",
        "/privacy",
        "/login",
        "/register",
        "/cart",
        "/checkout",
        "/university",
        "/campus",
      ].some((route) => window.location.pathname.startsWith(route));

      if (isLikelyAppRoute) {
        console.log("Detected app route, ensuring proper loading...");
        // Add marker to indicate this is a React app
        document.documentElement.setAttribute("data-react-app", "true");
      }
    }
  },

  // Initialize all safety measures
  init: () => {
    deploymentSafety.handleChunkError();
    deploymentSafety.preventBlankScreen();
    deploymentSafety.handleRoutingIssues();

    console.log("Deployment safety initialized");
  },
};

// Auto-initialize if we're in the browser
if (typeof window !== "undefined") {
  // Initialize after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", deploymentSafety.init);
  } else {
    deploymentSafety.init();
  }
}
