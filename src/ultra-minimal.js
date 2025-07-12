// Absolute minimal entry point - zero module syntax, zero imports
// This must work in any build system without analysis issues

(function () {
  "use strict";

  // Simple environment check
  var isBrowser = false;
  try {
    isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";
  } catch (e) {
    // Not a browser
  }

  if (isBrowser) {
    console.log("ReBooked Solutions - Browser detected");

    // Show immediate content
    var root = document.getElementById("root");
    if (root) {
      root.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;background:#f9fafb;color:#374151;"><div style="text-align:center;"><h1 style="margin:0 0 16px 0;color:#1f2937;">ReBooked Solutions</h1><p style="margin:0;opacity:0.7;">Your textbook marketplace is loading...</p></div></div>';
    }

    // Try to load main app after a delay (avoid immediate import analysis)
    setTimeout(function () {
      // Use dynamic import only if available
      if (typeof window.importShim !== "undefined") {
        window.importShim("./smart-main.js");
      } else if (typeof eval === "function") {
        // Fallback using eval to avoid static analysis
        eval(
          'import("./smart-main.js").catch(function(e) { console.error("Import failed:", e); })',
        );
      }
    }, 500);
  } else {
    console.log("ReBooked Solutions - Server/Workers environment");
  }

  // Global export for compatibility
  if (typeof window !== "undefined") {
    window.ReBookedApp = function () {
      return "ReBooked Solutions - Browser Mode";
    };
  }
})();
