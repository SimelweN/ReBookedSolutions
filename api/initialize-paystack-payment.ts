import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitConfigs } from "./utils/rate-limiter";

interface PaystackInitRequest {
  email: string;
  amount: number;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  subaccount?: string;
  order_id?: string;
  currency?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply rate limiting
  const rateLimiter = rateLimit(rateLimitConfigs.payment);
  if (!rateLimiter(req, res)) {
    return; // Rate limit exceeded, response already sent
  }

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

    const {
      email,
      amount,
      reference,
      callback_url,
      metadata,
      subaccount,
      order_id,
      currency = "ZAR",
    }: PaystackInitRequest = req.body;

    // Validate required fields
    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        error: "Email and amount are required",
      });
    }

    // Generate reference if not provided
    const paymentReference =
      reference ||
      `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate amount (convert to kobo for Paystack)
    const amountInKobo = Math.round(amount * 100);
    if (amountInKobo < 100) {
      // Minimum 1 ZAR
      return res.status(400).json({
        success: false,
        error: "Minimum amount is R1.00",
      });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET_KEY) {
      // Test mode - return mock data
      const mockResponse = {
        status: true,
        message: "Authorization URL created (test mode)",
        data: {
          authorization_url: `https://checkout.paystack.com/test_${paymentReference}`,
          access_code: `access_${Date.now()}`,
          reference: paymentReference,
        },
      };

      return res.status(200).json({
        success: true,
        data: mockResponse.data,
        testMode: true,
        message: "Payment initialized successfully (test mode)",
      });
    }

    // Build request payload for Paystack
    const paystackPayload: Record<string, unknown> = {
      email,
      amount: amountInKobo,
      currency,
      reference: paymentReference,
      callback_url:
        callback_url ||
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/success`,
      metadata: {
        ...metadata,
        order_id,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order_id || "N/A",
          },
        ],
      },
    };

    // Add subaccount if provided (for split payments)
    if (subaccount) {
      paystackPayload.subaccount = subaccount;
      paystackPayload.transaction_charge = Math.round(amount * 0.1 * 100); // 10% platform fee in kobo
      paystackPayload.bearer = "subaccount"; // Subaccount bears the fee
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
        body: JSON.stringify(paystackPayload),
      },
    );

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error("Paystack API error:", errorText);
      return res.status(400).json({
        success: false,
        error: "Failed to initialize payment with Paystack",
        details: errorText,
      });
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return res.status(400).json({
        success: false,
        error: paystackData.message || "Payment initialization failed",
        details: paystackData,
      });
    }

    // Log payment initialization
    try {
      await supabase.from("payments").upsert(
        {
          reference: paymentReference,
          status: "pending",
          amount: amount,
          currency,
          user_id: metadata?.buyer_id,
          order_id,
          paystack_response: paystackData.data,
          metadata,
          created_at: new Date().toISOString(),
        },
        { onConflict: "reference" },
      );
    } catch (error: any) {
      console.error("Failed to log payment initialization:", error);
    }

    return res.status(200).json({
      success: true,
      data: paystackData.data,
      message: "Payment initialized successfully",
    });
  } catch (error: unknown) {
    console.error("Error initializing payment:", error);
    return res.status(500).json({
      success: false,
      error: "Payment initialization failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
