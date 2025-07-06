import { supabase } from "@/integrations/supabase/client";
import {
  getSimpleUserAddresses,
  saveSimpleUserAddresses,
} from "@/services/simplifiedAddressService";

/**
 * Test helpers for verifying address save and retrieve functionality
 * Use these in the browser console to verify fixes are working
 */

export const AddressTestHelpers = {
  /**
   * Test 1: Save addresses and verify they persist
   */
  async testAddressSaveAndRetrieve(userId: string) {
    console.log("🧪 Testing address save and retrieve...");

    const testPickupAddress = {
      streetAddress: "123 Test Street",
      city: "Cape Town",
      province: "Western Cape",
      postalCode: "8001",
      complex: "Test Complex",
      unitNumber: "Unit 1",
      suburb: "City Bowl",
    };

    const testShippingAddress = {
      streetAddress: "456 Delivery Avenue",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2000",
      complex: "Delivery Complex",
      unitNumber: "Unit 2",
      suburb: "Sandton",
    };

    try {
      // Save addresses
      console.log("💾 Saving test addresses...");
      const saveResult = await saveSimpleUserAddresses(
        userId,
        testPickupAddress,
        testShippingAddress,
        false,
      );
      console.log("✅ Save result:", saveResult);

      // Retrieve addresses
      console.log("📖 Retrieving saved addresses...");
      const retrieveResult = await getSimpleUserAddresses(userId);
      console.log("✅ Retrieve result:", retrieveResult);

      // Verify data integrity
      const pickupMatch =
        retrieveResult.pickup_address?.streetAddress ===
          testPickupAddress.streetAddress &&
        retrieveResult.pickup_address?.city === testPickupAddress.city &&
        retrieveResult.pickup_address?.postalCode ===
          testPickupAddress.postalCode;

      const shippingMatch =
        retrieveResult.shipping_address?.streetAddress ===
          testShippingAddress.streetAddress &&
        retrieveResult.shipping_address?.city === testShippingAddress.city &&
        retrieveResult.shipping_address?.postalCode ===
          testShippingAddress.postalCode;

      if (pickupMatch && shippingMatch) {
        console.log("🎉 TEST PASSED: Addresses saved and retrieved correctly!");
        return true;
      } else {
        console.error("❌ TEST FAILED: Address data mismatch");
        console.log("Expected pickup:", testPickupAddress);
        console.log("Retrieved pickup:", retrieveResult.pickup_address);
        console.log("Expected shipping:", testShippingAddress);
        console.log("Retrieved shipping:", retrieveResult.shipping_address);
        return false;
      }
    } catch (error) {
      console.error("❌ TEST FAILED with error:", error);
      return false;
    }
  },

  /**
   * Test 2: Verify same address functionality
   */
  async testSameAddressFunctionality(userId: string) {
    console.log("🧪 Testing same address functionality...");

    const testAddress = {
      streetAddress: "789 Same Street",
      city: "Durban",
      province: "KwaZulu-Natal",
      postalCode: "4000",
      complex: "",
      unitNumber: "",
      suburb: "Berea",
    };

    try {
      // Save with same address flag
      console.log("💾 Saving with same address flag...");
      const saveResult = await saveSimpleUserAddresses(
        userId,
        testAddress,
        testAddress, // Same address
        true, // addresses_same = true
      );
      console.log("✅ Save result:", saveResult);

      // Retrieve and verify
      const retrieveResult = await getSimpleUserAddresses(userId);
      console.log("📖 Retrieved addresses:", retrieveResult);

      const addressesMatch =
        retrieveResult.pickup_address?.streetAddress ===
          retrieveResult.shipping_address?.streetAddress &&
        retrieveResult.addresses_same === true;

      if (addressesMatch) {
        console.log("🎉 TEST PASSED: Same address functionality works!");
        return true;
      } else {
        console.error("❌ TEST FAILED: Same address not working correctly");
        return false;
      }
    } catch (error) {
      console.error("❌ TEST FAILED with error:", error);
      return false;
    }
  },

  /**
   * Test 3: Verify courier calculation receives addresses
   */
  async testCourierAddressRetrieval(userId: string) {
    console.log("🧪 Testing courier address retrieval...");

    try {
      // Get addresses as courier system would
      const addresses = await getSimpleUserAddresses(userId);
      console.log("📍 User addresses for courier:", addresses);

      if (!addresses.pickup_address || !addresses.shipping_address) {
        console.error(
          "❌ TEST FAILED: Missing address data for courier calculation",
        );
        return false;
      }

      // Simulate courier address formatting
      const fromAddress = {
        streetAddress: addresses.pickup_address.streetAddress,
        city: addresses.pickup_address.city,
        province: addresses.pickup_address.province,
        postalCode: addresses.pickup_address.postalCode,
      };

      const toAddress = {
        streetAddress: addresses.shipping_address.streetAddress,
        city: addresses.shipping_address.city,
        province: addresses.shipping_address.province,
        postalCode: addresses.shipping_address.postalCode,
      };

      console.log("🚚 Courier FROM address:", fromAddress);
      console.log("🚚 Courier TO address:", toAddress);

      // Verify all required fields are present
      const fromComplete =
        fromAddress.streetAddress &&
        fromAddress.city &&
        fromAddress.province &&
        fromAddress.postalCode;
      const toComplete =
        toAddress.streetAddress &&
        toAddress.city &&
        toAddress.province &&
        toAddress.postalCode;

      if (fromComplete && toComplete) {
        console.log("🎉 TEST PASSED: Courier addresses are complete!");
        return true;
      } else {
        console.error("❌ TEST FAILED: Incomplete address data for courier");
        console.error("From complete:", fromComplete);
        console.error("To complete:", toComplete);
        return false;
      }
    } catch (error) {
      console.error("❌ TEST FAILED with error:", error);
      return false;
    }
  },

  /**
   * Test 4: Database direct verification
   */
  async testDatabaseDirectAccess(userId: string) {
    console.log("🧪 Testing direct database access...");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("pickup_address, shipping_address, addresses_same")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Database access error:", error);
        return false;
      }

      console.log("🗄️ Raw database data:", data);

      if (data.pickup_address && data.shipping_address) {
        console.log("🎉 TEST PASSED: Database contains address data!");
        return true;
      } else {
        console.error("❌ TEST FAILED: No address data in database");
        return false;
      }
    } catch (error) {
      console.error("❌ TEST FAILED with error:", error);
      return false;
    }
  },

  /**
   * Run all tests
   */
  async runAllTests(userId: string) {
    console.log("🧪 Running comprehensive address functionality tests...");
    console.log("User ID:", userId);

    const results = {
      saveAndRetrieve: await this.testAddressSaveAndRetrieve(userId),
      sameAddress: await this.testSameAddressFunctionality(userId),
      courierRetrieval: await this.testCourierAddressRetrieval(userId),
      databaseAccess: await this.testDatabaseDirectAccess(userId),
    };

    console.log("📊 Test Results:", results);

    const allPassed = Object.values(results).every((result) => result === true);

    if (allPassed) {
      console.log(
        "🎉 ALL TESTS PASSED! Address functionality is working correctly.",
      );
    } else {
      console.error("❌ Some tests failed. Check the logs above for details.");
    }

    return results;
  },
};

// Export for browser console usage
if (typeof window !== "undefined") {
  (window as any).AddressTestHelpers = AddressTestHelpers;
  console.log(
    "🧪 Address test helpers loaded. Use AddressTestHelpers.runAllTests('your-user-id') to test.",
  );
}
