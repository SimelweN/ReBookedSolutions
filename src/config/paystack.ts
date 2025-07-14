/**
 * Paystack configuration
 */
export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  BASE_URL: "https://api.paystack.co",
  CALLBACK_URL: "/payment-callback", // Will be resolved at runtime
  getCallbackUrl: () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/payment-callback`
      : "/payment-callback",

  // Validation
  isConfigured: () => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    const hasPublicKey = Boolean(publicKey);

    if (!hasPublicKey) {
      console.warn(
        "⚠️ Paystack configuration incomplete. VITE_PAYSTACK_PUBLIC_KEY not found.",
        "Set this environment variable to enable payments.",
      );
      return false;
    }

    // Validate key format
    if (!publicKey.startsWith("pk_")) {
      console.error(
        "❌ Invalid Paystack public key format. Must start with 'pk_test_' or 'pk_live_'",
      );
      return false;
    }

    return true;
  },

  // Test mode detection
  isTestMode: () => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
    return publicKey.startsWith("pk_test_");
  },

  isLiveMode: () => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
    return publicKey.startsWith("pk_live_");
  },

  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Get status for debugging
  getStatus: () => {
    const config = PAYSTACK_CONFIG;
    return {
      configured: config.isConfigured(),
      testMode: config.isTestMode(),
      liveMode: config.isLiveMode(),
      development: config.isDevelopment,
      production: config.isProduction,
      publicKey: config.PUBLIC_KEY
        ? `${config.PUBLIC_KEY.slice(0, 12)}...`
        : "Not set",
    };
  },
};

// Bank codes mapping for Paystack
export const PAYSTACK_BANK_CODES: Record<string, string> = {
  "Absa Bank": "632005",
  "Capitec Bank": "470010",
  "First National Bank (FNB)": "250655",
  "Investec Bank": "580105",
  Nedbank: "198765",
  "Standard Bank": "051001",
  "African Bank": "430000",
  "Mercantile Bank": "450905",
  TymeBank: "678910",
  "Bidvest Bank": "679000",
  "Sasfin Bank": "683000",
  "Bank of Athens": "410506",
  "RMB Private Bank": "222026",
  "South African Post Bank (Post Office)": "460005",
  "Hollard Bank": "585001",
  "Discovery Bank": "679000",
  "Standard Chartered Bank": "730020",
  "Barclays Bank": "590000",
};

export default PAYSTACK_CONFIG;
