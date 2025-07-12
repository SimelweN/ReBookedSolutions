import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CourierAssignment {
  orderId: string;
  courierProvider: string;
  courierService: string;
  trackingNumber?: string;
  pickupAddress: any;
  deliveryAddress: any;
  estimatedDays: string;
  cost: number;
}

export interface CourierBookingResponse {
  success: boolean;
  trackingNumber?: string;
  pickupDate?: string;
  estimatedDelivery?: string;
  message?: string;
  error?: string;
}

/**
 * Service to handle courier assignment and booking after payment
 */
export class CourierAssignmentService {
  /**
   * Assign courier to an order after successful payment
   */
  static async assignCourierToOrder(
    orderId: string,
    courierProvider: string,
    courierService: string,
    deliveryQuote: any,
  ): Promise<boolean> {
    try {
      console.log("🚚 Assigning courier to order:", {
        orderId,
        courierProvider,
        courierService,
      });

      // Update order status and store courier info in metadata
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("metadata")
        .eq("id", orderId)
        .single();

      const updatedMetadata = {
        ...(currentOrder?.metadata || {}),
        courier_provider: courierProvider,
        courier_service: courierService,
        delivery_quote: deliveryQuote,
      };

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "courier_assigned",
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order with courier info:", updateError);
        return false;
      }

      // Book the actual courier pickup
      const bookingResult = await this.bookCourierPickup(orderId, {
        courierProvider,
        courierService,
        deliveryQuote,
      });

      if (bookingResult.success) {
        // Update order with tracking number if provided
        if (bookingResult.trackingNumber) {
          const { data: currentOrder } = await supabase
            .from("orders")
            .select("metadata")
            .eq("id", orderId)
            .single();

          const updatedMetadata = {
            ...(currentOrder?.metadata || {}),
            courier_tracking_number: bookingResult.trackingNumber,
          };

          await supabase
            .from("orders")
            .update({
              metadata: updatedMetadata,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        console.log("✅ Courier successfully assigned and booked");
        return true;
      } else {
        console.error("❌ Failed to book courier:", bookingResult.error);

        // Update order status to indicate courier booking failed
        const { data: currentOrder } = await supabase
          .from("orders")
          .select("metadata")
          .eq("id", orderId)
          .single();

        const updatedMetadata = {
          ...(currentOrder?.metadata || {}),
          courier_booking_error: bookingResult.error,
          attempted_courier: courierProvider,
        };

        await supabase
          .from("orders")
          .update({
            status: "paid", // Revert to paid status
            metadata: updatedMetadata,
          })
          .eq("id", orderId);

        return false;
      }
    } catch (error) {
      console.error("Error assigning courier to order:", error);
      return false;
    }
  }

  /**
   * Book actual courier pickup through the courier API
   */
  static async bookCourierPickup(
    orderId: string,
    courierDetails: any,
  ): Promise<CourierBookingResponse> {
    try {
      const { courierProvider } = courierDetails;

      // Get order details for booking
      const { data: order, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          books:book_id (title, author, condition),
          profiles:seller_id (name, email, phone)
        `,
        )
        .eq("id", orderId)
        .single();

      if (error || !order) {
        return {
          success: false,
          error: "Order not found for courier booking",
        };
      }

      // Call the appropriate courier API based on provider
      switch (courierProvider) {
        case "courier-guy":
          return await this.bookCourierGuyPickup(order, courierDetails);
        case "fastway":
          return await this.bookFastwayPickup(order, courierDetails);
        case "ram":
          return await this.bookRAMPickup(order, courierDetails);
        default:
          return {
            success: false,
            error: `Unsupported courier provider: ${courierProvider}`,
          };
      }
    } catch (error) {
      console.error("Error booking courier pickup:", error);
      return {
        success: false,
        error: "Failed to book courier pickup",
      };
    }
  }

  /**
   * Book Courier Guy pickup
   */
  static async bookCourierGuyPickup(
    order: any,
    courierDetails: any,
  ): Promise<CourierBookingResponse> {
    try {
      console.log("📞 Booking Courier Guy pickup for order:", order.id);

      const { data, error } = await supabase.functions.invoke(
        "courier-guy-shipment",
        {
          body: {
            orderId: order.id,
            pickupAddress: order.pickup_address,
            deliveryAddress: order.shipping_address,
            packageDetails: {
              description: `Book: ${order.books?.title}`,
              weight: 0.5, // Default book weight
              value: order.book_price / 100, // Convert from kobo to rands
            },
            service: courierDetails.courierService || "standard",
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        trackingNumber: data?.tracking_number,
        pickupDate: data?.pickup_date,
        estimatedDelivery: data?.estimated_delivery,
        message: "Courier Guy pickup booked successfully",
      };
    } catch (error) {
      console.error("Error booking Courier Guy:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Courier Guy booking failed",
      };
    }
  }

  /**
   * Book Fastway pickup
   */
  static async bookFastwayPickup(
    order: any,
    courierDetails: any,
  ): Promise<CourierBookingResponse> {
    try {
      console.log("📞 Booking Fastway pickup for order:", order.id);

      const { data, error } = await supabase.functions.invoke(
        "fastway-shipment",
        {
          body: {
            orderId: order.id,
            pickupAddress: order.pickup_address,
            deliveryAddress: order.shipping_address,
            packageDetails: {
              description: `Book: ${order.books?.title}`,
              weight: 0.5,
              value: order.book_price / 100,
            },
            service: courierDetails.courierService || "express",
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        trackingNumber: data?.tracking_number,
        pickupDate: data?.pickup_date,
        estimatedDelivery: data?.estimated_delivery,
        message: "Fastway pickup booked successfully",
      };
    } catch (error) {
      console.error("Error booking Fastway:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Fastway booking failed",
      };
    }
  }

  /**
   * Book RAM pickup
   */
  static async bookRAMPickup(
    order: any,
    courierDetails: any,
  ): Promise<CourierBookingResponse> {
    try {
      console.log("📞 Booking RAM pickup for order:", order.id);

      // For now, return a simulated successful booking
      // This can be replaced with actual RAM API integration
      return {
        success: true,
        trackingNumber: `RAM${Date.now()}`,
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        message: "RAM pickup scheduled successfully",
      };
    } catch (error) {
      console.error("Error booking RAM:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "RAM booking failed",
      };
    }
  }

  /**
   * Get courier status and tracking info
   */
  static async getCourierStatus(orderId: string): Promise<any> {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        throw new Error("Order not found");
      }

      if (!order.courier_provider || !order.courier_tracking_number) {
        return {
          status: order.status,
          message: "Courier not yet assigned",
        };
      }

      // Call appropriate tracking API based on courier provider
      switch (order.courier_provider) {
        case "courier-guy":
          return await this.trackCourierGuy(order.courier_tracking_number);
        case "fastway":
          return await this.trackFastway(order.courier_tracking_number);
        case "ram":
          return await this.trackRAM(order.courier_tracking_number);
        default:
          return {
            status: order.status,
            message: "Tracking not available for this courier",
          };
      }
    } catch (error) {
      console.error("Error getting courier status:", error);
      throw error;
    }
  }

  /**
   * Track Courier Guy shipment
   */
  static async trackCourierGuy(trackingNumber: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke(
        "courier-guy-track",
        {
          body: { tracking_number: trackingNumber },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error tracking Courier Guy:", error);
      return {
        status: "unknown",
        message: "Unable to track Courier Guy shipment",
      };
    }
  }

  /**
   * Track Fastway shipment
   */
  static async trackFastway(trackingNumber: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke("fastway-track", {
        body: { tracking_number: trackingNumber },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error tracking Fastway:", error);
      return {
        status: "unknown",
        message: "Unable to track Fastway shipment",
      };
    }
  }

  /**
   * Track RAM shipment
   */
  static async trackRAM(trackingNumber: string): Promise<any> {
    // Simulated tracking for RAM
    return {
      status: "in_transit",
      message: "Package is in transit",
      estimatedDelivery: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  }
}

export default CourierAssignmentService;
