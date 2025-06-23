/**
 * Paystack configuration
 */
export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  SECRET_KEY: import.meta.env.VITE_PAYSTACK_SECRET_KEY || "",
  BASE_URL: "https://api.paystack.co",
  CALLBACK_URL: `${window.location.origin}/payment-callback`,

  // Validation
  isConfigured: () => {
    const hasPublicKey = Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
    const hasSecretKey = Boolean(import.meta.env.VITE_PAYSTACK_SECRET_KEY);

    if (!hasPublicKey || !hasSecretKey) {
      console.warn(
        "⚠️ Paystack configuration incomplete. Some features may not work.",
      );
      return false;
    }

    return true;
  },

  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
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
