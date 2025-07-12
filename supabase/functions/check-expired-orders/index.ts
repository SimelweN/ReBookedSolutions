
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for expired orders that need refunds');

    // Get orders that passed collection deadline (7 days after commit)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        seller_id,
        amount,
        buyer_email,
        committed_at,
        books(title, author)
      `)
      .eq('status', 'committed')
      .lt('committed_at', cutoffDate.toISOString())
      .is('cancelled_at', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${expiredOrders?.length || 0} orders past collection deadline`);

    let processed = 0;
    let failed = 0;

    for (const order of expiredOrders || []) {
      try {
        // Update order status to cancelled
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'refunded',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: 'Collection deadline exceeded (7 days)'
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`Failed to update order ${order.id}:`, updateError);
          failed++;
          continue;
        }

        // Create refund notification
        await supabase.from('notifications').insert({
          user_id: order.buyer_id,
          type: 'refund_processed',
          title: 'Refund Processed',
          message: `Your order for "${order.books?.title}" has been refunded due to collection deadline being exceeded.`
        });

        // Log the refund
        await supabase.from('audit_logs').insert({
          action: 'automatic_refund',
          table_name: 'orders',
          record_id: order.id,
          new_values: {
            reason: 'collection_deadline_exceeded',
            amount: order.amount,
            refund_date: new Date().toISOString()
          }
        });

        processed++;
        console.log(`Processed refund for order ${order.id}`);

      } catch (error) {
        console.error(`Error processing refund for order ${order.id}:`, error);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        failed,
        total: expiredOrders?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-expired-orders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
