import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const {
      cartItems,
      buyerId,
      buyerEmail,
      deliveryOptions,
      shippingAddress,
      callbackUrl,
    } = await req.json();

    if (
      !cartItems ||
      !buyerEmail ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields or empty cart" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Paystack configuration missing" }),
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    // Get book details and validate availability
    const bookIds = cartItems.map((item: any) => item.bookId);
    const { data: books, error: booksError } = await supabase
      .from("books")
      .select(
        `
        *,
        profiles!books_seller_id_fkey(id, full_name, email, subaccount_code)
      `,
      )
      .in("id", bookIds)
      .eq("sold", false);

    if (booksError || !books) {
      return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Check if all books are available
    const unavailableBooks = cartItems.filter(
      (item: any) => !books.find((book) => book.id === item.bookId),
    );

    if (unavailableBooks.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Some books are no longer available",
          unavailableBooks: unavailableBooks.map((item: any) => item.bookId),
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Prevent self-purchase
    const selfPurchases = books.filter((book) => book.seller_id === buyerId);
    if (selfPurchases.length > 0) {
      return new Response(
        JSON.stringify({ error: "Cannot purchase your own books" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Calculate totals
    let totalAmount = 0;
    let totalDeliveryFee = 0;
    const sellerSubaccounts: any[] = [];

    for (const book of books) {
      totalAmount += book.price;

      // Add delivery fees if applicable
      const deliveryOption = deliveryOptions?.find(
        (opt: any) => opt.bookId === book.id,
      );
      if (deliveryOption && deliveryOption.price > 0) {
        totalDeliveryFee += deliveryOption.price;
      }

      // Collect subaccount information
      if (book.profiles?.subaccount_code) {
        const sellerAmount = book.price * 0.9; // 90% to seller
        sellerSubaccounts.push({
          subaccount: book.profiles.subaccount_code,
          share: Math.round(sellerAmount * 100), // Convert to kobo
        });
      }
    }

    const grandTotal = totalAmount + totalDeliveryFee;

    // Generate unique reference
    const reference = `RS_MULTI_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Prepare payment data
    const paymentData: any = {
      email: buyerEmail,
      amount: grandTotal * 100, // Convert to kobo
      reference,
      callback_url: callbackUrl,
      metadata: {
        cart_items: cartItems,
        buyer_id: buyerId,
        delivery_options: deliveryOptions,
        shipping_address: shippingAddress,
        total_books: books.length,
        total_amount: totalAmount,
        delivery_fee: totalDeliveryFee,
      },
    };

    // Add split payment configuration if there are subaccounts
    if (sellerSubaccounts.length > 0) {
      paymentData.split = {
        type: "percentage",
        bearer_type: "subaccount",
        subaccounts: sellerSubaccounts,
      };
    }

    // Initialize payment with Paystack
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack error:", paystackData);
      return new Response(
        JSON.stringify({
          error: "Failed to initialize payment",
          details: paystackData.message || "Unknown error",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Log the payment initialization
    await supabase.from("audit_logs").insert({
      action: "multi_purchase_initialized",
      table_name: "transactions",
      user_id: buyerId,
      new_values: {
        reference,
        book_count: books.length,
        total_amount: grandTotal,
        email: buyerEmail,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        },
        summary: {
          book_count: books.length,
          total_amount: totalAmount,
          delivery_fee: totalDeliveryFee,
          grand_total: grandTotal,
        },
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error in process-multi-seller-purchase:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
