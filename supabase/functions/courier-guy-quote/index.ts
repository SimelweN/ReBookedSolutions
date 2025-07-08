import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

const COURIER_GUY_API_URL = "https://api.courierguy.co.za";

// Validate required environment variables (API key is optional)
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = validateRequiredEnvVars(requiredVars);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!COURIER_GUY_API_KEY) {
      console.warn("COURIER_GUY_API_KEY not configured");
      // Return mock data for development
      return new Response(
        JSON.stringify({
          success: true,
          quotes: [
            {
              service_type: "Standard",
              price: 85,
              estimated_days: "3-5",
              description: "Standard delivery service",
              service_code: "STD",
            },
            {
              service_type: "Express",
              price: 120,
              estimated_days: "1-2",
              description: "Express delivery service",
              service_code: "EXP",
            },
          ],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { pickup_address, delivery_address, parcel_details } =
      await req.json();

    // Validate required fields
    if (!pickup_address || !delivery_address || !parcel_details) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Missing required fields: pickup_address, delivery_address, parcel_details",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare Courier Guy API request
    const courierGuyPayload = {
      collection: {
        city: pickup_address.city,
        province: pickup_address.province,
        postal_code: pickup_address.postal_code,
      },
      delivery: {
        city: delivery_address.city,
        province: delivery_address.province,
        postal_code: delivery_address.postal_code,
      },
      parcels: [
        {
          submitted_length_cm: parcel_details.length || 25,
          submitted_width_cm: parcel_details.width || 20,
          submitted_height_cm: parcel_details.height || 5,
          submitted_weight_kg: parcel_details.weight || 0.5,
        },
      ],
      declared_value: 100, // Default value for books
    };

    console.log("Requesting Courier Guy quote:", courierGuyPayload);

    const response = await fetch(`${COURIER_GUY_API_URL}/v1/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COURIER_GUY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courierGuyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Courier Guy API error:", data);
      return new Response(
        JSON.stringify({
          success: false,
          message: data.message || "Failed to get courier quote",
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Process Courier Guy response
    const quotes = [];

    if (data.rates && Array.isArray(data.rates)) {
      data.rates.forEach((rate: any) => {
        quotes.push({
          service_type: rate.service_type || "Standard",
          price: parseFloat(rate.rate_incl_vat) || 0,
          estimated_days: rate.estimated_delivery_days || "3-5",
          description: rate.service_description || "Courier Guy delivery",
          service_code: rate.service_code || "STD",
        });
      });
    }

    // If no quotes returned, provide fallback
    if (quotes.length === 0) {
      quotes.push({
        service_type: "Standard",
        price: 89,
        estimated_days: "3-5",
        description: "Standard Courier Guy delivery",
        service_code: "STD",
      });
    }

    console.log("Courier Guy quotes processed:", quotes);

    return new Response(
      JSON.stringify({
        success: true,
        quotes,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in courier-guy-quote function:", error);

    // Return fallback quote on error
    return new Response(
      JSON.stringify({
        success: true,
        quotes: [
          {
            service_type: "Standard",
            price: 89,
            estimated_days: "3-5",
            description: "Standard delivery (estimated)",
            service_code: "STD",
          },
        ],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
