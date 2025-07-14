import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/errorHandling";
import { safeDbOperation } from "@/utils/databaseErrorHandler";

interface Address {
  complex?: string;
  unitNumber?: string;
  streetAddress: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  [key: string]: string | number | boolean | null; // Make it compatible with Json type
}

export const validateAddress = (address: Address): boolean => {
  return !!(
    address.streetAddress &&
    address.city &&
    address.province &&
    address.postalCode
  );
};

export const canUserListBooks = async (userId: string): Promise<boolean> => {
  try {
    // Check if user has addresses set up (addresses_same indicates address setup completion)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("addresses_same")
      .eq("id", userId)
      .single();

    if (profileError) {
      safeLogError(
        "Error checking user profile for book listing",
        profileError,
        { userId },
      );
      return false;
    }

    // Check if addresses are set up
    const hasAddresses = profileData?.addresses_same !== null;

    if (!hasAddresses) {
      console.log(`User ${userId} cannot list books: addresses not set up`);
      return false;
    }

    // Check if user has completed banking setup
    try {
      const { data: bankingDetails } = await supabase
        .from("banking_details")
        .select("paystack_subaccount_code")
        .eq("user_id", userId)
        .single();

      const hasVerifiedBanking =
        !!bankingDetails?.paystack_subaccount_code?.trim();

      if (!hasVerifiedBanking) {
        console.log(
          `User ${userId} cannot list books: banking setup not completed`,
        );
        return false;
      }
    } catch (error) {
      console.error("Error checking banking setup:", error);
      return false;
    }

    console.log(`User ${userId} can list books: all requirements met`);
    return true;
  } catch (error) {
    safeLogError("Error in canUserListBooks", error, { userId });
    return false;
  }
};

export const updateAddressValidation = async (
  userId: string,
  pickupAddress: Address,
  shippingAddress: Address,
  addressesSame: boolean,
) => {
  try {
    const isPickupValid = validateAddress(pickupAddress);
    const isShippingValid = addressesSame
      ? isPickupValid
      : validateAddress(shippingAddress);
    const canList = isPickupValid && isShippingValid;

    const { data, error } = await safeDbOperation(
      () =>
        supabase
          .from("profiles")
          .update({
            pickup_address: pickupAddress as Record<string, unknown>,
            shipping_address: shippingAddress as Record<string, unknown>,
            addresses_same: addressesSame,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId),
      "updateAddressValidation",
      { showToast: true },
    );

    if (error) {
      throw new Error(error.userMessage);
    }

    return { canListBooks: canList };
  } catch (error) {
    safeLogError("Error in updateAddressValidation", error, { userId });
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Address validation failed: ${errorMessage}`);
  }
};
