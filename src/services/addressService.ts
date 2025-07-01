import { supabase } from "@/integrations/supabase/client";
import { updateAddressValidation } from "./addressValidationService";
import { safeLogError } from "@/utils/errorHandling";

interface Address {
  complex: string;
  unitNumber: string;
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  [key: string]: string | number | boolean | null;
}

export const saveUserAddresses = async (
  userId: string,
  pickupAddress: Address,
  shippingAddress: Address,
  addressesSame: boolean,
) => {
  try {
    const result = await updateAddressValidation(
      userId,
      pickupAddress,
      shippingAddress,
      addressesSame,
    );

    const { data, error } = await supabase
      .from("profiles")
      .select("pickup_address, shipping_address, addresses_same")
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle() to handle cases where profile might not exist

    if (error) {
      safeLogError("Error fetching updated addresses", error);
      throw error;
    }

    // Handle case where profile doesn't exist yet
    if (!data) {
      return {
        pickup_address: null,
        shipping_address: null,
        addresses_same: false,
        canListBooks: result.canListBooks,
      };
    }

    return {
      pickup_address: data.pickup_address,
      shipping_address: data.shipping_address,
      addresses_same: data.addresses_same,
      canListBooks: result.canListBooks,
    };
  } catch (error) {
    safeLogError("Error saving addresses", error);
    throw error;
  }
};

export const getUserAddresses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("pickup_address, shipping_address, addresses_same")
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

    if (error) {
      safeLogError("Error fetching addresses", error);
      throw new Error(
        `Failed to fetch addresses: ${error.message || "Unknown error"}`,
      );
    }

    // Return default structure if no profile data exists
    return (
      data || {
        pickup_address: null,
        shipping_address: null,
        addresses_same: false,
      }
    );
  } catch (error) {
    safeLogError("Error loading addresses", error, { userId });
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load user addresses: ${errorMessage}`);
  }
};
