/**
 * React Context Safety Utilities
 *
 * This file provides safe wrappers for React context creation to prevent
 * "Cannot read properties of undefined (reading 'createContext')" errors
 */

import * as React from "react";
import { ReactFallbacks } from "./reactAvailabilityCheck";

/**
 * Safe context creator that validates React availability
 */
export function createSafeContext<T>(
  defaultValue: T,
  contextName = "UnnamedContext",
): React.Context<T> {
  try {
    // First, try the standard React.createContext
    if (
      typeof React !== "undefined" &&
      typeof React.createContext === "function"
    ) {
      console.log(`✅ Creating safe context: ${contextName}`);
      return React.createContext<T>(defaultValue);
    }

    // If that fails, use the fallback implementation
    console.warn(`⚠️ Using fallback createContext for: ${contextName}`);
    return ReactFallbacks.createContext<T>(defaultValue);
  } catch (error) {
    console.error(
      `❌ Failed to create context ${contextName}:`,
      error instanceof Error ? error.message : String(error),
    );

    // Last resort fallback context that won't break the app
    const emergencyFallbackContext = {
      Provider: ({ children }: { children: React.ReactNode }) => {
        console.warn(`⚠️ Using emergency fallback provider for ${contextName}`);
        if (
          typeof React !== "undefined" &&
          React.createElement &&
          React.Fragment
        ) {
          return React.createElement(React.Fragment, null, children);
        }
        // If even React.createElement isn't available, return children as-is
        return children as any;
      },
      Consumer: ({ children }: { children: (value: T) => React.ReactNode }) => {
        console.warn(`⚠️ Using emergency fallback consumer for ${contextName}`);
        return children(defaultValue);
      },
      displayName: `EmergencyFallback_${contextName}`,
    } as React.Context<T>;

    return emergencyFallbackContext;
  }
}

/**
 * Safe context hook that validates the context is properly available
 */
export function createSafeContextHook<T>(
  context: React.Context<T | undefined>,
  contextName = "UnnamedContext",
) {
  return function useSafeContext(): T {
    try {
      // Validate React hooks are available
      if (typeof React.useContext !== "function") {
        throw new Error("React.useContext is not available");
      }

      const contextValue = React.useContext(context);

      if (contextValue === undefined) {
        throw new Error(
          `${contextName} must be used within its Provider. ` +
            `Make sure the component is wrapped with ${contextName}Provider.`,
        );
      }

      return contextValue;
    } catch (error) {
      console.error(
        `❌ Context hook error for ${contextName}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  };
}

/**
 * Enhanced context provider with error boundaries
 */
export function createSafeProvider<T>(
  Context: React.Context<T>,
  contextName = "UnnamedProvider",
) {
  return function SafeProvider({
    value,
    children,
  }: {
    value: T;
    children: React.ReactNode;
  }) {
    try {
      return React.createElement(Context.Provider, { value }, children);
    } catch (error) {
      console.error(
        `❌ Provider error for ${contextName}:`,
        error instanceof Error ? error.message : String(error),
      );

      // Return children without context in case of error
      return React.createElement(React.Fragment, null, children);
    }
  };
}

/**
 * Validate React context environment
 */
export function validateReactContextEnvironment(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof React === "undefined") {
    errors.push("React is not available");
  }

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

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Auto-validate on import
if (import.meta.env.DEV) {
  const validation = validateReactContextEnvironment();
  if (!validation.isValid) {
    console.error("❌ React context environment validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
  } else {
    console.log("✅ React context environment validation passed");
  }
}

export default {
  createSafeContext,
  createSafeContextHook,
  createSafeProvider,
  validateReactContextEnvironment,
};
