
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

    const {
      bookId,
      buyerId,
      buyerEmail,
      deliveryOption,
      shippingAddress,
      callbackUrl
    } = await req.json();

    if (!bookId || !buyerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: bookId, buyerEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get book details and check availability
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select(`
        *,
        profiles!books_seller_id_fkey(id, full_name, email, subaccount_code)
      `)
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return new Response(
        JSON.stringify({ error: 'Book not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (book.sold) {
      return new Response(
        JSON.stringify({ error: 'Book is no longer available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-purchase
    if (book.seller_id === buyerId) {
      return new Response(
        JSON.stringify({ error: 'You cannot purchase your own book' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount (book price + delivery if applicable)
    let totalAmount = book.price;
    let deliveryFee = 0;

    if (deliveryOption && deliveryOption !== 'self_collection') {
      // Add delivery fee if not self collection
      deliveryFee = deliveryOption.price || 0;
      totalAmount += deliveryFee;
    }

    // Initialize payment with Paystack
    const paymentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/initialize-paystack-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: buyerEmail,
        amount: totalAmount,
        bookId: bookId,
        sellerId: book.seller_id,
        deliveryOption: deliveryOption,
        shippingAddress: shippingAddress,
        callbackUrl: callbackUrl
      })
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(error.error || 'Failed to initialize payment');
    }

    const paymentData = await paymentResponse.json();

    // Log the purchase attempt
    await supabase.from('audit_logs').insert({
      action: 'book_purchase_initiated',
      table_name: 'books',
      record_id: bookId,
      user_id: buyerId,
      new_values: {
        book_title: book.title,
        amount: totalAmount,
        delivery_option: deliveryOption?.service || 'self_collection',
        payment_reference: paymentData.data.reference
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          image_url: book.image_url
        },
        seller: {
          id: book.profiles.id,
          name: book.profiles.full_name
        },
        payment: paymentData.data,
        total_amount: totalAmount,
        delivery_fee: deliveryFee
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-book-purchase:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
