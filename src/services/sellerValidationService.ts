import { supabase } from "@/integrations/supabase/client";
import { getUserAddresses } from "./addressService";
import { SellerProfileService } from "./sellerProfileService";

export interface SellerValidationResult {
  canSell: boolean;
  missingRequirements: string[];
  hasAddress: boolean;
  hasBankingDetails: boolean;
  addressDetails?: any;
  bankingDetails?: any;
}

export class SellerValidationService {
  /**
   * Enhanced validation using new database functions
   */
  static async validateSellerRequirementsEnhanced(
    userId: string,
  ): Promise<SellerValidationResult> {
    try {
      const isReady = await SellerProfileService.isSellerReadyForOrders(userId);
      const profile =
        await SellerProfileService.getSellerProfileForDelivery(userId);

      const missingRequirements: string[] = [];
      let hasAddress = false;
      let hasBankingDetails = false;

      if (profile) {
        hasAddress = !!profile.pickup_address;
        hasBankingDetails = profile.has_subaccount;

        if (!hasAddress) {
          missingRequirements.push(
            "A valid pickup address is required. Buyers need to know where to collect books from.",
          );
        }

        if (!hasBankingDetails) {
          missingRequirements.push(
            "Banking setup is required to receive payments. Complete your banking details and Paystack subaccount setup via our secure banking portal.",
          );
        }
      } else {
        missingRequirements.push(
          "Unable to verify seller profile. Please try again.",
        );
      }

      return {
        canSell: isReady,
        missingRequirements,
        hasAddress,
        hasBankingDetails,
        addressDetails: profile?.pickup_address,
        bankingDetails: null, // We don't expose sensitive banking details
      };
    } catch (error) {
      console.error("Error in enhanced seller validation:", error);
      // Fallback to the original method
      return this.validateSellerRequirements(userId);
    }
  }

  /**
   * Comprehensive check to determine if user can list/sell books
   */
  static async validateSellerRequirements(
    userId: string,
  ): Promise<SellerValidationResult> {
    const missingRequirements: string[] = [];
    let hasAddress = false;
    let hasBankingDetails = false;
    let addressDetails = null;
    let bankingDetails = null;

    try {
      // Check address requirements
      try {
        addressDetails = await getUserAddresses(userId);

        // Validate pickup address specifically
        const pickupAddress = addressDetails?.pickup_address;
        hasAddress = !!(
          pickupAddress &&
          (pickupAddress.streetAddress || pickupAddress.street) &&
          pickupAddress.city &&
          pickupAddress.province &&
          pickupAddress.postalCode
        );

        if (!hasAddress) {
          missingRequirements.push(
            "A valid pickup address is required. Buyers need to know where to collect books from.",
          );
        }
      } catch (error) {
        console.error("Error checking address:", error);
        missingRequirements.push(
          "Unable to verify pickup address. Please add your address in your profile.",
        );
      }

      // Check banking setup (subaccount_code) requirements
      try {
        // First check banking_subaccounts table (preferred)
        const { data: bankingSubaccounts } = await supabase
          .from("banking_subaccounts")
          .select("subaccount_code")
          .eq("user_id", userId)
          .maybeSingle();

        if (bankingSubaccounts?.subaccount_code?.trim()) {
          hasBankingDetails = true;
        } else {
          // Fallback to paystack_subaccounts table
          const { data: paystackSubaccounts } = await supabase
            .from("paystack_subaccounts")
            .select("subaccount_code")
            .eq("user_id", userId)
            .maybeSingle();

          if (paystackSubaccounts?.subaccount_code?.trim()) {
            hasBankingDetails = true;
          } else {
            // Final fallback to profile table
            const { data: profileData } = await supabase
              .from("profiles")
              .select("subaccount_code")
              .eq("id", userId)
              .maybeSingle();

            hasBankingDetails = !!profileData?.subaccount_code?.trim();
          }
        }

        if (!hasBankingDetails) {
          missingRequirements.push(
            "Banking setup is required to receive payments. Complete your banking details and Paystack subaccount setup via our secure banking portal.",
          );
        }
      } catch (error) {
        console.error("Error checking banking setup:", error);
        missingRequirements.push(
          "Unable to verify banking setup. Please complete your banking details.",
        );
      }

      const canSell = missingRequirements.length === 0;

      return {
        canSell,
        missingRequirements,
        hasAddress,
        hasBankingDetails,
        addressDetails,
        bankingDetails,
      };
    } catch (error) {
      console.error("Error validating seller requirements:", error);
      return {
        canSell: false,
        missingRequirements: [
          "Unable to verify account requirements. Please try again.",
        ],
        hasAddress: false,
        hasBankingDetails: false,
      };
    }
  }

  /**
   * Quick check for banking setup specifically
   */
  static async hasBankingDetails(userId: string): Promise<boolean> {
    try {
      // First check banking_subaccounts table (preferred)
      const { data: bankingSubaccounts } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", userId)
        .maybeSingle();

      if (bankingSubaccounts?.subaccount_code?.trim()) {
        return true;
      }

      // Fallback to paystack_subaccounts table
      const { data: paystackSubaccounts } = await supabase
        .from("paystack_subaccounts")
        .select("subaccount_code")
        .eq("user_id", userId)
        .maybeSingle();

      if (paystackSubaccounts?.subaccount_code?.trim()) {
        return true;
      }

      // Final fallback to profile table
      const { data: profileData } = await supabase
        .from("profiles")
        .select("subaccount_code")
        .eq("id", userId)
        .maybeSingle();

      return !!profileData?.subaccount_code?.trim();
    } catch (error) {
      console.error("Error checking banking setup:", error);
      return false;
    }
  }

  /**
   * Generate user-friendly error message for missing requirements
   */
  static generateSellerBlockMessage(missingRequirements: string[]): {
    title: string;
    message: string;
    actionText: string;
    actionUrl: string;
  } {
    const hasAddressIssue = missingRequirements.some(
      (req) => req.includes("address") || req.includes("pickup"),
    );
    const hasBankingIssue = missingRequirements.some(
      (req) => req.includes("banking") || req.includes("payment"),
    );

    if (hasAddressIssue && hasBankingIssue) {
      return {
        title: "Complete Your Seller Profile",
        message:
          "Please add your pickup address and banking details to start selling. We need this information to process orders and send you payments.",
        actionText: "Complete Profile Setup",
        actionUrl: "/profile",
      };
    } else if (hasAddressIssue) {
      return {
        title: "Pickup Address Required",
        message:
          "Please add your pickup address so buyers know where to collect books from. This is required for all book listings.",
        actionText: "Add Pickup Address",
        actionUrl: "/profile?tab=addresses",
      };
    } else if (hasBankingIssue) {
      return {
        title: "Banking Details Required",
        message:
          "Please add your banking details to start selling. We need this to send you your payment when books sell.",
        actionText: "Add Banking Details",
        actionUrl: "/profile?tab=banking",
      };
    } else {
      return {
        title: "Account Setup Required",
        message: "Please complete your profile setup to start selling books.",
        actionText: "Complete Setup",
        actionUrl: "/profile",
      };
    }
  }

  /**
   * Check if user can proceed with creating a new listing (uses enhanced validation)
   */
  static async canCreateListing(userId: string): Promise<{
    allowed: boolean;
    blockMessage?: {
      title: string;
      message: string;
      actionText: string;
      actionUrl: string;
    };
  }> {
    // Use enhanced validation by default, with fallback
    const validation = await this.validateSellerRequirementsEnhanced(userId);

    if (validation.canSell) {
      return { allowed: true };
    }

    const blockMessage = this.generateSellerBlockMessage(
      validation.missingRequirements,
    );

    return {
      allowed: false,
      blockMessage,
    };
  }

  /**
   * Quick check using new database functions
   */
  static async canCreateListingQuick(userId: string): Promise<boolean> {
    try {
      return await SellerProfileService.isSellerReadyForOrders(userId);
    } catch (error) {
      console.error("Error in quick seller check:", error);
      return false;
    }
  }

  /**
   * Validate existing listings and deactivate if requirements not met
   */
  static async validateExistingListings(userId: string): Promise<void> {
    try {
      const validation = await this.validateSellerRequirements(userId);

      if (!validation.canSell) {
        // Deactivate all user's active listings
        const { error } = await supabase
          .from("books")
          .update({
            availability: "unavailable",
            deactivation_reason:
              "Missing seller requirements: " +
              validation.missingRequirements.join(", "),
          })
          .eq("user_id", userId)
          .eq("sold", false);

        if (error) {
          console.error("Error deactivating listings:", error);
        } else {
          console.log(
            `Deactivated listings for user ${userId} due to missing requirements`,
          );
        }
      }
    } catch (error) {
      console.error("Error validating existing listings:", error);
    }
  }

  /**
   * Reactivate listings when requirements are met
   */
  static async reactivateListings(userId: string): Promise<void> {
    try {
      const validation = await this.validateSellerRequirements(userId);

      if (validation.canSell) {
        // Reactivate listings that were deactivated for missing requirements
        const { error } = await supabase
          .from("books")
          .update({
            availability: "available",
            deactivation_reason: null,
          })
          .eq("user_id", userId)
          .eq("sold", false)
          .not("deactivation_reason", "is", null);

        if (error) {
          console.error("Error reactivating listings:", error);
        } else {
          console.log(
            `Reactivated listings for user ${userId} - requirements met`,
          );
        }
      }
    } catch (error) {
      console.error("Error reactivating listings:", error);
    }
  }
}

export default SellerValidationService;
