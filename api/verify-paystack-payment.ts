// Vercel API Route - Fallback for verify-paystack-payment edge function
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface PaystackTransaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
  };
  metadata?: Record<string, any>;
  paid_at?: string;
}

export default async function handler(req: NextRequest) {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return NextResponse.json(
      { success: false, error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const body = await req.json();
    const { reference, orderId } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Check if payment was already verified
    const { data: existingPayment, error: paymentCheckError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (existingPayment?.status === "verified") {
      return NextResponse.json(
        {
          success: true,
          verified: true,
          alreadyVerified: true,
          transaction: existingPayment.paystack_response,
          payment: existingPayment,
        },
        { headers: corsHeaders },
      );
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET_KEY) {
      // Test mode
      const mockTransaction: PaystackTransaction = {
        reference,
        status: "success",
        amount: 10000,
        currency: "ZAR",
        customer: { email: "test@example.com" },
        metadata: { order_id: orderId },
        paid_at: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          verified: true,
          testMode: true,
          transaction: mockTransaction,
        },
        { headers: corsHeaders },
      );
    }

    // Verify with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!paystackResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed with Paystack API",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const paystackData = await paystackResponse.json();
    const transaction = paystackData.data;

    if (!transaction || transaction.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          status: transaction?.status || "unknown",
          message: "Payment was not successful",
        },
        { headers: corsHeaders },
      );
    }

    // Save payment record
    const paymentRecord = {
      reference,
      status: "verified",
      amount: transaction.amount / 100,
      currency: transaction.currency,
      paystack_response: transaction,
      metadata: transaction.metadata,
      verified_at: new Date().toISOString(),
      user_id: transaction.metadata?.buyer_id,
      order_id: orderId,
    };

    const { error: saveError } = await supabase
      .from("payments")
      .upsert(paymentRecord, { onConflict: "reference" });

    if (saveError) {
      console.error("Failed to save payment record:", saveError);
    }

    // Update order status
    if (orderId) {
      await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_reference: reference,
        })
        .eq("id", orderId);
    }

    return NextResponse.json(
      {
        success: true,
        verified: true,
        transaction,
        payment: paymentRecord,
        amount: transaction.amount / 100,
        currency: transaction.currency,
      },
      { headers: corsHeaders },
    );
  } catch (error: any) {
    console.error("Error in payment verification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
