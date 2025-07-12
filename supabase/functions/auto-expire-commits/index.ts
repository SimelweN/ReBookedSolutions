
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
    console.log('Starting auto-expire-commits job');

    // Get orders that need to be expired (commit_deadline passed)
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        seller_id,
        book_id,
        amount,
        buyer_email,
        books(title, author)
      `)
      .eq('status', 'paid')
      .eq('payment_status', 'paid')
      .lt('commit_deadline', new Date().toISOString())
      .is('committed_at', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${expiredOrders?.length || 0} expired orders`);

    let processed = 0;
    let failed = 0;

    for (const order of expiredOrders || []) {
      try {
        // Cancel the order
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: 'Seller failed to commit within 7 days'
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`Failed to update order ${order.id}:`, updateError);
          failed++;
          continue;
        }

        // Mark book as available again
        if (order.book_id) {
          await supabase
            .from('books')
            .update({ sold: false })
            .eq('id', order.book_id);
        }

        // Send notifications
        const notifications = [
          {
            user_id: order.buyer_id,
            type: 'order_cancelled',
            title: 'Order Cancelled - Refund Processing',
            message: `Your order for "${order.books?.title}" has been cancelled due to seller inactivity. A refund will be processed within 24 hours.`
          },
          {
            user_id: order.seller_id,
            type: 'order_expired',
            title: 'Order Auto-Cancelled',
            message: `Your order for "${order.books?.title}" was automatically cancelled for not committing within 7 days.`
          }
        ];

        await supabase.from('notifications').insert(notifications);

        // Log the action
        await supabase.from('audit_logs').insert({
          action: 'order_auto_expired',
          table_name: 'orders',
          record_id: order.id,
          new_values: { 
            reason: 'commit_deadline_expired',
            amount: order.amount
          }
        });

        processed++;
        console.log(`Processed order ${order.id}`);

      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
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
    console.error('Error in auto-expire-commits:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
