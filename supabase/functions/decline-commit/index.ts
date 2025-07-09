
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

    const { orderId, sellerId, reason } = await req.json();

    if (!orderId || !sellerId) {
      return new Response(
        JSON.stringify({ error: 'Order ID and Seller ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the order and verify seller ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        books(id, title, author, seller_id)
      `)
      .eq('id', orderId)
      .eq('seller_id', sellerId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.status !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'Order is not in paid status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'Seller declined to commit',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Mark book as available again
    if (order.book_id) {
      await supabase
        .from('books')
        .update({ 
          sold: false,
          availability: 'available'
        })
        .eq('id', order.book_id);
    }

    // Send notification to buyer
    await supabase.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Unfortunately, the seller has declined your order for "${order.books?.title}". ${reason ? `Reason: ${reason}` : ''} A full refund will be processed within 24 hours.`
    });

    // Log the decline
    await supabase.from('audit_logs').insert({
      action: 'seller_declined',
      table_name: 'orders',
      record_id: orderId,
      user_id: sellerId,
      new_values: {
        declined_at: new Date().toISOString(),
        reason: reason || 'No reason provided',
        book_title: order.books?.title
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order declined and book relisted',
        order: {
          id: order.id,
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in decline-commit:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
