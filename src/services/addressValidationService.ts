import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase
      .from("profiles")
      .select("addresses_same")
      .eq("id", userId)
      .single();

    if (error) {
      const errorMessage = error.message || "Unknown error";
      console.error("Error checking if user can list books:", {
        message: errorMessage,
        code: error.code,
        userId,
        details: error.details,
      });
      return false;
    }

    // User can list books if they have completed address setup
    return data?.addresses_same !== null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in canUserListBooks:", {
      message: errorMessage,
      userId,
      error: error instanceof Error ? error.stack : error,
    });
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
        pickup_address: pickupAddress as any,
        shipping_address: shippingAddress as any,
        addresses_same: addressesSame,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      const errorMessage = error.message || "Unknown error";
      console.error("Error updating address validation:", {
        message: errorMessage,
        code: error.code,
        userId,
        details: error.details,
      });
      throw new Error(`Failed to update address validation: ${errorMessage}`);
    }

    return { canListBooks: canList };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in updateAddressValidation:", {
      message: errorMessage,
      userId,
      error: error instanceof Error ? error.stack : error,
    });
    throw new Error(`Address validation failed: ${errorMessage}`);
  }
};
