import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Only call req.json() ONCE
    const body = await req.json();
    console.log("Received body:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Get delivery quotes function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { fromAddress, toAddress, parcel } = body;

    if (!fromAddress || !toAddress || !parcel) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: fromAddress, toAddress, parcel",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate getting delivery quotes from multiple providers
    const quotes = [
      {
        provider: "Courier Guy",
        service: "Standard Overnight",
        price: 89.0,
        currency: "ZAR",
        estimated_days: "1-2",
        service_code: "ON",
        tracking_included: true,
      },
      {
        provider: "Courier Guy",
        service: "Express Same Day",
        price: 150.0,
        currency: "ZAR",
        estimated_days: "0",
        service_code: "SD",
        tracking_included: true,
      },
      {
        provider: "Fastway",
        service: "Standard Delivery",
        price: 75.0,
        currency: "ZAR",
        estimated_days: "2-3",
        service_code: "STD",
        tracking_included: true,
      },
      {
        provider: "Fastway",
        service: "Express Delivery",
        price: 120.0,
        currency: "ZAR",
        estimated_days: "1",
        service_code: "EXP",
        tracking_included: true,
      },
    ];

    const deliveryQuotes = {
      from: fromAddress,
      to: toAddress,
      parcel: parcel,
      quotes: quotes,
      quote_count: quotes.length,
      generated_at: new Date().toISOString(),
    };

    console.log("Generated delivery quotes:", deliveryQuotes);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Delivery quotes retrieved successfully",
        data: deliveryQuotes,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Edge Function Error:", error);

    return new Response(
      JSON.stringify({
        error: "Function crashed",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
