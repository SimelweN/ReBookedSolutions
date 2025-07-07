import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ExpiredRecord {
  id: string;
  buyer_id: string;
  seller_id: string;
  book_id?: string;
  amount: number;
  paystack_reference?: string;
  buyer_email?: string;
  expires_at?: string;
  commit_deadline?: string;
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

    // Find expired transactions
    const { data: expiredTransactions, error: transactionError } =
      await supabase
        .from("transactions")
        .select("*")
        .eq("status", "paid_pending_seller")
        .or(`expires_at.lt.${now},commit_deadline.lt.${now}`)
        .limit(50); // Process in batches

    if (transactionError) {
      console.warn("Error fetching expired transactions:", transactionError);
    }

    // Find expired orders
    const { data: expiredOrders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "paid")
      .or(`expires_at.lt.${now},commit_deadline.lt.${now}`)
      .limit(50); // Process in batches

    if (orderError) {
      console.warn("Error fetching expired orders:", orderError);
    }

    const allExpiredRecords: ExpiredRecord[] = [
      ...(expiredTransactions || []),
      ...(expiredOrders || []),
    ];

    console.log(
      `📊 Found ${allExpiredRecords.length} expired records to process`,
    );

    let processedCount = 0;
    let errorCount = 0;

    for (const record of allExpiredRecords) {
      try {
        console.log(`⏰ Processing expired record: ${record.id}`);

        // Determine which table this record is from
        const isTransaction = expiredTransactions?.some(
          (t) => t.id === record.id,
        );
        const tableName = isTransaction ? "transactions" : "orders";

        // Update record status to expired
        const { error: updateError } = await supabase
          .from(tableName)
          .update({
            status: "expired",
            updated_at: now,
          })
          .eq("id", record.id);

        if (updateError) {
          console.error(
            `Error updating ${tableName} ${record.id}:`,
            updateError,
          );
          errorCount++;
          continue;
        }

        // Relist the book as available
        if (record.book_id) {
          const { error: bookUpdateError } = await supabase
            .from("books")
            .update({
              sold: false,
              available: true,
              status: "available",
              updated_at: now,
            })
            .eq("id", record.book_id);

          if (bookUpdateError) {
            console.warn(
              `Could not relist book ${record.book_id}:`,
              bookUpdateError,
            );
          } else {
            console.log(`📚 Book ${record.book_id} relisted as available`);
          }
        }

        // Process refund if Paystack reference exists
        if (record.paystack_reference && PAYSTACK_SECRET_KEY) {
          try {
            console.log(
              `💳 Processing refund for: ${record.paystack_reference}`,
            );

            const refundResponse = await fetch(
              "https://api.paystack.co/refund",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transaction: record.paystack_reference,
                  amount: record.amount, // Amount in kobo
                  currency: "ZAR",
                  customer_note: "Refund for expired seller commitment window",
                  merchant_note: `Auto-refund for ${tableName} ${record.id} - seller did not commit within 48 hours`,
                }),
              },
            );

            const refundResult = await refundResponse.json();

            if (refundResult.status) {
              console.log(
                `✅ Refund successful for ${record.paystack_reference}:`,
                refundResult.data,
              );

              // Update record with refund details
              await supabase
                .from(tableName)
                .update({
                  status: "refunded",
                  refund_reference: refundResult.data?.reference,
                  refunded_at: now,
                  updated_at: now,
                })
                .eq("id", record.id);
            } else {
              console.error(
                `❌ Refund failed for ${record.paystack_reference}:`,
                refundResult.message,
              );
              errorCount++;
              continue;
            }
          } catch (refundError) {
            console.error(
              `💥 Refund processing error for ${record.paystack_reference}:`,
              refundError,
            );
            errorCount++;
            continue;
          }
        }

        // Create notifications for both parties
        try {
          // Notification for buyer
          await supabase.from("order_notifications").insert({
            order_id: record.id,
            user_id: record.buyer_id,
            type: "commit_expired_refund",
            title: "Order Automatically Cancelled - Refund Processed",
            message: `Your order #${record.id.slice(0, 8)} was automatically cancelled because the seller did not commit within 48 hours. Your refund has been processed.`,
            read: false,
          });

          // Notification for seller
          await supabase.from("order_notifications").insert({
            order_id: record.id,
            user_id: record.seller_id,
            type: "commit_expired_penalty",
            title: "Sale Automatically Cancelled - Commitment Window Expired",
            message: `Your sale for order #${record.id.slice(0, 8)} was automatically cancelled for not committing within 48 hours. The buyer has been refunded and the book has been relisted.`,
            read: false,
          });

          console.log(`📬 Expiry notifications sent for record ${record.id}`);
        } catch (notificationError) {
          console.warn(
            `Failed to send expiry notifications for ${record.id}:`,
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
