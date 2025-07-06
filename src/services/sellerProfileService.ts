import { supabase } from "@/integrations/supabase/client";

// Types for the new database functions
export interface SellerProfileForDelivery {
  seller_id: string;
  seller_name: string;
  seller_email: string;
  pickup_address: any;
  has_subaccount: boolean;
}

export interface BookSellerRelationship {
  book_id: string;
  book_title: string;
  seller_id: string;
  seller_name: string;
  seller_has_address: boolean;
  seller_has_subaccount: boolean;
}

export class SellerProfileService {
  /**
   * Get seller profile with address information for delivery calculations
   */
  static async getSellerProfileForDelivery(
    sellerId: string,
  ): Promise<SellerProfileForDelivery | null> {
    try {
      const { data, error } = await supabase.rpc(
        "get_seller_profile_for_delivery",
        {
          p_seller_id: sellerId,
        },
      );

      if (error) {
        console.error("Error fetching seller profile for delivery:", error);
        return null;
      }

      // The function returns an array, get the first result
      return data?.[0] || null;
    } catch (error) {
      console.error("Exception in getSellerProfileForDelivery:", error);
      return null;
    }
  }

  /**
   * Verify book-seller relationship and get seller readiness information
   */
  static async verifyBookSellerRelationship(
    bookId: string,
  ): Promise<BookSellerRelationship | null> {
    try {
      const { data, error } = await supabase.rpc(
        "verify_book_seller_relationship",
        {
          p_book_id: bookId,
        },
      );

      if (error) {
        console.error("Error verifying book-seller relationship:", error);
        return null;
      }

      // The function returns an array, get the first result
      return data?.[0] || null;
    } catch (error) {
      console.error("Exception in verifyBookSellerRelationship:", error);
      return null;
    }
  }

  /**
   * Check if seller is ready to receive orders
   */
  static async isSellerReadyForOrders(sellerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("is_seller_ready_for_orders", {
        p_seller_id: sellerId,
      });

      if (error) {
        console.error("Error checking if seller is ready for orders:", error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error("Exception in isSellerReadyForOrders:", error);
      return false;
    }
  }

  /**
   * Get seller pickup address in a format suitable for delivery services
   */
  static formatPickupAddressForDelivery(pickupAddress: any): {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  } | null {
    if (!pickupAddress) {
      return null;
    }

    try {
      // Handle both string (JSON) and object formats
      const address =
        typeof pickupAddress === "string"
          ? JSON.parse(pickupAddress)
          : pickupAddress;

      return {
        streetAddress: address.streetAddress || address.street || "",
        suburb: address.suburb || address.area || "",
        city: address.city || "",
        province: address.province || address.state || "",
        postalCode: address.postalCode || address.zipCode || "",
      };
    } catch (error) {
      console.error("Error formatting pickup address:", error);
      return null;
    }
  }

  /**
   * Get comprehensive seller information for order processing
   */
  static async getSellerInfoForOrder(sellerId: string): Promise<{
    profile: SellerProfileForDelivery | null;
    isReady: boolean;
    formattedAddress: any;
  }> {
    try {
      const [profile, isReady] = await Promise.all([
        this.getSellerProfileForDelivery(sellerId),
        this.isSellerReadyForOrders(sellerId),
      ]);

      const formattedAddress = profile
        ? this.formatPickupAddressForDelivery(profile.pickup_address)
        : null;

      return {
        profile,
        isReady,
        formattedAddress,
      };
    } catch (error) {
      console.error("Error getting seller info for order:", error);
      return {
        profile: null,
        isReady: false,
        formattedAddress: null,
      };
    }
  }

  /**
   * Validate seller readiness and return user-friendly error messages
   */
  static async validateSellerForPurchase(sellerId: string): Promise<{
    isValid: boolean;
    errorMessage?: string;
    profile?: SellerProfileForDelivery | null;
  }> {
    try {
      const sellerInfo = await this.getSellerInfoForOrder(sellerId);

      if (!sellerInfo.profile) {
        return {
          isValid: false,
          errorMessage:
            "Seller profile not found. This book may no longer be available.",
        };
      }

      if (!sellerInfo.isReady) {
        let missingItems = [];

        if (!sellerInfo.formattedAddress) {
          missingItems.push("pickup address");
        }

        if (!sellerInfo.profile.has_subaccount) {
          missingItems.push("banking details");
        }

        const missingItemsText =
          missingItems.length > 1
            ? missingItems.slice(0, -1).join(", ") +
              " and " +
              missingItems.slice(-1)
            : missingItems[0];

        return {
          isValid: false,
          errorMessage: `This seller is not ready to accept orders. They need to complete their ${missingItemsText}.`,
          profile: sellerInfo.profile,
        };
      }

      return {
        isValid: true,
        profile: sellerInfo.profile,
      };
    } catch (error) {
      console.error("Error validating seller for purchase:", error);
      return {
        isValid: false,
        errorMessage: "Unable to verify seller information. Please try again.",
      };
    }
  }

  /**
   * Get multiple seller profiles efficiently (for book listings)
   */
  static async getMultipleSellerProfiles(
    sellerIds: string[],
  ): Promise<Map<string, SellerProfileForDelivery>> {
    const profilesMap = new Map<string, SellerProfileForDelivery>();

    if (sellerIds.length === 0) {
      return profilesMap;
    }

    try {
      // Get all profiles in parallel
      const profilePromises = sellerIds.map((sellerId) =>
        this.getSellerProfileForDelivery(sellerId),
      );

      const profiles = await Promise.all(profilePromises);

      // Map results back to seller IDs
      profiles.forEach((profile, index) => {
        if (profile) {
          profilesMap.set(sellerIds[index], profile);
        }
      });

      return profilesMap;
    } catch (error) {
      console.error("Error getting multiple seller profiles:", error);
      return profilesMap;
    }
  }
}

export default SellerProfileService;
