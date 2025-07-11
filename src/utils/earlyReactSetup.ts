/**
 * Early React Setup - Must be imported FIRST
 * This ensures React is available globally before any other modules load
 */

// Polyfill for older environments - only in compatible environments
if (
  typeof window === "undefined" &&
  typeof globalThis === "undefined" &&
  typeof global !== "undefined"
) {
  try {
    (global as any).globalThis = global;
  } catch (error) {
    // Ignore polyfill errors in restricted environments like Workers
  }
}

// Import React as early as possible
import * as React from "react";

// Immediately make React available globally - only in compatible environments
const setupGlobalReact = () => {
  if (typeof window !== "undefined") {
    // Browser environment
    (window as any).React = React;
    (window as any).__REACT_GLOBAL__ = React;
    (window as any).createContext = React.createContext;
    (window as any).useContext = React.useContext;
    (window as any).createElement = React.createElement;
    (window as any).Component = React.Component;
    (window as any).Fragment = React.Fragment;
    (window as any).useState = React.useState;
    (window as any).useEffect = React.useEffect;
  }

  if (typeof global !== "undefined" && typeof window === "undefined") {
    // Node.js environment (but not Workers which also lack window)
    try {
      (global as any).React = React;
      (global as any).__REACT_GLOBAL__ = React;
    } catch (error) {
      // Ignore errors in restricted environments
    }
  }

  if (typeof globalThis !== "undefined" && typeof window !== "undefined") {
    // Universal environment - only in browser context
    try {
      (globalThis as any).React = React;
      (globalThis as any).__REACT_GLOBAL__ = React;
    } catch (error) {
      // Ignore errors in restricted environments
    }
  }
};

// Execute immediately - only in safe environments
if (
  typeof window !== "undefined" ||
  (typeof global !== "undefined" && typeof process !== "undefined")
) {
  setupGlobalReact();
}

// Validate that React.createContext is available
if (typeof React.createContext !== "function") {
  console.error(
    "❌ CRITICAL: React.createContext is not available after early setup!",
  );
  throw new Error(
    "React.createContext is not available - this will cause bundle errors",
  );
}

if (typeof window !== "undefined") {
  console.log(
    "✅ Early React setup completed - React.createContext is available",
  );
}

export default React;
export { React };
