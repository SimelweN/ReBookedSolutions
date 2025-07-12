import { supabase } from "@/integrations/supabase/client";
import { DeliveryAutomationService } from "./deliveryAutomationService";

/**
 * Service to handle order confirmation and trigger delivery automation
 */
export class OrderConfirmationService {
  /**
   * Handle order confirmation after payment is successful
   * This is the main trigger point for delivery automation
   */
  static async handleOrderConfirmation(orderId: string): Promise<void> {
    try {
      console.log(`🔄 Processing order confirmation for: ${orderId}`);

      // 1. Verify order exists and is in correct state
      const order = await this.verifyOrderState(orderId);
      if (!order) {
        throw new Error("Order not found or not in correct state");
      }

      // 2. Update order status to 'paid'
      await this.updateOrderStatus(orderId, "paid");

      // 3. Start delivery automation process
      await this.triggerDeliveryAutomation(orderId);

      console.log(`✅ Order confirmation processing completed for: ${orderId}`);
    } catch (error) {
      console.error(`❌ Order confirmation failed for ${orderId}:`, error);

      // Log error and update order status
      await this.handleConfirmationError(orderId, error);

      throw error;
    }
  }

  /**
   * Verify order exists and is in the correct state for confirmation
   */
  private static async verifyOrderState(orderId: string) {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    // Check if order is in a state that can be confirmed
    const validStates = ["pending", "paid"];
    if (!validStates.includes(order.status)) {
      console.warn(
        `Order ${orderId} is in state '${order.status}', cannot confirm`,
      );
      return null;
    }

    return order;
  }

  /**
   * Update order status
   */
  private static async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        paid_at: status === "paid" ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  /**
   * Trigger delivery automation
   */
  private static async triggerDeliveryAutomation(orderId: string) {
    try {
      // Call delivery automation service
      const result =
        await DeliveryAutomationService.automateDeliveryForOrder(orderId);

      if (!result.success) {
        throw new Error(result.error || "Delivery automation failed");
      }

      console.log(`✅ Delivery automation successful for order: ${orderId}`);
    } catch (error) {
      console.error(
        `❌ Delivery automation failed for order ${orderId}:`,
        error,
      );

      // Update order with delivery failure info
      await this.handleDeliveryAutomationError(orderId, error);

      // Don't throw here - we want the order to remain 'paid' even if delivery fails
      // Admins can manually handle delivery issues
    }
  }

  /**
   * Handle delivery automation errors
   */
  private static async handleDeliveryAutomationError(
    orderId: string,
    error: any,
  ) {
    try {
      // Add note to order metadata about delivery automation failure
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          metadata: {
            delivery_automation_error:
              error instanceof Error ? error.message : String(error),
            delivery_automation_failed_at: new Date().toISOString(),
            requires_manual_delivery_setup: true,
          },
        })
        .eq("id", orderId);

      if (updateError) {
        console.error(
          "Failed to update order with delivery error:",
          updateError,
        );
      }
    } catch (logError) {
      console.error("Failed to log delivery automation error:", logError);
    }
  }

  /**
   * Handle general order confirmation errors
   */
  private static async handleConfirmationError(orderId: string, error: any) {
    try {
      await supabase
        .from("orders")
        .update({
          status: "error",
          metadata: {
            confirmation_error:
              error instanceof Error ? error.message : String(error),
            confirmation_failed_at: new Date().toISOString(),
          },
        })
        .eq("id", orderId);
    } catch (logError) {
      console.error("Failed to log confirmation error:", logError);
    }
  }

  /**
   * Manual trigger for delivery automation (for admin use)
   */
  static async manuallyTriggerDelivery(
    orderId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Manually triggering delivery for order: ${orderId}`);

      const result =
        await DeliveryAutomationService.automateDeliveryForOrder(orderId);

      if (result.success) {
        // Clear any previous delivery automation errors
        await supabase
          .from("orders")
          .update({
            metadata: {
              manual_delivery_triggered_at: new Date().toISOString(),
              requires_manual_delivery_setup: false,
            },
          })
          .eq("id", orderId);
      }

      return result;
    } catch (error) {
      console.error(`❌ Manual delivery trigger failed for ${orderId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if order needs manual delivery setup
   */
  static async checkOrderNeedsManualDelivery(
    orderId: string,
  ): Promise<boolean> {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("metadata, status")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        return false;
      }

      // Check if order is paid but needs manual delivery setup
      return (
        order.status === "paid" &&
        order.metadata?.requires_manual_delivery_setup === true
      );
    } catch (error) {
      console.error("Error checking manual delivery need:", error);
      return false;
    }
  }

  /**
   * Get orders that need manual delivery intervention
   */
  static async getOrdersNeedingManualDelivery() {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "paid")
        .eq("metadata->requires_manual_delivery_setup", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return orders || [];
    } catch (error) {
      console.error("Error fetching orders needing manual delivery:", error);
      return [];
    }
  }
}
