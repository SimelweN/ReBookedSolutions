import { supabase } from "@/integrations/supabase/client";
import { sendEmailNotification } from "./emailService";

export interface DeliveryQuote {
  provider: "courier-guy" | "fastway";
  service: string;
  price: number;
  estimatedDays: string;
  quoteId: string;
}

export interface ShippingLabel {
  url: string;
  waybillNumber: string;
  provider: string;
}

export interface DeliveryBooking {
  pickup: {
    name: string;
    address: string;
    contact: string;
    phone: string;
  };
  delivery: {
    name: string;
    address: string;
    contact: string;
    phone: string;
  };
  parcel: {
    weight: number;
    length: number;
    width: number;
    height: number;
    description: string;
  };
  courier: "courier-guy" | "fastway";
}

export interface DeliveryResult {
  success: boolean;
  shippingLabel?: ShippingLabel;
  pickupDate?: string;
  pickupTimeWindow?: string;
  trackingNumber?: string;
  error?: string;
}

/**
 * Comprehensive delivery automation service for ReBooked marketplace
 * Handles courier booking, label generation, and seller notifications
 */
export class DeliveryAutomationService {
  private static COURIER_GUY_API_URL = "https://api.shiplogic.com/v2";
  private static FASTWAY_API_URL = "https://api.fastway.org/v4";

  /**
   * Main entry point: Automate delivery for a confirmed order
   */
  static async automateDeliveryForOrder(
    orderId: string,
  ): Promise<DeliveryResult> {
    try {
      console.log(`🚚 Starting delivery automation for order: ${orderId}`);

      // 1. Get order details
      const order = await this.getOrderDetails(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // 2. Get seller and buyer details
      const { seller, buyer } = await this.getOrderParticipants(order);

      // 3. Prepare delivery booking data
      const bookingData = this.prepareBookingData(order, seller, buyer);

      // 4. Get delivery quotes from both providers
      const quotes = await this.getDeliveryQuotes(bookingData);

      // 5. Select best quote (cheapest with good delivery time)
      const selectedQuote = this.selectBestQuote(quotes);

      // 6. Book courier pickup and delivery
      const deliveryResult = await this.bookCourierDelivery(
        bookingData,
        selectedQuote,
      );

      if (!deliveryResult.success) {
        throw new Error(deliveryResult.error || "Failed to book courier");
      }

      // 7. Store shipping label in Supabase Storage
      const labelUrl = await this.storeShippingLabel(
        orderId,
        deliveryResult.shippingLabel!.url,
      );

      // 8. Update order with delivery information
      await this.updateOrderWithDeliveryInfo(orderId, {
        courierProvider: selectedQuote.provider,
        trackingNumber: deliveryResult.trackingNumber!,
        labelUrl,
        pickupDate: deliveryResult.pickupDate!,
        pickupTimeWindow: deliveryResult.pickupTimeWindow!,
        status: "courier_assigned",
      });

      // 9. Send automated email to seller
      await this.notifySeller(order, seller, {
        courierProvider: selectedQuote.provider,
        pickupDate: deliveryResult.pickupDate!,
        pickupTimeWindow: deliveryResult.pickupTimeWindow!,
        labelUrl,
        trackingNumber: deliveryResult.trackingNumber!,
      });

      console.log(`✅ Delivery automation completed for order: ${orderId}`);

      return {
        success: true,
        shippingLabel: deliveryResult.shippingLabel,
        pickupDate: deliveryResult.pickupDate,
        pickupTimeWindow: deliveryResult.pickupTimeWindow,
        trackingNumber: deliveryResult.trackingNumber,
      };
    } catch (error) {
      console.error(
        `❌ Delivery automation failed for order ${orderId}:`,
        error,
      );

      // Log error to database for admin review
      await this.logDeliveryError(orderId, error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get order details from database
   */
  private static async getOrderDetails(orderId: string) {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return order;
  }

  /**
   * Get seller and buyer information
   */
  private static async getOrderParticipants(order: any) {
    // Get seller details
    const { data: seller, error: sellerError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", order.seller_id)
      .single();

    if (sellerError) {
      throw new Error(`Failed to fetch seller: ${sellerError.message}`);
    }

    // Get buyer details (may be from order.buyer_email if guest)
    let buyer = null;
    if (order.buyer_id) {
      const { data: buyerData, error: buyerError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", order.buyer_id)
        .single();

      if (!buyerError) {
        buyer = buyerData;
      }
    }

    // If no buyer profile, create from order data
    if (!buyer) {
      buyer = {
        name: order.buyer_email.split("@")[0], // Use email username as name
        email: order.buyer_email,
        phone: order.shipping_address?.phone || "",
      };
    }

    return { seller, buyer };
  }

  /**
   * Prepare booking data for courier APIs
   */
  private static prepareBookingData(
    order: any,
    seller: any,
    buyer: any,
  ): DeliveryBooking {
    // Get addresses from order and seller profile
    const pickupAddress = seller.pickup_address || order.pickup_address;
    const shippingAddress = order.shipping_address;

    return {
      pickup: {
        name: seller.name,
        address: this.formatAddress(pickupAddress),
        contact: seller.email,
        phone: seller.phone || pickupAddress?.phone || "",
      },
      delivery: {
        name: buyer.name,
        address: this.formatAddress(shippingAddress),
        contact: buyer.email,
        phone: buyer.phone || shippingAddress?.phone || "",
      },
      parcel: {
        weight: 1.2, // Default book weight
        length: 30,
        width: 22,
        height: 5,
        description: `Book: ${order.book_title}`,
      },
      courier: "courier-guy", // Default to Courier Guy
    };
  }

  /**
   * Format address for courier APIs
   */
  private static formatAddress(address: any): string {
    if (!address) return "";

    const parts = [];
    if (address.unit_number) parts.push(address.unit_number);
    if (address.complex) parts.push(address.complex);
    if (address.street_address) parts.push(address.street_address);
    if (address.suburb) parts.push(address.suburb);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    if (address.postal_code) parts.push(address.postal_code);

    return parts.join(", ");
  }

  /**
   * Get delivery quotes from courier providers
   */
  private static async getDeliveryQuotes(
    bookingData: DeliveryBooking,
  ): Promise<DeliveryQuote[]> {
    const quotes: DeliveryQuote[] = [];

    try {
      // Courier Guy quote
      const courierGuyQuote = await this.getCourierGuyQuote(bookingData);
      if (courierGuyQuote) quotes.push(courierGuyQuote);
    } catch (error) {
      console.warn("Courier Guy quote failed:", error);
    }

    try {
      // Fastway quote
      const fastwayQuote = await this.getFastwayQuote(bookingData);
      if (fastwayQuote) quotes.push(fastwayQuote);
    } catch (error) {
      console.warn("Fastway quote failed:", error);
    }

    return quotes;
  }

  /**
   * Get Courier Guy delivery quote
   */
  private static async getCourierGuyQuote(
    bookingData: DeliveryBooking,
  ): Promise<DeliveryQuote | null> {
    const apiKey = import.meta.env.VITE_COURIER_GUY_API_KEY;
    if (!apiKey) {
      console.warn("Courier Guy API key not configured");
      return null;
    }

    try {
      // Call Courier Guy quote API
      const response = await fetch("/api/courier-guy-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup_address: bookingData.pickup.address,
          delivery_address: bookingData.delivery.address,
          parcel: bookingData.parcel,
        }),
      });

      const result = await response.json();

      if (result.success && result.quote) {
        return {
          provider: "courier-guy",
          service: result.quote.service || "Standard",
          price: result.quote.price || 0,
          estimatedDays: result.quote.estimated_days || "1-2 days",
          quoteId: result.quote.id || "",
        };
      }

      return null;
    } catch (error) {
      console.error("Courier Guy quote error:", error);
      return null;
    }
  }

  /**
   * Get Fastway delivery quote
   */
  private static async getFastwayQuote(
    bookingData: DeliveryBooking,
  ): Promise<DeliveryQuote | null> {
    const apiKey = import.meta.env.VITE_FASTWAY_API_KEY;
    if (!apiKey) {
      console.warn("Fastway API key not configured");
      return null;
    }

    try {
      // Call Fastway quote API
      const response = await fetch("/api/fastway-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup_address: bookingData.pickup.address,
          delivery_address: bookingData.delivery.address,
          parcel: bookingData.parcel,
        }),
      });

      const result = await response.json();

      if (result.success && result.quote) {
        return {
          provider: "fastway",
          service: result.quote.service || "Standard",
          price: result.quote.price || 0,
          estimatedDays: result.quote.estimated_days || "1-3 days",
          quoteId: result.quote.id || "",
        };
      }

      return null;
    } catch (error) {
      console.error("Fastway quote error:", error);
      return null;
    }
  }

  /**
   * Select the best delivery quote (cheapest with reasonable delivery time)
   */
  private static selectBestQuote(quotes: DeliveryQuote[]): DeliveryQuote {
    if (quotes.length === 0) {
      // Fallback to Courier Guy if no quotes available
      return {
        provider: "courier-guy",
        service: "Standard",
        price: 0,
        estimatedDays: "1-2 days",
        quoteId: "fallback",
      };
    }

    // Sort by price (ascending) and prefer Courier Guy if prices are similar
    return quotes.sort((a, b) => {
      if (Math.abs(a.price - b.price) < 10) {
        // If prices are within R10, prefer Courier Guy
        return a.provider === "courier-guy" ? -1 : 1;
      }
      return a.price - b.price;
    })[0];
  }

  /**
   * Book courier delivery with selected provider
   */
  private static async bookCourierDelivery(
    bookingData: DeliveryBooking,
    quote: DeliveryQuote,
  ): Promise<DeliveryResult> {
    if (quote.provider === "courier-guy") {
      return this.bookCourierGuyDelivery(bookingData, quote);
    } else {
      return this.bookFastwayDelivery(bookingData, quote);
    }
  }

  /**
   * Book Courier Guy delivery
   */
  private static async bookCourierGuyDelivery(
    bookingData: DeliveryBooking,
    quote: DeliveryQuote,
  ): Promise<DeliveryResult> {
    try {
      const response = await fetch("/api/courier-guy-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup: bookingData.pickup,
          delivery: bookingData.delivery,
          parcel: bookingData.parcel,
          quote_id: quote.quoteId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          shippingLabel: {
            url: result.label_url,
            waybillNumber: result.waybill_number,
            provider: "courier-guy",
          },
          pickupDate: result.pickup_date,
          pickupTimeWindow: result.pickup_time_window,
          trackingNumber: result.waybill_number,
        };
      }

      return {
        success: false,
        error: result.error || "Courier Guy booking failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Book Fastway delivery
   */
  private static async bookFastwayDelivery(
    bookingData: DeliveryBooking,
    quote: DeliveryQuote,
  ): Promise<DeliveryResult> {
    try {
      const response = await fetch("/api/fastway-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup: bookingData.pickup,
          delivery: bookingData.delivery,
          parcel: bookingData.parcel,
          quote_id: quote.quoteId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          shippingLabel: {
            url: result.label_url,
            waybillNumber: result.consignment_number,
            provider: "fastway",
          },
          pickupDate: result.pickup_date,
          pickupTimeWindow: result.pickup_time_window,
          trackingNumber: result.consignment_number,
        };
      }

      return {
        success: false,
        error: result.error || "Fastway booking failed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store shipping label in Supabase Storage
   */
  private static async storeShippingLabel(
    orderId: string,
    labelUrl: string,
  ): Promise<string> {
    try {
      // Download the label PDF
      const response = await fetch(labelUrl);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `shipping-labels/${orderId}-${Date.now()}.pdf`;
      const { data, error } = await supabase.storage
        .from("order-documents")
        .upload(fileName, blob, {
          contentType: "application/pdf",
        });

      if (error) {
        throw new Error(`Failed to upload label: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("order-documents")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Failed to store shipping label:", error);
      // Return original URL as fallback
      return labelUrl;
    }
  }

  /**
   * Update order with delivery information
   */
  private static async updateOrderWithDeliveryInfo(
    orderId: string,
    deliveryInfo: {
      courierProvider: string;
      trackingNumber: string;
      labelUrl: string;
      pickupDate: string;
      pickupTimeWindow: string;
      status: string;
    },
  ) {
    const { error } = await supabase
      .from("orders")
      .update({
        courier_provider: deliveryInfo.courierProvider,
        courier_tracking_number: deliveryInfo.trackingNumber,
        status: deliveryInfo.status,
        seller_notified_at: new Date().toISOString(),
        metadata: {
          shipping_label_url: deliveryInfo.labelUrl,
          pickup_date: deliveryInfo.pickupDate,
          pickup_time_window: deliveryInfo.pickupTimeWindow,
        },
      })
      .eq("id", orderId);

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  /**
   * Send automated email notification to seller
   */
  private static async notifySeller(
    order: any,
    seller: any,
    deliveryInfo: {
      courierProvider: string;
      pickupDate: string;
      pickupTimeWindow: string;
      labelUrl: string;
      trackingNumber: string;
    },
  ) {
    const emailData = {
      to: seller.email,
      subject: `📦 Your book "${order.book_title}" - Courier pickup scheduled!`,
      template: "seller-pickup-notification",
      variables: {
        seller_name: seller.name,
        book_title: order.book_title,
        pickup_date: deliveryInfo.pickupDate,
        pickup_time: deliveryInfo.pickupTimeWindow,
        courier: this.getCourierDisplayName(deliveryInfo.courierProvider),
        label_url: deliveryInfo.labelUrl,
        tracking_number: deliveryInfo.trackingNumber,
      },
    };

    try {
      await sendEmailNotification(emailData);
      console.log(`✅ Seller notification sent to: ${seller.email}`);
    } catch (error) {
      console.error("Failed to send seller notification:", error);
      // Don't throw - email failure shouldn't break the delivery flow
    }
  }

  /**
   * Get display name for courier provider
   */
  private static getCourierDisplayName(provider: string): string {
    switch (provider) {
      case "courier-guy":
        return "Courier Guy";
      case "fastway":
        return "Fastway";
      default:
        return provider;
    }
  }

  /**
   * Log delivery automation errors for admin review
   */
  private static async logDeliveryError(orderId: string, error: any) {
    try {
      await supabase.from("delivery_errors").insert({
        order_id: orderId,
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : null,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Failed to log delivery error:", logError);
    }
  }
}
