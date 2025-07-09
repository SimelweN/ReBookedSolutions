import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  executeTransaction,
  createAuditLog,
} from "../_shared/utilities.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

const FUNCTION_NAME = "auto-expire-commits";

serve(
  createRobustFunction(FUNCTION_NAME, async (req, supabase) => {
    // Handle health check
    if (
      req.method === "GET" ||
      (req.method === "POST" && req.headers.get("content-length") === "0")
    ) {
      return createHealthResponse(FUNCTION_NAME);
    }

    let body = {};
    try {
      if (req.method === "POST") {
        body = await req.json();
      }
    } catch (error) {
      console.warn(
        `[${FUNCTION_NAME}] Failed to parse body, using empty object:`,
        error.message,
      );
    }

    // Handle health check in body
    if (body.action === "health") {
      return createHealthResponse(FUNCTION_NAME);
    }

    console.log(`[${FUNCTION_NAME}] Auto-expire commits triggered:`, {
      timestamp: new Date().toISOString(),
      trigger: body.trigger || "scheduled",
    });

    try {
      const now = new Date();
      const stats = {
        processed: 0,
        expired: 0,
        refunds_initiated: 0,
        notifications_sent: 0,
        errors: 0,
      };

      // Get orders that have exceeded commit deadline
      const { data: expiredOrders, error: queryError } = await supabase
        .from("orders")
        .select(
          `
        id,
        book_id,
        buyer_id,
        buyer_email,
        seller_id,
        amount,
        status,
        commit_deadline,
        created_at,
        books!inner(title, author, seller_id)
      `,
        )
        .eq("status", "paid")
        .lt("commit_deadline", now.toISOString())
        .is("expired_at", null);

      if (queryError) {
        throw new Error(
          `Failed to query expired orders: ${queryError.message}`,
        );
      }

      console.log(
        `[${FUNCTION_NAME}] Found ${expiredOrders?.length || 0} expired orders to process`,
      );

      if (!expiredOrders || expiredOrders.length === 0) {
        return createSuccessResponse({
          message: "No expired commits found",
          stats,
          processed_at: now.toISOString(),
        });
      }

      const processedExpiries = [];

      // Process each expired order with atomic operations
      for (const order of expiredOrders) {
        try {
          stats.processed++;

          const result = await executeTransaction(
            supabase,
            async () => {
              // Step 1: Mark order as expired
              const { error: orderUpdateError } = await supabase
                .from("orders")
                .update({
                  status: "expired",
                  expired_at: now.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq("id", order.id);

              if (orderUpdateError) {
                throw new Error(
                  `Failed to update order status: ${orderUpdateError.message}`,
                );
              }

              // Step 2: Mark book as available again
              const { error: bookUpdateError } = await supabase
                .from("books")
                .update({
                  sold: false,
                  updated_at: now.toISOString(),
                })
                .eq("id", order.book_id);

              if (bookUpdateError) {
                throw new Error(
                  `Failed to update book availability: ${bookUpdateError.message}`,
                );
              }

              // Step 3: Create refund record
              const { error: refundError } = await supabase
                .from("refunds")
                .insert({
                  order_id: order.id,
                  amount: order.amount,
                  reason: "seller_commit_expired",
                  status: "pending",
                  initiated_at: now.toISOString(),
                  created_at: now.toISOString(),
                });

              if (refundError) {
                console.warn(
                  `[${FUNCTION_NAME}] Failed to create refund record:`,
                  refundError,
                );
                // Don't fail transaction for refund record creation
              } else {
                stats.refunds_initiated++;
              }

              // Step 4: Notify buyer
              const { error: buyerNotificationError } = await supabase
                .from("notifications")
                .insert({
                  user_id: order.buyer_id,
                  type: "order_expired",
                  title: "Order Expired - Refund Initiated",
                  message: `Your order for "${order.books?.title}" has expired because the seller did not commit within 48 hours. A refund has been initiated.`,
                  data: {
                    order_id: order.id,
                    book_title: order.books?.title,
                    amount: order.amount,
                    refund_status: "pending",
                  },
                  created_at: now.toISOString(),
                });

              if (buyerNotificationError) {
                console.warn(
                  `[${FUNCTION_NAME}] Failed to create buyer notification:`,
                  buyerNotificationError,
                );
              } else {
                stats.notifications_sent++;
              }

              // Step 5: Notify seller (penalty notification)
              const { error: sellerNotificationError } = await supabase
                .from("notifications")
                .insert({
                  user_id: order.seller_id,
                  type: "commit_expired",
                  title: "Missed Commit Deadline",
                  message: `You missed the 48-hour commit deadline for "${order.books?.title}". The order has been cancelled and refunded to the buyer.`,
                  data: {
                    order_id: order.id,
                    book_title: order.books?.title,
                    amount: order.amount,
                    deadline_missed: order.commit_deadline,
                  },
                  created_at: now.toISOString(),
                });

              if (sellerNotificationError) {
                console.warn(
                  `[${FUNCTION_NAME}] Failed to create seller notification:`,
                  sellerNotificationError,
                );
              } else {
                stats.notifications_sent++;
              }

              return {
                order_id: order.id,
                book_id: order.book_id,
                book_title: order.books?.title,
                seller_id: order.seller_id,
                buyer_email: order.buyer_email,
                amount: order.amount,
                expired_at: now.toISOString(),
                original_deadline: order.commit_deadline,
              };
            },

            // Rollback operations if transaction fails
            async () => {
              console.log(
                `[${FUNCTION_NAME}] Rolling back expiry for order: ${order.id}`,
              );

              // Restore order status
              await supabase
                .from("orders")
                .update({ status: "paid", expired_at: null })
                .eq("id", order.id);

              // Mark book as sold again
              await supabase
                .from("books")
                .update({ sold: true })
                .eq("id", order.book_id);
            },
          );

          if (result.success) {
            stats.expired++;
            processedExpiries.push(result.data);

            // Log successful expiry
            await createAuditLog(
              supabase,
              "order_auto_expired",
              "orders",
              order.id,
              order.buyer_id,
              { status: order.status },
              result.data,
              FUNCTION_NAME,
            );

            console.log(
              `[${FUNCTION_NAME}] Successfully processed expired order: ${order.id}`,
            );
          } else {
            throw result.error;
          }
        } catch (error) {
          stats.errors++;
          console.error(
            `[${FUNCTION_NAME}] Failed to process order ${order.id}:`,
            error,
          );

          // Log error but continue processing other orders
          await createAuditLog(
            supabase,
            "order_expiry_failed",
            "orders",
            order.id,
            order.buyer_id,
            undefined,
            {
              error_message: error.message,
              order_details: {
                book_id: order.book_id,
                amount: order.amount,
                deadline: order.commit_deadline,
              },
            },
            FUNCTION_NAME,
          );
        }
      }

      // Log batch processing completion
      await createAuditLog(
        supabase,
        "auto_expire_batch_completed",
        "system",
        `batch_${now.getTime()}`,
        undefined,
        undefined,
        {
          total_found: expiredOrders.length,
          successfully_processed: stats.expired,
          errors: stats.errors,
          refunds_initiated: stats.refunds_initiated,
          notifications_sent: stats.notifications_sent,
        },
        FUNCTION_NAME,
      );

      console.log(`[${FUNCTION_NAME}] Batch processing completed:`, stats);

      return createSuccessResponse({
        message: `Processed ${stats.processed} expired commit(s)`,
        stats,
        expired_orders: processedExpiries,
        processed_at: now.toISOString(),
      });
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Auto-expire processing failed:`, error);

      return createErrorResponse(
        error instanceof Error
          ? error.message
          : "Failed to process expired commits",
        500,
        { processingTime: new Date().toISOString() },
        FUNCTION_NAME,
      );
    }
  }),
);
