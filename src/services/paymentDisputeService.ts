import { supabase } from "@/integrations/supabase/client";

export interface PaymentDispute {
  id: string;
  order_id: string;
  reported_by: string;
  dispute_type:
    | "item_not_received"
    | "item_damaged"
    | "item_not_as_described"
    | "unauthorized_charge"
    | "refund_not_processed"
    | "other";
  status: "open" | "investigating" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  evidence_urls?: string[];
  resolution_notes?: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
  order?: any;
  reporter?: any;
}

interface DisputeResolution {
  action: "refund_buyer" | "pay_seller" | "partial_refund" | "no_action";
  amount?: number;
  notes: string;
}

export class PaymentDisputeService {
  /**
   * Create a new payment dispute
   */
  static async createDispute(disputeData: {
    order_id: string;
    reported_by: string;
    dispute_type: PaymentDispute["dispute_type"];
    description: string;
    evidence_urls?: string[];
  }): Promise<PaymentDispute> {
    try {
      console.log("🚨 Creating payment dispute:", disputeData);

      // Validate that the order exists and user is authorized
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, buyer_id, seller_id, status, amount")
        .eq("id", disputeData.order_id)
        .single();

      if (orderError || !order) {
        throw new Error(`Order not found: ${orderError?.message}`);
      }

      // Check if user is buyer or seller
      if (
        order.buyer_id !== disputeData.reported_by &&
        order.seller_id !== disputeData.reported_by
      ) {
        throw new Error("Unauthorized to create dispute for this order");
      }

      // Check if dispute already exists
      const { data: existingDispute } = await supabase
        .from("payment_disputes")
        .select("id")
        .eq("order_id", disputeData.order_id)
        .eq("status", "open")
        .single();

      if (existingDispute) {
        throw new Error("Open dispute already exists for this order");
      }

      // Determine priority based on dispute type and order amount
      let priority: PaymentDispute["priority"] = "medium";
      if (order.amount > 1000) priority = "high";
      if (disputeData.dispute_type === "unauthorized_charge")
        priority = "urgent";

      // Create dispute
      const { data: dispute, error } = await supabase
        .from("payment_disputes")
        .insert([
          {
            order_id: disputeData.order_id,
            reported_by: disputeData.reported_by,
            dispute_type: disputeData.dispute_type,
            description: disputeData.description,
            evidence_urls: disputeData.evidence_urls || [],
            status: "open",
            priority,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Hold payment if order is paid but not yet collected
      if (order.status === "paid") {
        await supabase
          .from("orders")
          .update({
            payment_held: true,
            dispute_hold: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", disputeData.order_id);
      }

      console.log("✅ Payment dispute created:", dispute.id);

      return dispute as PaymentDispute;
    } catch (error) {
      console.error("Error creating payment dispute:", error);
      throw error;
    }
  }

  /**
   * Get all disputes with filtering options
   */
  static async getDisputes(filters?: {
    status?: PaymentDispute["status"];
    priority?: PaymentDispute["priority"];
    dispute_type?: PaymentDispute["dispute_type"];
  }): Promise<PaymentDispute[]> {
    try {
      let query = supabase
        .from("payment_disputes")
        .select(
          `
          *,
          orders!payment_disputes_order_id_fkey(
            id,
            amount,
            book_title,
            status,
            buyer_email
          ),
          profiles!payment_disputes_reported_by_fkey(
            full_name,
            email
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.dispute_type) {
        query = query.eq("dispute_type", filters.dispute_type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as PaymentDispute[];
    } catch (error) {
      console.error("Error getting disputes:", error);
      throw error;
    }
  }

  /**
   * Get dispute by ID with full details
   */
  static async getDisputeById(disputeId: string): Promise<PaymentDispute> {
    try {
      const { data, error } = await supabase
        .from("payment_disputes")
        .select(
          `
          *,
          orders!payment_disputes_order_id_fkey(
            id,
            amount,
            book_title,
            status,
            buyer_email,
            seller_id,
            buyer_id,
            paystack_ref
          ),
          profiles!payment_disputes_reported_by_fkey(
            full_name,
            email
          )
        `,
        )
        .eq("id", disputeId)
        .single();

      if (error || !data) {
        throw new Error(`Dispute not found: ${error?.message}`);
      }

      return data as PaymentDispute;
    } catch (error) {
      console.error("Error getting dispute by ID:", error);
      throw error;
    }
  }

  /**
   * Update dispute status
   */
  static async updateDisputeStatus(
    disputeId: string,
    status: PaymentDispute["status"],
    notes?: string,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.resolution_notes = notes;
      }

      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = "admin"; // TODO: Get actual admin user ID
      }

      const { error } = await supabase
        .from("payment_disputes")
        .update(updateData)
        .eq("id", disputeId);

      if (error) {
        throw error;
      }

      console.log("✅ Dispute status updated:", disputeId, status);
    } catch (error) {
      console.error("Error updating dispute status:", error);
      throw error;
    }
  }

  /**
   * Resolve dispute with action
   */
  static async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    resolvedBy: string,
  ): Promise<void> {
    try {
      console.log("🔧 Resolving dispute:", disputeId, resolution);

      // Get dispute details
      const dispute = await this.getDisputeById(disputeId);

      if (dispute.status === "resolved" || dispute.status === "closed") {
        throw new Error("Dispute is already resolved");
      }

      // Execute resolution action
      switch (resolution.action) {
        case "refund_buyer":
          await this.processDisputeRefund(dispute.order_id, resolution.amount);
          break;

        case "pay_seller":
          await this.processDisputePayout(dispute.order_id);
          break;

        case "partial_refund":
          if (!resolution.amount) {
            throw new Error("Amount required for partial refund");
          }
          await this.processDisputeRefund(dispute.order_id, resolution.amount);
          await this.processDisputePayout(
            dispute.order_id,
            dispute.order.amount - resolution.amount,
          );
          break;

        case "no_action":
          // Remove dispute hold
          await this.removeDisputeHold(dispute.order_id);
          break;
      }

      // Update dispute status
      await supabase
        .from("payment_disputes")
        .update({
          status: "resolved",
          resolution_notes: resolution.notes,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          resolution_action: resolution.action,
          resolution_amount: resolution.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", disputeId);

      console.log("✅ Dispute resolved:", disputeId);
    } catch (error) {
      console.error("Error resolving dispute:", error);
      throw error;
    }
  }

  /**
   * Process dispute refund
   */
  private static async processDisputeRefund(
    orderId: string,
    amount?: number,
  ): Promise<void> {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("paystack_ref, amount")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        throw new Error(`Order not found: ${error?.message}`);
      }

      const refundAmount = amount || order.amount;

      // TODO: Implement actual Paystack refund API call
      console.log(
        `💰 Processing refund of R${refundAmount} for order ${orderId}`,
      );

      // Update order status
      await supabase
        .from("orders")
        .update({
          status: "refunded",
          refund_amount: refundAmount,
          refund_completed_at: new Date().toISOString(),
          dispute_hold: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    } catch (error) {
      console.error("Error processing dispute refund:", error);
      throw error;
    }
  }

  /**
   * Process dispute payout to seller
   */
  private static async processDisputePayout(
    orderId: string,
    amount?: number,
  ): Promise<void> {
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("seller_amount")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        throw new Error(`Order not found: ${error?.message}`);
      }

      const payoutAmount = amount || order.seller_amount;

      // Create payout transaction
      await supabase.from("payout_transactions").insert([
        {
          order_id: orderId,
          seller_id: order.seller_id,
          amount: payoutAmount,
          status: "pending",
          dispute_resolution: true,
        },
      ]);

      // Remove dispute hold
      await this.removeDisputeHold(orderId);
    } catch (error) {
      console.error("Error processing dispute payout:", error);
      throw error;
    }
  }

  /**
   * Remove dispute hold from order
   */
  private static async removeDisputeHold(orderId: string): Promise<void> {
    try {
      await supabase
        .from("orders")
        .update({
          dispute_hold: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    } catch (error) {
      console.error("Error removing dispute hold:", error);
      throw error;
    }
  }

  /**
   * Get dispute statistics
   */
  static async getDisputeStats(): Promise<{
    total: number;
    open: number;
    investigating: number;
    resolved: number;
    closed: number;
    averageResolutionTime: number; // in hours
  }> {
    try {
      const { data, error } = await supabase
        .from("payment_disputes")
        .select("status, created_at, resolved_at");

      if (error) {
        throw error;
      }

      const stats = data.reduce(
        (acc, dispute) => {
          acc.total++;
          acc[dispute.status as keyof typeof acc]++;

          if (dispute.resolved_at && dispute.created_at) {
            const resolutionTime =
              new Date(dispute.resolved_at).getTime() -
              new Date(dispute.created_at).getTime();
            acc.totalResolutionTime += resolutionTime / (1000 * 60 * 60); // Convert to hours
            acc.resolvedCount++;
          }

          return acc;
        },
        {
          total: 0,
          open: 0,
          investigating: 0,
          resolved: 0,
          closed: 0,
          totalResolutionTime: 0,
          resolvedCount: 0,
        },
      );

      const averageResolutionTime =
        stats.resolvedCount > 0
          ? stats.totalResolutionTime / stats.resolvedCount
          : 0;

      return {
        total: stats.total,
        open: stats.open,
        investigating: stats.investigating,
        resolved: stats.resolved,
        closed: stats.closed,
        averageResolutionTime,
      };
    } catch (error) {
      console.error("Error getting dispute stats:", error);
      throw error;
    }
  }
}
