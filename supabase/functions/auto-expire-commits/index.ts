import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ExpiredRecord {
  id: string;
  buyer_email: string;
  seller_id: string;
  items?: any[];
  amount: number;
  paystack_ref?: string;
  created_at: string;
  paid_at?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔄 Starting auto-expire-commits cron job...");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    // Find orders that have been paid for more than 7 days (expired)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: expiredOrders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "paid")
      .lt("paid_at", sevenDaysAgo.toISOString())
      .limit(50); // Process in batches

    if (orderError) {
      console.warn("Error fetching expired orders:", orderError);
    }

    const allExpiredRecords: ExpiredRecord[] = expiredOrders || [];

    console.log(
      `📊 Found ${allExpiredRecords.length} expired records to process`,
    );

    let processedCount = 0;
    let errorCount = 0;

    for (const record of allExpiredRecords) {
      try {
        console.log(`⏰ Processing expired order: ${record.id}`);

        // Update order status to cancelled
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "cancelled",
            updated_at: now,
            metadata: {
              ...record.metadata,
              auto_cancelled_at: now,
              auto_cancel_reason: "Expired - no seller action within 7 days",
            },
          })
          .eq("id", record.id);

        if (updateError) {
          console.error(`Error updating order ${record.id}:`, updateError);
          errorCount++;
          continue;
        }

        // Relist the books as available
        if (record.items && Array.isArray(record.items)) {
          for (const item of record.items) {
            if (item.book_id) {
              const { error: bookUpdateError } = await supabase
                .from("books")
                .update({
                  sold: false,
                  available: true,
                  status: "available",
                  updated_at: now,
                })
                .eq("id", item.book_id);

              if (bookUpdateError) {
                console.warn(
                  `Could not relist book ${item.book_id}:`,
                  bookUpdateError,
                );
              } else {
                console.log(`📚 Book ${item.book_id} relisted as available`);
              }
            }
          }
        }

        // Process refund if Paystack reference exists
        if (record.paystack_ref && PAYSTACK_SECRET_KEY) {
          try {
            console.log(`💳 Processing refund for: ${record.paystack_ref}`);

            const refundResponse = await fetch(
              "https://api.paystack.co/refund",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transaction: record.paystack_ref,
                  amount: record.amount, // Amount in kobo
                  currency: "ZAR",
                  customer_note: "Refund for expired order",
                  merchant_note: `Auto-refund for order ${record.id} - expired after 7 days`,
                }),
              },
            );

            const refundResult = await refundResponse.json();

            if (refundResult.status) {
              console.log(
                `✅ Refund successful for ${record.paystack_ref}:`,
                refundResult.data,
              );

              // Update record with refund details
              await supabase
                .from("orders")
                .update({
                  status: "cancelled",
                  metadata: {
                    ...record.metadata,
                    refund_reference: refundResult.data?.reference,
                    refunded_at: now,
                  },
                  updated_at: now,
                })
                .eq("id", record.id);
            } else {
              console.error(
                `❌ Refund failed for ${record.paystack_ref}:`,
                refundResult.message,
              );
              errorCount++;
              continue;
            }
          } catch (refundError) {
            console.error(
              `💥 Refund processing error for ${record.paystack_ref}:`,
              refundError,
            );
            errorCount++;
            continue;
          }
        }

        // Create notification for seller (buyer notification would need buyer_id which is not in current schema)
        try {
          // Notification for seller
          await supabase.from("order_notifications").insert({
            order_id: record.id,
            user_id: record.seller_id,
            type: "order_expired",
            title: "Order Automatically Cancelled - Expired",
            message: `Your order #${record.id.slice(0, 8)} was automatically cancelled after 7 days without action. The books have been relisted.`,
            read: false,
          });

          console.log(`📬 Expiry notification sent for order ${record.id}`);
        } catch (notificationError) {
          console.warn(
            `Failed to send expiry notification for ${record.id}:`,
            notificationError,
          );
        }

        processedCount++;
        console.log(`✅ Successfully processed expired record: ${record.id}`);
      } catch (recordError) {
        console.error(`💥 Error processing record ${record.id}:`, recordError);
        errorCount++;
      }
    }

    const summary = {
      total_found: allExpiredRecords.length,
      successfully_processed: processedCount,
      errors: errorCount,
      timestamp: now,
    };

    console.log("📊 Auto-expire-commits job completed:", summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} expired records`,
        summary: summary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("💥 Error in auto-expire-commits cron job:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process expired commits",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
