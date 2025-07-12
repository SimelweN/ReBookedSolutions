import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

interface PaystackTransaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
  };
  metadata?: Record<string, unknown>;
  paid_at?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restrict to specific domains
  const allowedOrigins = [
    "https://rebookedsolutions.co.za",
    "https://www.rebookedsolutions.co.za",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { reference, orderId } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: "Payment reference is required",
      });
    }

    // Check if payment was already verified
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (existingPayment?.status === "verified") {
      return res.status(200).json({
        success: true,
        verified: true,
        alreadyVerified: true,
        transaction: existingPayment.paystack_response,
        payment: existingPayment,
      });
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

      // Save mock payment record
      const mockPayment = {
        reference,
        status: "verified",
        amount: mockTransaction.amount / 100,
        currency: mockTransaction.currency,
        paystack_response: mockTransaction,
        metadata: mockTransaction.metadata,
        verified_at: new Date().toISOString(),
        user_id: mockTransaction.metadata?.buyer_id,
      };

      await supabase
        .from("payments")
        .upsert(mockPayment, { onConflict: "reference" });

      return res.status(200).json({
        success: true,
        verified: true,
        testMode: true,
        transaction: mockTransaction,
        payment: mockPayment,
      });
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
      return res.status(400).json({
        success: false,
        error: "Payment verification failed with Paystack API",
      });
    }

    const paystackData = await paystackResponse.json();
    const transaction = paystackData.data;

    if (!transaction || transaction.status !== "success") {
      return res.status(400).json({
        success: false,
        status: transaction?.status || "unknown",
        message: "Payment was not successful",
      });
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

    return res.status(200).json({
      success: true,
      verified: true,
      transaction,
      payment: paymentRecord,
      amount: transaction.amount / 100,
      currency: transaction.currency,
    });
  } catch (error: unknown) {
    console.error("Error in payment verification:", error);
    return res.status(500).json({
      success: false,
      error: "Payment verification failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
