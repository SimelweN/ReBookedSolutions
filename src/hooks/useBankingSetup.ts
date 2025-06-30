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
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subaccount_code")
        .eq("id", user.id)
        .single();

      if (error) {
        // Check if error is due to missing column
        if (
          error.message?.includes("column") &&
          error.message?.includes("does not exist")
        ) {
          console.warn(
            "subaccount_code column not found - banking setup not available yet",
          );
          setHasBankingSetup(false);
          return false;
        }
        console.error("Error checking banking setup:", error.message || error);
        setHasBankingSetup(false);
        return false;
      }

      const hasSetup = !!profile?.subaccount_code?.trim();
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
