
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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderId, collectedBy, collectionNotes } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        books(title, author, seller_id),
        profiles!orders_seller_id_fkey(full_name, email, subaccount_code)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.status !== 'committed') {
      return new Response(
        JSON.stringify({ error: 'Order must be committed before it can be marked as collected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order status to collected
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'collected',
        updated_at: new Date().toISOString(),
        metadata: {
          ...order.metadata,
          collected_at: new Date().toISOString(),
          collected_by: collectedBy,
          collection_notes: collectionNotes
        }
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Send notifications
    const notifications = [
      {
        user_id: order.buyer_id,
        type: 'order_collected',
        title: 'Order Collected Successfully',
        message: `Your order for "${order.books?.title}" has been marked as collected. Thank you for your purchase!`
      },
      {
        user_id: order.seller_id,
        type: 'order_collected',
        title: 'Order Collected',
        message: `Your book "${order.books?.title}" has been collected by the buyer. Payout will be processed shortly.`
      }
    ];

    await supabase.from('notifications').insert(notifications);

    // Trigger seller payout if seller has subaccount
    if (order.profiles?.subaccount_code) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pay-seller`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: orderId,
            sellerId: order.seller_id
          })
        });
      } catch (payoutError) {
        console.error('Error triggering seller payout:', payoutError);
        // Don't fail the collection marking if payout fails
      }
    }

    // Log the collection
    await supabase.from('audit_logs').insert({
      action: 'order_collected',
      table_name: 'orders',
      record_id: orderId,
      user_id: collectedBy,
      new_values: {
        collected_at: new Date().toISOString(),
        collected_by: collectedBy,
        collection_notes: collectionNotes,
        book_title: order.books?.title
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order marked as collected successfully',
        order: {
          id: order.id,
          status: 'collected',
          collected_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mark-collected:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
