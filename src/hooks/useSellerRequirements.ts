import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { handleBankingQueryError } from "@/utils/bankingErrorHandler";
import { toast } from "sonner";

interface SellerRequirements {
  hasBankingSetup: boolean;
  hasPickupAddress: boolean;
  isComplete: boolean;
  missingRequirements: string[];
}

export const useSellerRequirements = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<SellerRequirements>({
    hasBankingSetup: false,
    hasPickupAddress: false,
    isComplete: false,
    missingRequirements: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showRequirementsDialog, setShowRequirementsDialog] = useState(false);

  const checkSellerRequirements = useCallback(async () => {
    if (!user?.id) {
      setRequirements({
        hasBankingSetup: false,
        hasPickupAddress: false,
        isComplete: false,
        missingRequirements: ["login required"],
      });
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Checking seller requirements for user:", user.id);

      // Check banking setup - try multiple tables for consistency
      let hasBankingSetup = false;

      try {
        // First check banking_subaccounts table (preferred)
        const { data: bankingSubaccounts } = await supabase
          .from("banking_subaccounts")
          .select("subaccount_code")
          .eq("user_id", user.id)
          .maybeSingle();

        if (bankingSubaccounts?.subaccount_code?.trim()) {
          hasBankingSetup = true;
        } else {
          // Fallback to paystack_subaccounts table
          const { data: paystackSubaccounts } = await supabase
            .from("paystack_subaccounts")
            .select("subaccount_code")
            .eq("user_id", user.id)
            .maybeSingle();

          if (paystackSubaccounts?.subaccount_code?.trim()) {
            hasBankingSetup = true;
          } else {
            // Final fallback to profile table
            const { data: profileData } = await supabase
              .from("profiles")
              .select("subaccount_code")
              .eq("id", user.id)
              .maybeSingle();

            hasBankingSetup = !!profileData?.subaccount_code?.trim();
          }
        }
      } catch (bankingError) {
        console.warn("Error checking banking setup:", bankingError);
        hasBankingSetup = false;
      }

      // Check pickup address
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("pickup_address")
        .eq("id", user.id)
        .maybeSingle();

      let hasPickupAddress = false;
      if (!profileError && profileData?.pickup_address) {
        const address = profileData.pickup_address as any;
        hasPickupAddress = !!(
          address?.street &&
          address?.city &&
          address?.province &&
          address?.postalCode
        );
      }

      const missingRequirements: string[] = [];
      if (!hasBankingSetup) missingRequirements.push("Banking Details");
      if (!hasPickupAddress) missingRequirements.push("Pickup Address");

      const newRequirements = {
        hasBankingSetup,
        hasPickupAddress,
        isComplete: hasBankingSetup && hasPickupAddress,
        missingRequirements,
      };

      setRequirements(newRequirements);
      return newRequirements.isComplete;
    } catch (error) {
      console.error("Error checking seller requirements:", error);
      setRequirements({
        hasBankingSetup: false,
        hasPickupAddress: false,
        isComplete: false,
        missingRequirements: ["Check failed"],
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkSellerRequirements();
  }, [checkSellerRequirements]);

  const requireSellerSetup = useCallback(
    (action: string = "list a book") => {
      if (isLoading || requirements.isComplete) {
        return requirements.isComplete;
      }

      if (!requirements.isComplete) {
        setShowRequirementsDialog(true);
        const missing = requirements.missingRequirements.join(" and ");
        toast.error(`Please complete your ${missing} to ${action}`);
        return false;
      }

      return true;
    },
    [requirements, isLoading],
  );

  const closeRequirementsDialog = useCallback(() => {
    setShowRequirementsDialog(false);
    // Recheck requirements after dialog closes
    setTimeout(() => {
      checkSellerRequirements();
    }, 1000);
  }, [checkSellerRequirements]);

  return {
    requirements,
    isLoading,
    showRequirementsDialog,
    requireSellerSetup,
    closeRequirementsDialog,
    recheckRequirements: checkSellerRequirements,
  };
};
