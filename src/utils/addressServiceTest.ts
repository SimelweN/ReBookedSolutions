/**
 * Address Service Test Utility
 * For debugging and testing address service functionality
 */

import { getUserAddresses } from "@/services/addressService";

export const testAddressService = async (userId: string) => {
  console.log("🧪 Testing address service for user:", userId);

  try {
    const result = await getUserAddresses(userId);
    console.log("✅ Address service test passed:", result);

    // Test the structure
    if (result && typeof result === "object") {
      console.log("📊 Address data structure:");
      console.log(
        "  - pickup_address:",
        result.pickup_address ? "Present" : "Null",
      );
      console.log(
        "  - shipping_address:",
        result.shipping_address ? "Present" : "Null",
      );
      console.log("  - addresses_same:", result.addresses_same);

      if (result.pickup_address) {
        console.log("📍 Pickup address details:", {
          hasStreetAddress: !!result.pickup_address.streetAddress,
          hasCity: !!result.pickup_address.city,
          hasProvince: !!result.pickup_address.province,
          hasPostalCode: !!result.pickup_address.postalCode,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Address service test failed:", error);
    throw error;
  }
};

// Export for development debugging
if (import.meta.env.DEV) {
  (window as any).testAddressService = testAddressService;
}
