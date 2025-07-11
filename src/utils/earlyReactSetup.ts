/**
 * Early React Setup - Must be imported FIRST
 * This ensures React is available globally before any other modules load
 */

// Polyfill for older environments (only in Node.js, not Workers)
if (typeof globalThis === "undefined" && typeof global !== "undefined") {
  try {
    (global as any).globalThis = global;
  } catch (error) {
    // Ignore polyfill errors in restricted environments
  }
}

// Import React as early as possible
import * as React from "react";

// Immediately make React available globally
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

  if (typeof global !== "undefined") {
    // Node.js environment
    (global as any).React = React;
    (global as any).__REACT_GLOBAL__ = React;
  }

  if (typeof globalThis !== "undefined") {
    // Universal environment
    (globalThis as any).React = React;
    (globalThis as any).__REACT_GLOBAL__ = React;
  }
};

// Execute immediately
setupGlobalReact();

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
