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
    console.log("🏠 Saving addresses for user:", userId, {
      pickupAddress,
      shippingAddress,
      addressesSame,
    });

    // Strict validation of required fields
    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    if (
      !pickupAddress.streetAddress?.trim() ||
      !pickupAddress.city?.trim() ||
      !pickupAddress.province?.trim() ||
      !pickupAddress.postalCode?.trim()
    ) {
      throw new Error(
        "Pickup address is missing required fields: streetAddress, city, province, postalCode",
      );
    }

    if (
      !addressesSame &&
      (!shippingAddress.streetAddress?.trim() ||
        !shippingAddress.city?.trim() ||
        !shippingAddress.province?.trim() ||
        !shippingAddress.postalCode?.trim())
    ) {
      throw new Error(
        "Shipping address is missing required fields: streetAddress, city, province, postalCode",
      );
    }

    // Clean and normalize the data
    const cleanPickupAddress: SimpleAddress = {
      streetAddress: pickupAddress.streetAddress.trim(),
      city: pickupAddress.city.trim(),
      province: pickupAddress.province.trim(),
      postalCode: pickupAddress.postalCode.trim(),
      complex: pickupAddress.complex?.trim() || "",
      unitNumber: pickupAddress.unitNumber?.trim() || "",
      suburb: pickupAddress.suburb?.trim() || "",
    };

    const finalShippingAddress = addressesSame
      ? cleanPickupAddress
      : {
          streetAddress: shippingAddress.streetAddress.trim(),
          city: shippingAddress.city.trim(),
          province: shippingAddress.province.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          complex: shippingAddress.complex?.trim() || "",
          unitNumber: shippingAddress.unitNumber?.trim() || "",
          suburb: shippingAddress.suburb?.trim() || "",
        };

    console.log("🧹 Cleaned addresses:", {
      pickup: cleanPickupAddress,
      shipping: finalShippingAddress,
    });

    // Try to update the profile with addresses
    let { data, error } = await supabase
      .from("profiles")
      .update({
        pickup_address: cleanPickupAddress,
        shipping_address: finalShippingAddress,
        addresses_same: addressesSame,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("pickup_address, shipping_address, addresses_same")
      .single();

    // If profile doesn't exist, try to create it
    if (
      error &&
      (error.code === "PGRST116" ||
        error.message.includes("violates row-level security") ||
        error.message.includes("No rows") ||
        error.message.includes("0 rows"))
    ) {
      console.log(
        "🔄 Profile doesn't exist or access denied, creating new profile...",
      );

      // Get basic user info first
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("❌ Authentication error:", userError);
        throw new Error("User not authenticated or session expired");
      }

      console.log(
        "👤 Creating new profile with addresses for user:",
        userData.user.email,
      );

      const { data: createData, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userData.user.email,
          name:
            userData.user.user_metadata?.name ||
            userData.user.email?.split("@")[0] ||
            "User",
          pickup_address: cleanPickupAddress,
          shipping_address: finalShippingAddress,
          addresses_same: addressesSame,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("pickup_address, shipping_address, addresses_same")
        .single();

      if (createError) {
        console.error("❌ Error creating profile with addresses:", createError);
        throw new Error(
          `Failed to create profile with addresses: ${createError.message}. This might be a permissions issue - please try logging out and back in.`,
        );
      }

      console.log("✅ Profile created successfully with addresses");
      data = createData;
    } else if (error) {
      console.error("❌ Error saving addresses:", error);
      // Provide more specific error messages
      let errorMessage = `Failed to save addresses: ${error.message}`;
      if (error.message.includes("timeout")) {
        errorMessage =
          "Save operation timed out. Please check your connection and try again.";
      } else if (
        error.message.includes("permission") ||
        error.message.includes("unauthorized")
      ) {
        errorMessage = "Permission denied. Please try logging out and back in.";
      }
      throw new Error(errorMessage);
    }

    console.log("✅ Successfully saved addresses:", data);

    // Verify the save was successful by reading back the data
    console.log("🔍 Verifying address save...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("profiles")
      .select("pickup_address, shipping_address, addresses_same")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.warn("⚠️ Could not verify address save:", verifyError);
      // Still return the data we think we saved, but log the warning
    } else {
      console.log("✅ Address save verified:", verifyData);
      // Use the verified data
      data = verifyData;

      // Additional validation of the verified data
      if (
        !data.pickup_address ||
        !data.pickup_address.streetAddress ||
        !data.pickup_address.city ||
        !data.pickup_address.province ||
        !data.pickup_address.postalCode
      ) {
        console.error(
          "❌ Verification failed: pickup address incomplete after save",
        );
        throw new Error(
          "Address save verification failed - pickup address is incomplete",
        );
      }
    }

    const result = {
      pickup_address: data.pickup_address as SimpleAddress,
      shipping_address: data.shipping_address as SimpleAddress,
      addresses_same: data.addresses_same || false,
    };

    console.log("🎉 Address save operation completed successfully:", result);
    return result;
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
