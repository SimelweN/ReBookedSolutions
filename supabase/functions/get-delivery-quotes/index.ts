import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Environment variable validation
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const optionalEnvVars = [
  "COURIER_GUY_API_KEY",
  "FASTWAY_API_KEY",
  "SHIPLOGIC_API_KEY",
];
const missingRequiredVars = requiredEnvVars.filter(
  (varName) => !Deno.env.get(varName),
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const COURIER_GUY_API_KEY = Deno.env.get("COURIER_GUY_API_KEY");
const FASTWAY_API_KEY = Deno.env.get("FASTWAY_API_KEY");
const SHIPLOGIC_API_KEY = Deno.env.get("SHIPLOGIC_API_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Health check handler
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "get-delivery-quotes",
          timestamp: new Date().toISOString(),
          environment: {
            hasRequiredVars: missingRequiredVars.length === 0,
            missingVars: missingRequiredVars,
            shippingProviders: {
              courierGuy: !!COURIER_GUY_API_KEY,
              fastway: !!FASTWAY_API_KEY,
              shiplogic: !!SHIPLOGIC_API_KEY,
            },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Environment validation
    if (missingRequiredVars.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error",
          details: `Missing environment variables: ${missingRequiredVars.join(", ")}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Health check via JSON
    if (requestBody.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "get-delivery-quotes",
          timestamp: new Date().toISOString(),
          environment: {
            hasRequiredVars: missingRequiredVars.length === 0,
            missingVars: missingRequiredVars,
            shippingProviders: {
              courierGuy: !!COURIER_GUY_API_KEY,
              fastway: !!FASTWAY_API_KEY,
              shiplogic: !!SHIPLOGIC_API_KEY,
            },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Test mode handler
    if (requestBody.test === true) {
      const mockQuotes = [
        {
          provider: "courier-guy",
          service: "Standard Delivery",
          price: 85.0,
          currency: "ZAR",
          estimated_days: "2-3",
          tracking_included: true,
        },
        {
          provider: "fastway",
          service: "Express Delivery",
          price: 120.0,
          currency: "ZAR",
          estimated_days: "1-2",
          tracking_included: true,
        },
        {
          provider: "shiplogic",
          service: "Economy",
          price: 65.0,
          currency: "ZAR",
          estimated_days: "3-5",
          tracking_included: false,
        },
      ];

      return new Response(
        JSON.stringify({
          success: true,
          quotes: mockQuotes,
          message: "Delivery quotes retrieved successfully (test mode)",
          test: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { pickup_address, delivery_address, package_details } = requestBody;

    // Validate required fields
    if (!pickup_address || !delivery_address) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: pickup_address, delivery_address",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const quotes = [];

    // Mock quotes for different providers
    if (COURIER_GUY_API_KEY || !COURIER_GUY_API_KEY) {
      // Always include for demo
      quotes.push({
        provider: "courier-guy",
        service: "Standard Delivery",
        price: 85.0,
        currency: "ZAR",
        estimated_days: "2-3",
        tracking_included: true,
        pickup_address: pickup_address,
        delivery_address: delivery_address,
      });
    }

    if (FASTWAY_API_KEY || !FASTWAY_API_KEY) {
      // Always include for demo
      quotes.push({
        provider: "fastway",
        service: "Express Delivery",
        price: 120.0,
        currency: "ZAR",
        estimated_days: "1-2",
        tracking_included: true,
        pickup_address: pickup_address,
        delivery_address: delivery_address,
      });
    }

    if (SHIPLOGIC_API_KEY || !SHIPLOGIC_API_KEY) {
      // Always include for demo
      quotes.push({
        provider: "shiplogic",
        service: "Economy",
        price: 65.0,
        currency: "ZAR",
        estimated_days: "3-5",
        tracking_included: false,
        pickup_address: pickup_address,
        delivery_address: delivery_address,
      });
    }

    // Sort quotes by price
    quotes.sort((a, b) => a.price - b.price);

    // Log the quote request
    try {
      await supabase.from("audit_logs").insert({
        action: "delivery_quotes_requested",
        table_name: "delivery_quotes",
        new_values: {
          pickup_address: pickup_address,
          delivery_address: delivery_address,
          quotes_count: quotes.length,
          requested_at: new Date().toISOString(),
        },
      });
    } catch (logError) {
      console.warn("Failed to log quote request:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        quotes: quotes,
        message: `Found ${quotes.length} delivery options`,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in get-delivery-quotes:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
