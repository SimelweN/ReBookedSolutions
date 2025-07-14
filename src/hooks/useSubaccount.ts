import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubaccountData {
  subaccount_code: string | null;
  banking_setup_complete: boolean;
  business_name?: string;
  bank_details?: {
    bank_name: string;
    account_number: string;
    bank_code: string;
  };
}

export const useSubaccount = () => {
  const [subaccountData, setSubaccountData] = useState<SubaccountData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's subaccount data
  const loadSubaccountData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("User not authenticated");
        return null;
      }

      // Try to get subaccount data from banking_subaccounts table first (preferred method)
      const { data: bankingData, error: bankingError } = await supabase
        .from("banking_subaccounts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!bankingError && bankingData) {
        const subaccountInfo: SubaccountData = {
          subaccount_code: bankingData.subaccount_code,
          banking_setup_complete: !!bankingData.subaccount_code,
          business_name: bankingData.business_name,
          bank_details: {
            bank_name: bankingData.bank_name,
            account_number: bankingData.account_number,
            bank_code: bankingData.bank_code,
          },
        };

        setSubaccountData(subaccountInfo);
        return subaccountInfo;
      }

      // Fallback to profile table if banking_subaccounts doesn't have data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subaccount_code, preferences")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        setError("Failed to load profile data");
        return null;
      }

      let subaccountInfo: SubaccountData = {
        subaccount_code: profile?.subaccount_code || null,
        banking_setup_complete: false,
      };

      // Parse preferences if they exist and are valid
      if (
        profile?.preferences &&
        typeof profile.preferences === "object" &&
        profile.preferences !== null
      ) {
        const preferences = profile.preferences as any;
        subaccountInfo = {
          ...subaccountInfo,
          banking_setup_complete: preferences.banking_setup_complete || false,
          business_name: preferences.business_name,
          bank_details: preferences.bank_details,
        };
      }

      setSubaccountData(subaccountInfo);
      return subaccountInfo;
    } catch (err) {
      console.error("Error loading subaccount data:", err);
      setError("Unexpected error loading subaccount data");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a valid subaccount
  const hasValidSubaccount = (): boolean => {
    return !!(
      subaccountData?.subaccount_code && subaccountData?.banking_setup_complete
    );
  };

  // Get subaccount code for transactions
  const getSubaccountCode = (): string | null => {
    return subaccountData?.subaccount_code || null;
  };

  // Update user's books with subaccount code
  const linkBooksToSubaccount = async (subaccount_code: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("books")
        .update({ subaccount_code })
        .eq("seller_id", session.user.id)
        .is("subaccount_code", null) // Only update books that don't already have a subaccount_code
        .select("id");

      if (error) {
        console.error("Error linking books to subaccount:", error);
        throw error;
      }

      const linkedCount = data?.length || 0;
      toast.success("Success", {
        description: `${linkedCount} books have been linked to your payment account`,
      });

      return linkedCount;
    } catch (error: any) {
      console.error("Error linking books:", error);
      toast.error("Warning", {
        description: "Failed to link existing books to payment account",
      });
      return 0;
    }
  };

  // Refresh subaccount data
  const refreshSubaccountData = async () => {
    return await loadSubaccountData();
  };

  // Initialize on mount
  useEffect(() => {
    loadSubaccountData();
  }, []);

  return {
    subaccountData,
    isLoading,
    error,
    hasValidSubaccount,
    getSubaccountCode,
    loadSubaccountData,
    refreshSubaccountData,
    linkBooksToSubaccount,
  };
};

// Utility function to create a book with subaccount linking
export const createBookWithSubaccount = async (bookData: any) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Get user's subaccount code from banking_subaccounts table first
    const { data: bankingData } = await supabase
      .from("banking_subaccounts")
      .select("subaccount_code")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let subaccountCode = bankingData?.subaccount_code;

    // Fallback to profile table if not found in banking_subaccounts
    if (!subaccountCode) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subaccount_code")
        .eq("id", session.user.id)
        .single();

      subaccountCode = profile?.subaccount_code;
    }

    if (!subaccountCode) {
      throw new Error(
        "Banking setup required. Please complete your banking details first.",
      );
    }

    // Create book with subaccount code
    const { data, error } = await supabase
      .from("books")
      .insert({
        ...bookData,
        seller_id: session.user.id,
        subaccount_code: subaccountCode,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating book with subaccount:", error);
    throw error;
  }
};

// Utility function to get split payment data
export const calculatePaymentSplit = (
  bookPrice: number,
  deliveryFee: number = 0,
) => {
  const platformCommission = bookPrice * 0.1; // 10% platform fee
  const sellerAmount = bookPrice - platformCommission;
  const courierAmount = deliveryFee;
  const totalAmount = bookPrice + deliveryFee;

  return {
    totalAmount,
    bookPrice,
    deliveryFee,
    platformCommission,
    sellerAmount,
    courierAmount,
  };
};
