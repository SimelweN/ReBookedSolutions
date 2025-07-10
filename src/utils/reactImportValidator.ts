/**
 * React Import Validator
 *
 * This utility ensures React is properly imported to prevent
 * "Cannot read properties of undefined (reading 'createContext')" errors
 * that can occur during bundling when React is not available in the namespace.
 */

import * as React from "react";

// Ensure React is available globally for components that might need it
if (typeof window !== "undefined" && !(window as any).React) {
  try {
    // Import React and make it available globally as a fallback
    import("react")
      .then((React) => {
        (window as any).React = React;
        console.log("✅ React globally available for fallback");
      })
      .catch((error) => {
        console.warn("⚠️ Failed to set global React fallback:", error);
      });
  } catch (error) {
    console.warn("⚠️ React import validation setup failed:", error);
  }
}

// Validation function to check if React is properly available
export const validateReactImport = () => {
  try {
    // Test if createContext is available
    const testCreateContext =
      typeof React !== "undefined" ? React.createContext : undefined;

    if (!testCreateContext) {
      console.warn("⚠️ React.createContext is not available");
      return false;
    }

    console.log("✅ React import validation passed");
    return true;
  } catch (error) {
    console.error("❌ React import validation failed:", error);
    return false;
  }
};

// Emergency React context creator with validation
export const safeCreateContext = <T>(defaultValue: T, contextName?: string) => {
  try {
    if (typeof React !== "undefined" && React.createContext) {
      return React.createContext<T>(defaultValue);
    } else {
      // Fallback for cases where React is not properly imported
      console.warn(
        `⚠️ Creating fallback context for ${contextName || "unnamed context"}`,
      );

      // Use dynamic import as fallback
      return import("react").then((ReactModule) => {
        return ReactModule.createContext<T>(defaultValue);
      });
    }
  } catch (error) {
    console.error(`❌ Failed to create context ${contextName || ""}:`, error);
    throw new Error(
      `React context creation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Check and report React import issues
export const reportReactImportStatus = () => {
  const status = {
    reactAvailable: typeof React !== "undefined",
    createContextAvailable:
      typeof React !== "undefined" && typeof React.createContext === "function",
    useContextAvailable:
      typeof React !== "undefined" && typeof React.useContext === "function",
    useStateAvailable:
      typeof React !== "undefined" && typeof React.useState === "function",
    timestamp: new Date().toISOString(),
  };

  console.log("📊 React Import Status:", status);

  if (!status.createContextAvailable) {
    console.error(
      "❌ CRITICAL: React.createContext is not available!\n" +
        "This will cause \"Cannot read properties of undefined (reading 'createContext')\" errors.\n" +
        'Make sure React is properly imported with: import * as React from "react";',
    );
  }

  return status;
};

// Development mode checker
if (import.meta.env.DEV) {
  // Add debug utilities to window
  (window as any).validateReactImport = validateReactImport;
  (window as any).reportReactImportStatus = reportReactImportStatus;

  // Auto-validate on load
  setTimeout(() => {
    reportReactImportStatus();
  }, 1000);
}

export default {
  validateReactImport,
  safeCreateContext,
  reportReactImportStatus,
};
