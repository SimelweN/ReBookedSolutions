import * as React from "react";

// React safety utility to prevent createContext errors
export const safeCreateContext = <T>(defaultValue?: T) => {
  // First try using the imported React
  if (React && React.createContext) {
    return React.createContext<T | undefined>(defaultValue);
  }

  // Fallback to global React if available
  if (
    typeof window !== "undefined" &&
    window.React &&
    window.React.createContext
  ) {
    return window.React.createContext<T | undefined>(defaultValue);
  }

  // Last resort - try global createContext
  if (typeof window !== "undefined" && window.createContext) {
    return window.createContext<T | undefined>(defaultValue);
  }

  // If all else fails, throw an informative error
  console.error("🚨 React.createContext is not available!");
  console.error("Available React methods:", Object.keys(React || {}));
  console.error(
    "Window React:",
    typeof window !== "undefined" ? window.React : "No window",
  );

  throw new Error(
    "React.createContext is not available. This might be due to a bundling issue. " +
      "Try refreshing the page or clearing your browser cache.",
  );
};

// React hooks safety wrappers
export const safeUseContext = <T>(context: React.Context<T>) => {
  if (React && React.useContext) {
    return React.useContext(context);
  }

  if (
    typeof window !== "undefined" &&
    window.React &&
    window.React.useContext
  ) {
    return window.React.useContext(context);
  }

  throw new Error("React.useContext is not available");
};

export const safeUseState = <T>(initialState: T | (() => T)) => {
  if (React && React.useState) {
    return React.useState(initialState);
  }

  if (typeof window !== "undefined" && window.React && window.React.useState) {
    return window.React.useState(initialState);
  }

  throw new Error("React.useState is not available");
};

export const safeUseEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList,
) => {
  if (React && React.useEffect) {
    return React.useEffect(effect, deps);
  }

  if (typeof window !== "undefined" && window.React && window.React.useEffect) {
    return window.React.useEffect(effect, deps);
  }

  throw new Error("React.useEffect is not available");
};

export const safeUseCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T => {
  if (React && React.useCallback) {
    return React.useCallback(callback, deps);
  }

  if (
    typeof window !== "undefined" &&
    window.React &&
    window.React.useCallback
  ) {
    return window.React.useCallback(callback, deps);
  }

  throw new Error("React.useCallback is not available");
};

export const safeUseMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
): T => {
  if (React && React.useMemo) {
    return React.useMemo(factory, deps);
  }

  if (typeof window !== "undefined" && window.React && window.React.useMemo) {
    return window.React.useMemo(factory, deps);
  }

  throw new Error("React.useMemo is not available");
};

// Debug function to check React availability
export const debugReactAvailability = () => {
  const info = {
    reactImported: !!React,
    reactCreateContext: !!(React && React.createContext),
    windowReact: typeof window !== "undefined" ? !!window.React : false,
    windowCreateContext:
      typeof window !== "undefined" ? !!window.createContext : false,
    reactMethods: React ? Object.keys(React) : [],
  };

  console.log("🔍 React Availability Debug:", info);
  return info;
};
