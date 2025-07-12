import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SellerProfileService } from "./sellerProfileService";

export interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface EnhancedDeliveryQuote {
  id: string;
  provider: string;
  service_name: string;
  price: number;
  estimated_days: string;
  description?: string;
  collection_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
}

export interface CartItem {
  id: string;
  sellerId: string;
  title: string;
  weight?: number;
  value: number;
}

/**
 * Get seller's address from their profile using the new database functions
 */
export const getSellerAddress = async (
  sellerId: string,
): Promise<DeliveryAddress | null> => {
  try {
    // Use the new seller profile service
    const sellerProfile =
      await SellerProfileService.getSellerProfileForDelivery(sellerId);

    if (!sellerProfile) {
      console.warn("No seller profile found for:", sellerId);
      return null;
    }

    // Format the pickup address for delivery
    const formattedAddress =
      SellerProfileService.formatPickupAddressForDelivery(
        sellerProfile.pickup_address,
      );

    if (!formattedAddress) {
      console.warn("No valid pickup address found for seller:", sellerId);
      return {
        street: "Address not set",
        city: "Unknown",
        province: "Unknown",
        postal_code: "0000",
        contact_name: sellerProfile.seller_name || "Seller",
        contact_phone: "",
      };
    }

    return {
      street: formattedAddress.streetAddress,
      city: formattedAddress.city,
      province: formattedAddress.province,
      postal_code: formattedAddress.postalCode,
      contact_name: sellerProfile.seller_name || "Seller",
      contact_phone: "",
    };
  } catch (error) {
    console.error("Error fetching seller address:", error);
    return null;
  }
};

/**
 * Get delivery quotes with automatic seller address fetching
 */
export const getEnhancedDeliveryQuotes = async (
  cartItems: CartItem[],
  deliveryAddress: DeliveryAddress,
): Promise<EnhancedDeliveryQuote[]> => {
  try {
    const quotes: EnhancedDeliveryQuote[] = [];

    // Group items by seller to handle multiple sellers
    const itemsBySeller = cartItems.reduce(
      (acc, item) => {
        if (!acc[item.sellerId]) {
          acc[item.sellerId] = [];
        }
        acc[item.sellerId].push(item);
        return acc;
      },
      {} as Record<string, CartItem[]>,
    );

    console.log(
      "📦 Processing delivery quotes for",
      Object.keys(itemsBySeller).length,
      "sellers",
    );

    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      console.log(`📍 Fetching address for seller: ${sellerId}`);

      const sellerAddress = await getSellerAddress(sellerId);

      if (!sellerAddress) {
        console.warn(
          `⚠️ No address found for seller ${sellerId}, skipping delivery quotes`,
        );
        toast.warning(
          `Cannot calculate delivery for some items - seller address missing`,
        );
        continue;
      }

      console.log(
        `✅ Seller address found: ${sellerAddress.city}, ${sellerAddress.province}`,
      );

      // Calculate total weight and value for this seller's items
      const totalWeight = items.reduce(
        (sum, item) => sum + (item.weight || 0.5),
        0,
      ); // Default 0.5kg per book
      const totalValue = items.reduce((sum, item) => sum + item.value, 0);

      try {
        // Call the unified delivery service
        const { data, error } = await supabase.functions.invoke(
          "get-delivery-quotes",
          {
            body: {
              from: {
                street_address: sellerAddress.street,
                city: sellerAddress.city,
                province: sellerAddress.province,
                postal_code: sellerAddress.postal_code,
              },
              to: {
                street_address: deliveryAddress.street,
                city: deliveryAddress.city,
                province: deliveryAddress.province,
                postal_code: deliveryAddress.postal_code,
              },
              weight: Math.max(totalWeight, 0.5), // Minimum 0.5kg
              value: totalValue,
              items: items.map((item) => ({
                title: item.title,
                weight: item.weight || 0.5,
                value: item.value,
              })),
            },
          },
        );

        if (error) {
          console.error("Delivery quotes API error:", error);
          // Add fallback quotes for this seller
          quotes.push(
            ...generateFallbackQuotes(sellerAddress, deliveryAddress, sellerId),
          );
        } else if (data?.quotes) {
          // Add the quotes with seller-specific info
          const sellerQuotes = data.quotes.map((quote: any, index: number) => ({
            ...quote,
            id: `${quote.id || `quote_${index}`}_${sellerId}`,
            collection_address: sellerAddress,
            delivery_address: deliveryAddress,
            seller_id: sellerId,
            items_count: items.length,
          }));
          quotes.push(...sellerQuotes);

          console.log(
            `✅ Got ${sellerQuotes.length} quotes for seller ${sellerId}`,
          );
        }
      } catch (apiError) {
        console.error("Error calling delivery quotes API:", apiError);
        // Add fallback quotes for this seller
        quotes.push(
          ...generateFallbackQuotes(sellerAddress, deliveryAddress, sellerId),
        );
      }
    }

    console.log(`📋 Total delivery quotes generated: ${quotes.length}`);
    return quotes;
  } catch (error) {
    console.error("Error in getEnhancedDeliveryQuotes:", error);
    toast.error("Failed to get delivery quotes");
    return [];
  }
};

/**
 * Generate fallback delivery quotes when API fails
 */
const generateFallbackQuotes = (
  fromAddress: DeliveryAddress,
  toAddress: DeliveryAddress,
  sellerId: string,
): EnhancedDeliveryQuote[] => {
  const basePrice = calculateFallbackPrice(fromAddress, toAddress);

  return [
    {
      id: `fallback_fastway_${sellerId}`,
      provider: "fastway",
      service_name: "Fastway Standard",
      price: basePrice,
      estimated_days: "3-5 business days",
      description: "Reliable nationwide delivery",
      collection_address: fromAddress,
      delivery_address: toAddress,
    },
    {
      id: `fallback_courier_${sellerId}`,
      provider: "courier-guy",
      service_name: "Courier Guy Express",
      price: basePrice + 20,
      estimated_days: "2-3 business days",
      description: "Fast and secure delivery",
      collection_address: fromAddress,
      delivery_address: toAddress,
    },
  ];
};

/**
 * Calculate fallback pricing based on distance/province
 */
const calculateFallbackPrice = (
  fromAddress: DeliveryAddress,
  toAddress: DeliveryAddress,
): number => {
  // Simple pricing logic
  if (fromAddress.province === toAddress.province) {
    // Same province
    if (fromAddress.city === toAddress.city) {
      return 60; // Same city
    }
    return 80; // Different city, same province
  } else {
    // Different province
    return 120; // Inter-provincial
  }
};

/**
 * Validate that all sellers have addresses before checkout
 */
export const validateSellersHaveAddresses = async (
  cartItems: CartItem[],
): Promise<{
  valid: boolean;
  missingSellers: string[];
}> => {
  const sellersToCheck = [...new Set(cartItems.map((item) => item.sellerId))];
  const missingSellers: string[] = [];

  for (const sellerId of sellersToCheck) {
    const address = await getSellerAddress(sellerId);
    if (!address) {
      missingSellers.push(sellerId);
    }
  }

  return {
    valid: missingSellers.length === 0,
    missingSellers,
  };
};

export default {
  getEnhancedDeliveryQuotes,
  getSellerAddress,
  validateSellersHaveAddresses,
};
