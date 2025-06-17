import { supabase } from "@/integrations/supabase/client";
import { updateAddressValidation } from "./addressValidationService";

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
      .single();

    if (error) {
      const errorMessage = error.message || "Unknown error";
      console.error("Error fetching updated addresses:", {
        message: errorMessage,
        code: error.code,
        details: error.details,
      });
      throw error;
    }

    return {
      pickup_address: data.pickup_address,
      shipping_address: data.shipping_address,
      addresses_same: data.addresses_same,
      canListBooks: result.canListBooks,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving addresses:", errorMessage);
    throw error;
  }
};

export const getUserAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("pickup_address, shipping_address, addresses_same")
    .eq("id", userId)
    .single();

  if (error) {
    const errorMessage = error.message || "Unknown error";
    console.error("Error fetching addresses:", {
      message: errorMessage,
      code: error.code,
      details: error.details,
    });
    throw error;
  }

  return data;
};
