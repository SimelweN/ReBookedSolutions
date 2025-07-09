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

    // For webhooks, we need to read the raw body
    let body;
    let rawBody = "";

    try {
      rawBody = await req.text();
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      // If JSON parsing fails, treat as raw webhook data
      body = { rawData: rawBody };
    }

    console.log("Received webhook body:", body);

    // Handle health check (for testing purposes)
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Paystack webhook function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get webhook signature for verification
    const signature = req.headers.get("x-paystack-signature");

    // Process webhook event
    const event = body.event || "unknown";
    const data = body.data || {};

    console.log("Processing webhook event:", event);

    // Here you would typically:
    // 1. Verify the webhook signature
    // 2. Process the event based on type
    // 3. Update your database accordingly

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        event: event,
        signature_received: !!signature,
        body_length: rawBody.length,
        processed_at: new Date().toISOString(),
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
