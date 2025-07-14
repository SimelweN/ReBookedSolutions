import { supabase } from "@/integrations/supabase/client";
import { updateAddressValidation } from "./addressValidationService";
import { safeLogError } from "@/utils/errorHandling";
import {
  handleDatabaseError,
  safeDbOperation,
} from "@/utils/databaseErrorHandler";

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
  // First, update the addresses using the validation service
  const result = await updateAddressValidation(
    userId,
    pickupAddress,
    shippingAddress,
    addressesSame,
  );

  // Then fetch the updated data with proper error handling
  const { data, error } = await safeDbOperation(
    () =>
      supabase
        .from("profiles")
        .select("pickup_address, shipping_address, addresses_same")
        .eq("id", userId)
        .maybeSingle(),
    "saveUserAddresses - fetch updated data",
    { showToast: true },
  );

  if (error) {
    throw new Error(error.userMessage);
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
};

export const getUserAddresses = async (userId: string) => {
  const { data, error } = await safeDbOperation(
    () =>
      supabase
        .from("profiles")
        .select("pickup_address, shipping_address, addresses_same")
        .eq("id", userId)
        .maybeSingle(),
    "getUserAddresses",
    { showToast: true },
  );

  if (error) {
    throw new Error(error.userMessage);
  }

  // Return default structure if no profile data exists
  return (
    data || {
      pickup_address: null,
      shipping_address: null,
      addresses_same: false,
    }
  );
};
