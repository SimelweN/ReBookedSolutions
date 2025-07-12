// Ultra-minimal entry point with ZERO static dependencies
// Conditionally loads full app only in browser environments

// Simple environment check
function isBrowser() {
  try {
    return typeof window !== "undefined" && typeof document !== "undefined";
  } catch (e) {
    return false;
  }
}

// Only load full app in browser
if (isBrowser()) {
  console.log("ReBooked Solutions - Loading full application...");

  // Show loading message immediately
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        background: #f9fafb;
        color: #374151;
      ">
        <div style="text-align: center;">
          <h1 style="margin: 0 0 16px 0; color: #1f2937;">ReBooked Solutions</h1>
          <p style="margin: 0; opacity: 0.7;">Loading your textbook marketplace...</p>
        </div>
      </div>
    `;
  }

  // Load the full React app dynamically
  setTimeout(() => {
    import("./smart-main.js").catch((error) => {
      console.error("Failed to load main app:", error);
      if (root) {
        root.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background: #fef2f2;
            color: #991b1b;
          ">
            <div style="text-align: center; max-width: 400px;">
              <h1 style="margin: 0 0 16px 0;">ReBooked Solutions</h1>
              <p style="margin: 0 0 16px 0;">Failed to load application</p>
              <button onclick="window.location.reload()" style="
                background: #dc2626;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
              ">Refresh Page</button>
            </div>
          </div>
        `;
      }
    });
  }, 100);
} else {
  console.log("ReBooked Solutions - Non-browser environment detected");
}

// Export for Workers/static environments
export default function minimal() {
  return "ReBooked Solutions - Minimal Build Compatible";
}
