/// <reference types="vite/client" />

// Global React fallback for production builds
declare global {
  interface Window {
    React?: typeof import("react");
    createContext?: typeof import("react").createContext;
  }
}
