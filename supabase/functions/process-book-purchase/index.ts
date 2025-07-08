import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  createGenericErrorHandler,
} from "../_shared/cors.ts";
import {
  validateAndCreateSupabaseClient,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

// Helper function to get user from request
async function getUserFromRequest(req: Request, supabase: any) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) {
    console.error("Auth error:", error);
    return null;
  }

  return user;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    console.log("=== Book Purchase with Split Payment ===");

    // Validate environment variables
    const missingEnvVars = validateRequiredEnvVars([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }

    const supabase = validateAndCreateSupabaseClient();

    // Step 1: Authenticate the user (buyer)
    const user = await getUserFromRequest(req, supabase);
    if (!user) {
      return createErrorResponse("Unauthorized - please login first", 401);
    }

    console.log("Authenticated buyer:", user.id, user.email);

    // Step 2: Parse request body
    const requestBody = await req.json();
    console.log("Request body received:", requestBody);

    const {
      book_id,
      amount,
      delivery_fee = 0,
      delivery_address = null,
      payment_method = "paystack",
    } = requestBody;

    // Validate required fields
    if (!book_id || !amount) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "book_id and amount are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 3: Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Step 4: Get book details and seller's subaccount
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select(
        `
        id,
        title,
        price,
        seller_id,
        subaccount_code,
        profiles!books_seller_id_fkey (
          subaccount_code,
          name,
          email
        )
      `,
      )
      .eq("id", book_id)
      .eq("sold", false)
      .single();

    if (bookError || !book) {
      console.error("Book not found or error:", bookError);
      return new Response(
        JSON.stringify({
          error: "Book not found or no longer available",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify seller has subaccount
    const sellerSubaccount =
      book.subaccount_code || book.profiles?.subaccount_code;
    if (!sellerSubaccount) {
      return new Response(
        JSON.stringify({
          error: "Seller banking setup incomplete. Cannot process payment.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify amount matches book price
    if (Math.abs(amount - book.price) > 0.01) {
      return new Response(
        JSON.stringify({
          error: "Amount mismatch with book price",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 5: Calculate payment split
    const platformCommission = amount * 0.1; // 10% platform fee
    const sellerAmount = amount - platformCommission;
    const totalAmount = amount + delivery_fee;

    console.log("Payment split calculated:", {
      totalAmount,
      bookPrice: amount,
      deliveryFee: delivery_fee,
      platformCommission,
      sellerAmount,
      sellerSubaccount,
    });

    // Step 6: Create order record (using new orders table structure)
    const orderItems = [
      {
        book_id: book.id,
        title: book.title,
        author: book.author || "Unknown",
        price: Math.round(amount * 100), // Price in kobo
        condition: book.condition || "Used",
        isbn: book.isbn || "",
        image_url: book.image_url || "",
        seller_id: book.seller_id,
      },
    ];

    const paymentReference = `rb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_email: user.email,
        seller_id: book.seller_id,
        amount: Math.round(totalAmount * 100), // Store in kobo
        status: "pending",
        paystack_ref: paymentReference,
        items: orderItems,
        shipping_address: delivery_address,
        delivery_data: {
          delivery_fee: delivery_fee,
          delivery_address: delivery_address,
        },
        payment_data: {
          book_price: amount,
          delivery_fee: delivery_fee,
          platform_commission: platformCommission,
          seller_amount: sellerAmount,
          seller_subaccount_code: sellerSubaccount,
        },
        metadata: {
          delivery_address: delivery_address,
          payment_method: payment_method,
          split_details: {
            book_price: amount,
            delivery_fee: delivery_fee,
            platform_commission: platformCommission,
            seller_amount: sellerAmount,
          },
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({
          error: "Failed to create order",
          details: orderError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 7: Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 8: Create Paystack transaction with split payment
    const paystackPayload = {
      amount: Math.round(totalAmount * 100), // Convert to kobo
      email: user.email,
      reference: paymentReference,
      callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paystack-webhook`,
      metadata: {
        order_id: order.id,
        book_id: book.id,
        book_title: book.title,
        buyer_email: user.email,
        seller_id: book.seller_id,
        delivery_fee: delivery_fee,
      },
      subaccount: sellerSubaccount,
      transaction_charge: Math.round(platformCommission * 100), // Platform commission in kobo
      bearer: "subaccount", // Seller pays the transaction fee
    };

    console.log("Creating Paystack transaction:", paystackPayload);

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      },
    );

    const paystackData = await paystackResponse.json();
    console.log("Paystack response:", paystackData);

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack API error:", paystackData);

      // Clean up order
      await supabase.from("orders").delete().eq("id", order.id);

      return new Response(
        JSON.stringify({
          error: paystackData.message || "Failed to initialize payment",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 9: Update order with Paystack reference
    await supabase
      .from("orders")
      .update({
        paystack_ref: paystackData.data.reference,
      })
      .eq("id", order.id);

    // Step 10: Mark book as sold temporarily (will be reverted if payment fails)
    await supabase.from("books").update({ sold: true }).eq("id", book.id);

    console.log("Order created successfully:", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        payment_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        amount: totalAmount,
        split_details: {
          book_price: amount,
          delivery_fee: delivery_fee,
          platform_commission: platformCommission,
          seller_amount: sellerAmount,
          seller_subaccount: sellerSubaccount,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return createGenericErrorHandler("process-book-purchase")(error);
  }
});
