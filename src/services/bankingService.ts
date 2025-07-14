import { supabase } from "@/integrations/supabase/client";

export interface BankingDetails {
  business_name: string;
  email: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
}

export interface BankingResponse {
  success: boolean;
  message: string;
  subaccount_code?: string;
  user_id?: string;
  data?: {
    subaccount_code: string;
    business_name: string;
    bank_name: string;
    account_number_masked: string;
  };
  error?: string;
  details?: any;
}

export class BankingService {
  /**
   * Create a Paystack subaccount with banking details
   */
  static async createBankingDetails(
    details: BankingDetails,
  ): Promise<BankingResponse> {
    try {
      // Get current session for authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Authentication required. Please log in.");
      }

      console.log("Creating banking details for user:", session.user.id);

      // Call the Supabase function
      const { data, error } = await supabase.functions.invoke(
        "create-paystack-subaccount",
        {
          body: {
            business_name: details.business_name.trim(),
            email: details.email.trim(),
            bank_name: details.bank_name,
            bank_code: details.bank_code,
            account_number: details.account_number.replace(/\s/g, ""), // Remove spaces
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to create banking details");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to create banking details");
      }

      console.log("Banking details created successfully:", data);
      return data as BankingResponse;
    } catch (error) {
      console.error("Error in createBankingDetails:", error);

      // Return a structured error response
      return {
        success: false,
        message: "Failed to create banking details",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Check if user has banking details set up
   */
  static async checkBankingStatus(userId?: string): Promise<{
    hasSubaccount: boolean;
    subaccountCode?: string;
    businessName?: string;
    bankName?: string;
    accountNumberMasked?: string;
  }> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { hasSubaccount: false };
        userId = user.id;
      }

      // Check profile for subaccount_code
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        console.warn("Could not fetch user profile:", error);
        return { hasSubaccount: false };
      }

      const preferences = profile.preferences as any;
      const subaccountCode = preferences?.subaccount_code;

      if (!subaccountCode) {
        return { hasSubaccount: false };
      }

      return {
        hasSubaccount: true,
        subaccountCode,
        businessName: preferences?.business_name,
        bankName: preferences?.bank_details?.bank_name,
        accountNumberMasked: preferences?.bank_details?.account_number,
      };
    } catch (error) {
      console.error("Error checking banking status:", error);
      return { hasSubaccount: false };
    }
  }

  /**
   * Get banking details from banking_subaccounts table
   */
  static async getBankingDetails(userId?: string): Promise<{
    business_name?: string;
    bank_name?: string;
    account_number_masked?: string;
    email?: string;
    status?: string;
    created_at?: string;
  } | null> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;
        userId = user.id;
      }

      // Get from banking_subaccounts table
      const { data, error } = await supabase
        .from("banking_subaccounts")
        .select(
          "business_name, bank_name, account_number, email, status, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("No banking details found:", error);
        return null;
      }

      return {
        business_name: data.business_name,
        bank_name: data.bank_name,
        account_number_masked: `****${data.account_number?.slice(-4)}`,
        email: data.email,
        status: data.status,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error("Error getting banking details:", error);
      return null;
    }
  }

  /**
   * Validate South African account number format
   */
  static validateAccountNumber(accountNumber: string): boolean {
    const cleaned = accountNumber.replace(/\s/g, "");
    return /^\d{8,11}$/.test(cleaned);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Format account number for display (with spaces)
   */
  static formatAccountNumber(accountNumber: string): string {
    const digits = accountNumber.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  /**
   * Get list of supported South African banks
   */
  static getSouthAfricanBanks() {
    return [
      { code: "632005", name: "ABSA Bank" },
      { code: "250655", name: "FNB (First National Bank)" },
      { code: "051001", name: "Standard Bank" },
      { code: "470010", name: "Nedbank" },
      { code: "580105", name: "Investec Bank" },
      { code: "678910", name: "Capitec Bank" },
      { code: "462005", name: "Discovery Bank" },
      { code: "430000", name: "Bidvest Bank" },
      { code: "220026", name: "Sasfin Bank" },
      { code: "588757", name: "African Bank" },
    ];
  }
}

export default BankingService;
