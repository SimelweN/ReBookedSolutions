import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  handleBankingQueryError,
  logEnhancedError,
} from "@/utils/bankingErrorHandler";

export const useBankingSetup = () => {
  const { user } = useAuth();
  const [hasBankingSetup, setHasBankingSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupPopup, setShowSetupPopup] = useState(false);

  // Check if user has completed banking setup
  const checkBankingSetup = useCallback(async () => {
    if (!user?.id) {
      setHasBankingSetup(false);
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Checking banking setup for user:", user.id);

      const { data: subaccountData, error } = await supabase
        .from("paystack_subaccounts")
        .select("subaccount_code")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Banking setup query result:", {
        subaccountData,
        hasError: !!error,
        errorMessage: error?.message || "No error",
      });

      if (error) {
        const { shouldFallback } = handleBankingQueryError(
          "useBankingSetup",
          error,
        );

        if (shouldFallback) {
          setHasBankingSetup(false);
          return false;
        }

        setHasBankingSetup(false);
        return false;
      }

      const hasSetup = !!subaccountData?.subaccount_code?.trim();
      setHasBankingSetup(hasSetup);
      return hasSetup;
    } catch (error) {
      logEnhancedError("useBankingSetup - Banking setup check failed", error);
      setHasBankingSetup(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Check banking setup on mount and user change
  useEffect(() => {
    checkBankingSetup();
  }, [checkBankingSetup]);

  // Also check when window regains focus (user returns from banking setup)
  useEffect(() => {
    const handleFocus = () => {
      if (hasBankingSetup === false) {
        checkBankingSetup();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [hasBankingSetup, checkBankingSetup]);

  // Function to require banking setup (shows popup if not completed)
  const requireBankingSetup = useCallback(
    (action: string = "perform this action") => {
      if (hasBankingSetup === null || isLoading) {
        // Still loading, wait for result
        return false;
      }

      if (!hasBankingSetup) {
        setShowSetupPopup(true);
        return false;
      }

      return true;
    },
    [hasBankingSetup, isLoading],
  );

  // Function to close setup popup
  const closeSetupPopup = useCallback(() => {
    setShowSetupPopup(false);
    // Recheck banking setup after popup closes
    setTimeout(() => {
      checkBankingSetup();
    }, 1000);
  }, [checkBankingSetup]);

  return {
    hasBankingSetup,
    isLoading,
    showSetupPopup,
    requireBankingSetup,
    closeSetupPopup,
    recheckBankingSetup: checkBankingSetup,
  };
};
