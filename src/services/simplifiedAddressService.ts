import { supabase } from "@/integrations/supabase/client";

export interface SimpleAddress {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  complex?: string;
  unitNumber?: string;
  suburb?: string;
}

export interface UserAddresses {
  pickup_address: SimpleAddress | null;
  shipping_address: SimpleAddress | null;
  addresses_same: boolean;
}

/**
 * Save user addresses with simplified structure
 */
export const saveSimpleUserAddresses = async (
  userId: string,
  pickupAddress: SimpleAddress,
  shippingAddress: SimpleAddress,
  addressesSame: boolean = false,
): Promise<UserAddresses> => {
  try {
    console.log("Saving addresses for user:", userId, {
      pickupAddress,
      shippingAddress,
      addressesSame,
    });

    // Validate required fields
    if (
      !pickupAddress.streetAddress ||
      !pickupAddress.city ||
      !pickupAddress.province ||
      !pickupAddress.postalCode
    ) {
      throw new Error("Pickup address is missing required fields");
    }

    if (
      !addressesSame &&
      (!shippingAddress.streetAddress ||
        !shippingAddress.city ||
        !shippingAddress.province ||
        !shippingAddress.postalCode)
    ) {
      throw new Error("Shipping address is missing required fields");
    }

    const finalShippingAddress = addressesSame
      ? pickupAddress
      : shippingAddress;

    // Try to update the profile with addresses
    let { data, error } = await supabase
      .from("profiles")
      .update({
        pickup_address: pickupAddress,
        shipping_address: finalShippingAddress,
        addresses_same: addressesSame,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("pickup_address, shipping_address, addresses_same")
      .single();

    // If profile doesn't exist, try to create it
    if (error && error.code === "PGRST116") {
      console.log("Profile doesn't exist, creating new profile with addresses");
      const { data: createData, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          pickup_address: pickupAddress,
          shipping_address: finalShippingAddress,
          addresses_same: addressesSame,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("pickup_address, shipping_address, addresses_same")
        .single();

      if (createError) {
        console.error("Error creating profile with addresses:", createError);
        throw new Error(
          `Failed to create profile with addresses: ${createError.message}`,
        );
      }

      data = createData;
    } else if (error) {
      console.error("Error saving addresses:", error);
      throw new Error(`Failed to save addresses: ${error.message}`);
    }

    console.log("Successfully saved addresses:", data);

    return {
      pickup_address: data.pickup_address as SimpleAddress,
      shipping_address: data.shipping_address as SimpleAddress,
      addresses_same: data.addresses_same || false,
    };
  } catch (error) {
    console.error("Error in saveSimpleUserAddresses:", error);
    throw error;
  }
};

/**
 * Get user addresses with simplified structure
 */
export const getSimpleUserAddresses = async (
  userId: string,
): Promise<UserAddresses> => {
  try {
    console.log("Getting addresses for user:", userId);

    const { data, error } = await supabase
      .from("profiles")
      .select("pickup_address, shipping_address, addresses_same")
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle to handle cases where profile might not exist

    if (error) {
      console.error("Error getting addresses:", error);
      throw new Error(`Failed to get addresses: ${error.message}`);
    }

    // If no profile exists, return empty addresses
    if (!data) {
      console.log("No profile found for user, returning empty addresses");
      return {
        pickup_address: null,
        shipping_address: null,
        addresses_same: false,
      };
    }

    console.log("Successfully retrieved addresses:", data);

    return {
      pickup_address: data.pickup_address as SimpleAddress | null,
      shipping_address: data.shipping_address as SimpleAddress | null,
      addresses_same: data.addresses_same || false,
    };
  } catch (error) {
    console.error("Error in getSimpleUserAddresses:", error);
    return {
      pickup_address: null,
      shipping_address: null,
      addresses_same: false,
    };
  }
};

/**
 * Format address for courier API
 */
export const formatAddressForCourier = (address: SimpleAddress | null) => {
  if (!address) return null;

  return {
    streetAddress: address.streetAddress,
    suburb: address.suburb || "",
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
  };
};

/**
 * Check if user can list books (has valid pickup address)
 */
export const canUserListBooks = async (userId: string): Promise<boolean> => {
  try {
    const addresses = await getSimpleUserAddresses(userId);
    return !!(
      addresses.pickup_address?.streetAddress &&
      addresses.pickup_address?.city &&
      addresses.pickup_address?.province &&
      addresses.pickup_address?.postalCode
    );
  } catch (error) {
    console.error("Error checking if user can list books:", error);
    return false;
  }
};

/**
 * Get seller address for delivery calculations
 */
export const getSellerDeliveryAddress = async (sellerId: string) => {
  try {
    console.log("Getting seller delivery address for:", sellerId);

    const addresses = await getSimpleUserAddresses(sellerId);

    if (!addresses.pickup_address) {
      console.warn("Seller has no pickup address, using fallback");
      return {
        street: "University of Cape Town",
        city: "Cape Town",
        province: "Western Cape",
        postal_code: "7700",
        country: "South Africa",
      };
    }

    return {
      street: addresses.pickup_address.streetAddress,
      city: addresses.pickup_address.city,
      province: addresses.pickup_address.province,
      postal_code: addresses.pickup_address.postalCode,
      country: "South Africa",
    };
  } catch (error) {
    console.error("Error getting seller delivery address:", error);

    // Return fallback address
    return {
      street: "University of Cape Town",
      city: "Cape Town",
      province: "Western Cape",
      postal_code: "7700",
      country: "South Africa",
    };
  }
};
