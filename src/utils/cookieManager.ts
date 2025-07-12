export type CookieCategory = "required" | "functional" | "analytics";

export interface CookieConsent {
  required: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: number;
}

export interface CookieOptions {
  expires?: number; // days
  maxAge?: number; // seconds
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  domain?: string;
  path?: string;
}

export class CookieManager {
  private static readonly CONSENT_COOKIE_NAME = "cookie_consent";
  private static readonly DEFAULT_OPTIONS: CookieOptions = {
    secure: window.location.protocol === "https:",
    sameSite: "Lax",
    path: "/",
  };

  // Get cookie consent status
  static getConsent(): CookieConsent | null {
    try {
      const consent = this.getCookie(this.CONSENT_COOKIE_NAME);
      return consent ? JSON.parse(consent) : null;
    } catch {
      return null;
    }
  }

  // Set cookie consent
  static setConsent(consent: Omit<CookieConsent, "timestamp">): void {
    const consentWithTimestamp: CookieConsent = {
      ...consent,
      timestamp: Date.now(),
    };

    this.setCookie(
      this.CONSENT_COOKIE_NAME,
      JSON.stringify(consentWithTimestamp),
      {
        expires: 365, // 1 year
        secure: true,
        sameSite: "Strict",
      },
    );
  }

  // Check if we have consent for a specific category
  static hasConsent(category: CookieCategory): boolean {
    const consent = this.getConsent();
    if (!consent) return false;

    switch (category) {
      case "required":
        return true; // Required cookies are always allowed
      case "functional":
        return consent.functional;
      case "analytics":
        return consent.analytics;
      default:
        return false;
    }
  }

  // Set a cookie with proper security flags
  static setCookie(
    name: string,
    value: string,
    options: CookieOptions = {},
    category: CookieCategory = "required",
  ): boolean {
    // Check consent before setting non-required cookies
    if (category !== "required" && !this.hasConsent(category)) {
      console.warn(`Cookie consent not granted for category: ${category}`);
      return false;
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.expires) {
      const expiryDate = new Date();
      expiryDate.setTime(
        expiryDate.getTime() + opts.expires * 24 * 60 * 60 * 1000,
      );
      cookieString += `; Expires=${expiryDate.toUTCString()}`;
    }

    if (opts.maxAge) {
      cookieString += `; Max-Age=${opts.maxAge}`;
    }

    if (opts.path) {
      cookieString += `; Path=${opts.path}`;
    }

    if (opts.domain) {
      cookieString += `; Domain=${opts.domain}`;
    }

    if (opts.secure) {
      cookieString += "; Secure";
    }

    if (opts.httpOnly) {
      cookieString += "; HttpOnly";
    }

    if (opts.sameSite) {
      cookieString += `; SameSite=${opts.sameSite}`;
    }

    try {
      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.error("Failed to set cookie:", error);
      return false;
    }
  }

  // Get a cookie value
  static getCookie(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const value = cookie.substring(nameEQ.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  }

  // Delete a cookie
  static deleteCookie(name: string, path: string = "/", domain?: string): void {
    let cookieString = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=${path}`;

    if (domain) {
      cookieString += `; Domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  // Clear all cookies for a specific category
  static clearCookiesByCategory(category: CookieCategory): void {
    const categoryMap: Record<CookieCategory, string[]> = {
      required: [
        "session_token",
        "csrf_token",
        "cookie_consent",
        "subaccount_code",
        "locale",
      ],
      functional: ["remember_me", "cart_items", "last_page_visited"],
      analytics: ["_ga", "_gid", "_fbp"],
    };

    const cookiesToClear = categoryMap[category] || [];
    cookiesToClear.forEach((cookieName) => {
      this.deleteCookie(cookieName);
    });
  }

  // Application-specific cookie methods
  static setSessionToken(token: string, rememberMe: boolean = false): boolean {
    return this.setCookie(
      "session_token",
      token,
      {
        expires: rememberMe ? 30 : undefined, // 30 days if remember me, session otherwise
        secure: true,
        httpOnly: false, // Need JS access for API calls
        sameSite: "Strict",
      },
      "required",
    );
  }

  static getSessionToken(): string | null {
    return this.getCookie("session_token");
  }

  static setSubaccountCode(code: string): boolean {
    return this.setCookie(
      "subaccount_code",
      code,
      {
        expires: 365, // 1 year
        secure: true,
        httpOnly: false,
        sameSite: "Strict",
      },
      "required",
    );
  }

  static getSubaccountCode(): string | null {
    return this.getCookie("subaccount_code");
  }

  static setRememberMe(userId: string): boolean {
    return this.setCookie(
      "remember_me",
      userId,
      {
        expires: 30, // 30 days
        secure: true,
        sameSite: "Strict",
      },
      "functional",
    );
  }

  static getRememberMe(): string | null {
    return this.getCookie("remember_me");
  }

  static setCartItems(items: any[]): boolean {
    return this.setCookie(
      "cart_items",
      JSON.stringify(items),
      {
        expires: 7, // 7 days
        secure: true,
        sameSite: "Lax",
      },
      "functional",
    );
  }

  static getCartItems(): any[] {
    try {
      const items = this.getCookie("cart_items");
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  }

  static setLastPageVisited(path: string): boolean {
    return this.setCookie(
      "last_page_visited",
      path,
      {
        expires: 1, // 1 day
        secure: true,
        sameSite: "Lax",
      },
      "functional",
    );
  }

  static getLastPageVisited(): string | null {
    return this.getCookie("last_page_visited");
  }

  static setLocale(locale: string): boolean {
    return this.setCookie(
      "locale",
      locale,
      {
        expires: 365, // 1 year
        secure: true,
        sameSite: "Lax",
      },
      "required",
    );
  }

  static getLocale(): string | null {
    return this.getCookie("locale");
  }

  // Analytics helpers
  static initializeAnalytics(): void {
    if (!this.hasConsent("analytics")) return;

    // Google Analytics initialization would go here
    if (typeof gtag !== "undefined") {
      // GA already loaded
      return;
    }

    // Load Google Analytics script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID";
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag("js", new Date());
      gtag("config", "YOUR_GA_ID");
    };
  }

  // Check if consent popup should be shown
  static shouldShowConsentPopup(): boolean {
    return this.getConsent() === null;
  }

  // Clear all non-essential cookies on consent withdrawal
  static onConsentWithdrawn(categories: CookieCategory[]): void {
    categories.forEach((category) => {
      if (category !== "required") {
        this.clearCookiesByCategory(category);
      }
    });
  }
}
