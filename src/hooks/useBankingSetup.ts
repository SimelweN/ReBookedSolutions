import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: bankingDetails, error } = await supabase
        .from("banking_details")
        .select("paystack_subaccount_code")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Banking setup query result:", { bankingDetails, error });

      if (error) {
        console.error("Error checking banking setup:", error.message || error);
        setHasBankingSetup(false);
        return false;
      }

      const hasSetup = !!bankingDetails?.paystack_subaccount_code?.trim();
      setHasBankingSetup(hasSetup);
      return hasSetup;
    } catch (error) {
      console.error(
        "Banking setup check failed:",
        error instanceof Error ? error.message : error,
      );
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
