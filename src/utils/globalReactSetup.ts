/**
 * Global React Setup
 * Ensures React and its APIs are available globally for third-party scripts
 */

import * as React from "react";

/**
 * Set up React globally to prevent third-party script errors
 */
export function setupGlobalReact() {
  if (typeof window === "undefined") return;

  // Make React available globally
  (window as any).React = React;
  (window as any).__REACT_GLOBAL__ = React;

  // Make specific React APIs available that third-party scripts might need
  (window as any).createContext = React.createContext;
  (window as any).useContext = React.useContext;
  (window as any).useState = React.useState;
  (window as any).useEffect = React.useEffect;
  (window as any).createElement = React.createElement;
  (window as any).Component = React.Component;
  (window as any).Fragment = React.Fragment;

  console.log("✅ React globals initialized for third-party compatibility");
}

/**
 * Create a safe context creator that handles errors gracefully
 */
export function createSafeContext<T>(defaultValue?: T) {
  try {
    return React.createContext<T>(defaultValue as T);
  } catch (error) {
    console.warn("Failed to create React context, using fallback:", error);
    // Return a mock context that won't break
    return {
      Provider: ({ children }: { children: React.ReactNode }) => children,
      Consumer: ({ children }: { children: (value: T) => React.ReactNode }) =>
        children(defaultValue as T),
      displayName: "SafeContext",
    } as any;
  }
}

// Auto-initialize when loaded
setupGlobalReact();

export default { setupGlobalReact, createSafeContext };
