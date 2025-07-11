// Instant startup utility to bypass all loading states
// This ensures the app is immediately usable
import { safeLocalStorage } from "./safeLocalStorage";

export const enableInstantStartup = () => {
  // Override any persistent loading states in localStorage
  try {
    localStorage.setItem("app_instant_mode", "true");
    localStorage.setItem("auth_skip_loading", "true");
    // Instant startup mode enabled
  } catch (error) {
    console.warn("Could not enable instant startup mode:", error);
  }
};

export const isInstantStartupEnabled = () => {
  try {
    return localStorage.getItem("app_instant_mode") === "true";
  } catch {
    return false;
  }
};

export const shouldSkipAuthLoading = () => {
  try {
    return localStorage.getItem("auth_skip_loading") === "true";
  } catch {
    return false;
  }
};

// Auto-enable instant startup in development
if (import.meta.env.DEV) {
  enableInstantStartup();
}
