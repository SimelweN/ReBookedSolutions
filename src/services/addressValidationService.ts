import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/errorHandling";
import { ImprovedBankingService } from "@/services/improvedBankingService";

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

    // Check if user has verified banking details
    const hasVerifiedBanking =
      await ImprovedBankingService.hasVerifiedBankingDetails(userId);

    if (!hasVerifiedBanking) {
      console.log(
        `User ${userId} cannot list books: banking details not verified or incomplete`,
      );
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

    const { error } = await supabase
      .from("profiles")
      .update({
        pickup_address: pickupAddress as Record<string, unknown>,
        shipping_address: shippingAddress as Record<string, unknown>,
        addresses_same: addressesSame,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      safeLogError("Error updating address validation", error, { userId });
      throw new Error(
        `Failed to update address validation: ${error.message || "Unknown error"}`,
      );
    }

    return { canListBooks: canList };
  } catch (error) {
    safeLogError("Error in updateAddressValidation", error, { userId });
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Address validation failed: ${errorMessage}`);
  }
};
