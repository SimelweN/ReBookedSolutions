/**
 * React Availability Checker
 *
 * This module ensures React is properly available to prevent
 * "Cannot read properties of undefined (reading 'createContext')" errors
 * that can occur in production builds or Vercel deployments.
 */

import * as React from "react";

/**
 * Comprehensive React availability validation
 */
export function validateReactAvailability(): {
  isAvailable: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if React namespace is available
  if (typeof React === "undefined") {
    errors.push("React namespace is not available");
  } else {
    // Check essential React APIs
    if (typeof React.createContext !== "function") {
      errors.push("React.createContext is not available");
    }

    if (typeof React.useContext !== "function") {
      errors.push("React.useContext is not available");
    }

    if (typeof React.createElement !== "function") {
      errors.push("React.createElement is not available");
    }

    if (typeof React.Fragment === "undefined") {
      errors.push("React.Fragment is not available");
    }

    if (typeof React.useState !== "function") {
      warnings.push("React.useState is not available");
    }

    if (typeof React.useEffect !== "function") {
      warnings.push("React.useEffect is not available");
    }
  }

  // Check global React availability (for third-party libraries)
  if (typeof window !== "undefined") {
    const globalReact = (window as any).React;
    if (!globalReact) {
      warnings.push("React is not available globally (window.React)");
    } else if (!globalReact.createContext) {
      warnings.push("React.createContext is not available globally");
    }
  }

  return {
    isAvailable: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Ensure React is available globally for third-party libraries
 */
export function ensureGlobalReact(): void {
  if (typeof window !== "undefined" && typeof React !== "undefined") {
    // Make React available globally
    (window as any).React = React;

    // Make specific APIs available that are commonly used
    (window as any).createContext = React.createContext;
    (window as any).useContext = React.useContext;
    (window as any).createElement = React.createElement;
    (window as any).useState = React.useState;
    (window as any).useEffect = React.useEffect;

    console.log("✅ React made available globally");
  }
}

/**
 * Safe fallback for React APIs in case they're not available
 */
export const ReactFallbacks = {
  createContext: <T>(defaultValue: T): React.Context<T> => {
    if (typeof React !== "undefined" && React.createContext) {
      return React.createContext(defaultValue);
    }

    // Fallback implementation
    console.warn("⚠️ Using fallback createContext implementation");
    return {
      Provider: ({ children }: { children: React.ReactNode }) =>
        typeof React !== "undefined" && React.createElement && React.Fragment
          ? React.createElement(React.Fragment, null, children)
          : (children as any),
      Consumer: ({ children }: { children: (value: T) => React.ReactNode }) =>
        typeof React !== "undefined" && React.createElement
          ? React.createElement(React.Fragment, null, children(defaultValue))
          : (children(defaultValue) as any),
      displayName: "FallbackContext",
    } as React.Context<T>;
  },

  useContext: <T>(context: React.Context<T>): T => {
    // Always return the context default value for fallback scenarios
    // This avoids conditional hook calls which violate React Rules of Hooks
    console.warn("⚠️ Using fallback useContext implementation");
    return context._currentValue || ({} as T);
  },
};

/**
 * Initialize React availability checks and fixes
 */
export function initializeReactAvailability(): void {
  const validation = validateReactAvailability();

  if (!validation.isAvailable) {
    console.error("❌ React availability validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));

    // Try to fix common issues
    if (typeof React !== "undefined") {
      console.log("🔧 Attempting to fix React availability issues...");
      ensureGlobalReact();
    } else {
      console.error("❌ Cannot fix React availability - React is not imported");
    }
  } else {
    console.log("✅ React availability validation passed");

    // Set up global React for third-party libraries
    ensureGlobalReact();
  }

  if (validation.warnings.length > 0) {
    console.warn("⚠��� React availability warnings:");
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

// Auto-initialize in development
if (import.meta.env.DEV) {
  initializeReactAvailability();
}

export default {
  validateReactAvailability,
  ensureGlobalReact,
  ReactFallbacks,
  initializeReactAvailability,
};
