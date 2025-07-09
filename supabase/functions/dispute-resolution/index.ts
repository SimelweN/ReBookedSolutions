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
          message: "Dispute resolution function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { action, disputeId, orderId, reason, resolution } = body;

    // Process dispute based on action
    let result;
    switch (action) {
      case "create":
        result = {
          id: crypto.randomUUID(),
          order_id: orderId,
          reason: reason || "Not specified",
          status: "open",
          created_at: new Date().toISOString(),
        };
        break;

      case "resolve":
        result = {
          id: disputeId || crypto.randomUUID(),
          status: "resolved",
          resolution: resolution || "Dispute resolved successfully",
          resolved_at: new Date().toISOString(),
        };
        break;

      default:
        result = {
          id: disputeId || crypto.randomUUID(),
          status: "processed",
          action: action || "updated",
          processed_at: new Date().toISOString(),
        };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dispute ${action || "processed"} successfully`,
        dispute: result,
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
