import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorUtils";
import {
  createCourierGuyShipment,
  CourierGuyShipmentData,
} from "./courierGuyService";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  pickup_address?: {
    complex?: string;
    unitNumber?: string;
    streetAddress: string;
    suburb?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  shipping_address?: {
    complex?: string;
    unitNumber?: string;
    streetAddress: string;
    suburb?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  addresses_same?: boolean;
}

interface BookDetails {
  id: string;
  title: string;
  author: string;
  price: number;
  sellerId: string;
}

/**
 * Get user profile with address information
 * Note: Phone numbers are not currently available in the profiles schema
 */
export const getUserProfileWithAddresses = async (
  userId: string,
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        email,
        pickup_address,
        shipping_address,
        addresses_same
      `,
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.warn(
        `[AutoShipment] User profile not found for ${userId}:`,
        error.message,
      );
      // Return a basic profile if the user exists but doesn't have address info
      const { data: basicProfile, error: basicError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("id", userId)
        .single();

      if (basicError) {
        console.error(
          `[AutoShipment] Error fetching basic profile for ${userId}:`,
          basicError.message,
        );
        return null;
      }

      return {
        ...basicProfile,
        pickup_address: null,
        shipping_address: null,
        addresses_same: false,
      };
    }

    return data;
  } catch (error) {
    console.error(
      `[AutoShipment] Unexpected error fetching profile for ${userId}:`,
      error,
    );
    return null;
  }
};

/**
 * Format address for Courier Guy API
 */
const formatAddressForCourierGuy = (address: any): string => {
  if (!address) return "";

  const parts = [];

  if (address.complex) parts.push(address.complex);
  if (address.unitNumber) parts.push(`Unit ${address.unitNumber}`);
  if (address.streetAddress) parts.push(address.streetAddress);
  if (address.suburb) parts.push(address.suburb);

  return parts.join(", ");
};

/**
 * Create automatic shipment when a book is purchased
 * Note: This function is prepared but shipment creation is currently disabled
 */
/**
 * Create a manual shipment notification when automatic shipment isn't possible
 */
export const createManualShipmentNotification = async (
  bookDetails: BookDetails,
  buyerId: string,
): Promise<void> => {
  try {
    console.log("[AutoShipment] Creating manual shipment notification");

    // In a real implementation, this would:
    // 1. Notify admin team to arrange manual shipment
    // 2. Send notification to seller to prepare book
    // 3. Send notification to buyer about delivery timeline

    return;
  } catch (error) {
    console.error(
      "[AutoShipment] Failed to create manual shipment notification:",
      error,
    );
  }
};

/**
 * Create automatic shipment if addresses are available, otherwise return null
 */
export const createAutomaticShipment = async (
  bookDetails: BookDetails,
  buyerId: string,
): Promise<any> => {
  try {
    console.log("[AutoShipment] Attempting to create automatic shipment:", {
      bookId: bookDetails.id,
      sellerId: bookDetails.sellerId,
      buyerId,
    });

    // Get seller information (sender)
    const seller = await getUserProfileWithAddresses(bookDetails.sellerId);
    if (!seller) {
      console.warn(
        "[AutoShipment] Seller profile not found - shipment will be manual",
      );
      return null;
    }

    if (!seller.pickup_address) {
      console.warn(
        "[AutoShipment] Seller pickup address not configured - shipment will be manual",
      );
      return null;
    }

    // Get buyer information (recipient)
    const buyer = await getUserProfileWithAddresses(buyerId);
    if (!buyer) {
      console.warn(
        "[AutoShipment] Buyer profile not found - shipment will be manual",
      );
      return null;
    }

    // Determine buyer's delivery address
    const buyerDeliveryAddress = buyer.addresses_same
      ? buyer.pickup_address
      : buyer.shipping_address;

    if (!buyerDeliveryAddress) {
      console.warn(
        "[AutoShipment] Buyer delivery address not configured - shipment will be manual",
      );
      return null;
    }

    // Prepare shipment data
    const shipmentData: CourierGuyShipmentData = {
      // Sender information (from seller's pickup address)
      senderName: seller.name,
      senderAddress: formatAddressForCourierGuy(seller.pickup_address),
      senderCity: seller.pickup_address.city,
      senderProvince: seller.pickup_address.province,
      senderPostalCode: seller.pickup_address.postalCode,
      senderPhone: "", // Phone not available in current schema

      // Recipient information (from buyer's delivery address)
      recipientName: buyer.name,
      recipientAddress: formatAddressForCourierGuy(buyerDeliveryAddress),
      recipientCity: buyerDeliveryAddress.city,
      recipientProvince: buyerDeliveryAddress.province,
      recipientPostalCode: buyerDeliveryAddress.postalCode,
      recipientPhone: "", // Phone not available in current schema

      // Package information
      weight: 1.0, // Default weight for textbooks
      description: `Textbook: ${bookDetails.title} by ${bookDetails.author}`,
      value: bookDetails.price,
      reference: `RBS-${bookDetails.id}-${Date.now()}`,
    };

    console.log("Shipment data prepared (creation disabled):", shipmentData);

    // NOTE: Shipment creation is disabled as per requirements
    // Uncomment the following lines to enable automatic shipment creation:

    /*
    const shipment = await createCourierGuyShipment(shipmentData);

    // Store shipment information in database for tracking
    await storeShipmentRecord(bookDetails.id, seller.id, buyer.id, shipment);

    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.tracking_number
    };
    */

    console.log("⚠️ Automatic shipment creation is currently disabled");
    return null;
  } catch (error) {
    console.error("Error creating automatic shipment:", error);
    throw error;
  }
};

/**
 * Store shipment record in database for future tracking
 * Note: This function is prepared but not used while shipment creation is disabled
 */
const storeShipmentRecord = async (
  bookId: string,
  sellerId: string,
  buyerId: string,
  shipment: any,
) => {
  try {
    const { error } = await supabase.from("shipments").insert({
      book_id: bookId,
      seller_id: sellerId,
      buyer_id: buyerId,
      courier_guy_shipment_id: shipment.id,
      tracking_number: shipment.tracking_number,
      status: shipment.status,
      created_at: new Date().toISOString(),
      reference: shipment.reference,
    });

    if (error) {
      console.error("Error storing shipment record:", error);
      throw error;
    }

    console.log("Shipment record stored successfully");
  } catch (error) {
    console.error("Error in storeShipmentRecord:", error);
    throw error;
  }
};

/**
 * Get shipment records for a user (as buyer or seller)
 * Note: Returns empty array since shipments table is not yet created
 */
export const getUserShipments = async (userId: string) => {
  try {
    // Note: Shipments table not created yet, return empty array
    console.log(
      "getUserShipments called for user:",
      userId,
      "- returning empty array (table not created)",
    );
    return [];

    /* Uncomment when shipments table is created:
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        book:books(title, author, price),
        seller:profiles!seller_id(name, email),
        buyer:profiles!buyer_id(name, email)
      `)
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user shipments:', error);
      return [];
    }

    return data || [];
    */
  } catch (error) {
    console.error("Error in getUserShipments:", error);
    return [];
  }
};

/**
 * Validate user addresses for shipment eligibility
 */
export const validateUserShipmentEligibility = async (
  userId: string,
): Promise<{
  canSell: boolean;
  canBuy: boolean;
  errors: string[];
}> => {
  try {
    const user = await getUserProfileWithAddresses(userId);
    const errors: string[] = [];

    if (!user) {
      errors.push("User profile not found");
      return { canSell: false, canBuy: false, errors };
    }

    // Check if user can sell (needs pickup address)
    const canSell = !!(
      user.pickup_address?.streetAddress &&
      user.pickup_address?.city &&
      user.pickup_address?.province &&
      user.pickup_address?.postalCode
    );

    if (!canSell) {
      errors.push("Pickup address required for selling books");
    }

    // Check if user can buy (needs delivery address)
    const deliveryAddress = user.addresses_same
      ? user.pickup_address
      : user.shipping_address;
    const canBuy = !!(
      deliveryAddress?.streetAddress &&
      deliveryAddress?.city &&
      deliveryAddress?.province &&
      deliveryAddress?.postalCode
    );

    if (!canBuy) {
      errors.push("Delivery address required for buying books");
    }

    return { canSell, canBuy, errors };
  } catch (error) {
    console.error("Error validating shipment eligibility:", error);
    return {
      canSell: false,
      canBuy: false,
      errors: ["Error validating addresses"],
    };
  }
};
