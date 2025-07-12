// Ultra-minimal JavaScript entry point for Workers compatibility
// This avoids ANY TypeScript compilation issues in Workers builds

// Simple browser check without any TypeScript syntax
function isBrowser() {
  try {
    return typeof window !== "undefined" && typeof document !== "undefined";
  } catch (e) {
    return false;
  }
}

// Only run browser code in actual browser environment
if (isBrowser()) {
  // Load everything dynamically to avoid static analysis issues
  Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./index.css"),
  ])
    .then(function (modules) {
      var React = modules[0];
      var ReactDOM = modules[1];

      // Load the TypeScript App component
      import("./App.tsx")
        .then(function (AppModule) {
          var App = AppModule.default;

          try {
            var rootElement = document.getElementById("root");
            if (rootElement) {
              ReactDOM.createRoot(rootElement).render(
                React.createElement(
                  React.StrictMode,
                  null,
                  React.createElement(App),
                ),
              );
            }
          } catch (error) {
            console.error("Failed to render:", error);
            try {
              var rootElement = document.getElementById("root");
              if (rootElement) {
                rootElement.innerHTML =
                  '<div style="padding:20px;font-family:Arial,sans-serif;"><h1>ReBooked Solutions</h1><p>Loading error. Please refresh.</p></div>';
              }
            } catch (e) {
              console.error("Fallback failed:", e);
            }
          }
        })
        .catch(function (error) {
          console.error("Failed to load App:", error);
          try {
            var rootElement = document.getElementById("root");
            if (rootElement) {
              rootElement.innerHTML =
                '<div style="padding:20px;font-family:Arial,sans-serif;"><h1>ReBooked Solutions</h1><p>App loading failed. Please refresh.</p></div>';
            }
          } catch (e) {
            console.error("App fallback failed:", e);
          }
        });
    })
    .catch(function (error) {
      console.error("Failed to load React:", error);
    });
} else {
  console.log("Non-browser environment - skipping React");
}

// Simple export for Workers/static environments
export default function WorkersCompatibleApp() {
  return "ReBooked Solutions - Workers Build";
}
