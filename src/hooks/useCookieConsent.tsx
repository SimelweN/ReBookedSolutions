import { useState, useEffect, useCallback } from "react";
import { CookieManager, CookieConsent } from "@/utils/cookieManager";

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent on mount
  useEffect(() => {
    const currentConsent = CookieManager.getConsent();
    setConsent(currentConsent);
    setIsLoading(false);
  }, []);

  // Check if specific category is consented
  const hasConsent = useCallback(
    (category: "required" | "functional" | "analytics") => {
      return CookieManager.hasConsent(category);
    },
    [],
  );

  // Update consent
  const updateConsent = useCallback(
    (newConsent: Omit<CookieConsent, "timestamp">) => {
      CookieManager.setConsent(newConsent);
      setConsent({ ...newConsent, timestamp: Date.now() });
    },
    [],
  );

  // Track page visit (functional cookie)
  const trackPageVisit = useCallback(
    (path: string) => {
      if (hasConsent("functional")) {
        CookieManager.setLastPageVisited(path);
      }
    },
    [hasConsent],
  );

  // Set cart items (functional cookie)
  const saveCartItems = useCallback(
    (items: any[]) => {
      if (hasConsent("functional")) {
        return CookieManager.setCartItems(items);
      }
      return false;
    },
    [hasConsent],
  );

  // Get cart items (functional cookie)
  const getCartItems = useCallback(() => {
    if (hasConsent("functional")) {
      return CookieManager.getCartItems();
    }
    return [];
  }, [hasConsent]);

  // Analytics helpers
  const trackEvent = useCallback(
    (eventName: string, parameters?: any) => {
      if (hasConsent("analytics") && typeof gtag !== "undefined") {
        gtag("event", eventName, parameters);
      }
    },
    [hasConsent],
  );

  const shouldShowConsentPopup = useCallback(() => {
    return CookieManager.shouldShowConsentPopup();
  }, []);

  return {
    consent,
    isLoading,
    hasConsent,
    updateConsent,
    trackPageVisit,
    saveCartItems,
    getCartItems,
    trackEvent,
    shouldShowConsentPopup,
  };
};

export default useCookieConsent;
