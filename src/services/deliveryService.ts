import { supabase } from "@/integrations/supabase/client";
import { SellerProfileService } from "./sellerProfileService";
import { getFunctionFallback } from "./functionFallbackService";

export interface DeliveryQuote {
  courier: "fastway" | "courier-guy";
  price: number;
  estimatedDays: number;
  serviceName: string;
}

export interface DeliveryAddress {
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

export const getDeliveryQuotes = async (
  fromAddress: DeliveryAddress,
  toAddress: DeliveryAddress,
  weight: number = 1, // Default weight in kg
): Promise<DeliveryQuote[]> => {
  try {
    console.log("Getting delivery quotes for:", {
      fromAddress,
      toAddress,
      weight,
    });

    const result = await getFunctionFallback().callFunction(
      "get-delivery-quotes",
      {
        pickup_address: fromAddress,
        delivery_address: toAddress,
        weight,
      },
    );

    if (result.success) {
      console.log("Delivery quotes received:", result.data);
      return result.data?.quotes || [];
    } else {
      console.error("Error getting delivery quotes:", result.error);
      // Return basic fallback quotes
      return [
        {
          courier: "fastway",
          price: 85,
          estimatedDays: 3,
          serviceName: "Fastway Standard",
        },
        {
          courier: "courier-guy",
          price: 95,
          estimatedDays: 2,
          serviceName: "Courier Guy Express",
        },
      ];
    }
  } catch (error) {
    console.error("Error in getDeliveryQuotes:", error);
    // Return fallback quotes if everything fails
    return [
      {
        courier: "fastway",
        price: 85,
        estimatedDays: 3,
        serviceName: "Fastway Standard",
      },
      {
        courier: "courier-guy",
        price: 95,
        estimatedDays: 2,
        serviceName: "Courier Guy Express",
      },
    ];
  }
};

/**
 * Get delivery quotes using enhanced seller profile data
 */
export const getDeliveryQuotesWithSeller = async (
  sellerId: string,
  toAddress: DeliveryAddress,
  weight: number = 1,
): Promise<DeliveryQuote[]> => {
  try {
    console.log("Getting delivery quotes with seller profile:", {
      sellerId,
      toAddress,
      weight,
    });

    // Get seller profile with pickup address
    const sellerProfile =
      await SellerProfileService.getSellerProfileForDelivery(sellerId);

    if (!sellerProfile) {
      console.error("Seller profile not found for delivery quotes");
      throw new Error("Seller profile not available");
    }

    const fromAddress = SellerProfileService.formatPickupAddressForDelivery(
      sellerProfile.pickup_address,
    );

    if (!fromAddress) {
      console.error("Seller pickup address not available");
      throw new Error("Seller pickup address not available");
    }

    // Convert to delivery service format
    const formattedFromAddress: DeliveryAddress = {
      streetAddress: fromAddress.streetAddress,
      suburb: fromAddress.suburb,
      city: fromAddress.city,
      province: fromAddress.province,
      postalCode: fromAddress.postalCode,
    };

    return await getDeliveryQuotes(formattedFromAddress, toAddress, weight);
  } catch (error) {
    console.error("Error in getDeliveryQuotesWithSeller:", error);
    // Return fallback quotes if seller lookup fails
    return [
      {
        courier: "fastway",
        price: 85,
        estimatedDays: 3,
        serviceName: "Fastway Standard",
      },
      {
        courier: "courier-guy",
        price: 95,
        estimatedDays: 2,
        serviceName: "Courier Guy Express",
      },
    ];
  }
};

export const createDeliveryBooking = async (
  quote: DeliveryQuote,
  fromAddress: DeliveryAddress,
  toAddress: DeliveryAddress,
  packageDetails: {
    weight: number;
    description: string;
    value: number;
  },
) => {
  try {
    console.log("Creating delivery booking:", {
      quote,
      fromAddress,
      toAddress,
      packageDetails,
    });

    const { data, error } = await supabase.functions.invoke(
      "create-delivery-booking",
      {
        body: {
          quote,
          fromAddress,
          toAddress,
          packageDetails,
        },
      },
    );

    if (error) {
      console.error("Error creating delivery booking:", error);
      throw error;
    }

    console.log("Delivery booking created:", data);
    return data;
  } catch (error) {
    console.error("Error in createDeliveryBooking:", error);
    throw error;
  }
};
