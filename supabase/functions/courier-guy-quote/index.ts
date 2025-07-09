import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  validateRequired,
  callExternalAPI,
  sanitizeInput,
  createFallbackResponse,
} from "../_shared/utilities.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

const FUNCTION_NAME = "courier-guy-quote";

serve(
  createRobustFunction(FUNCTION_NAME, async (req, supabase) => {
    const body = await req.json();
    console.log(`[${FUNCTION_NAME}] Received request:`, {
      ...body,
      timestamp: new Date().toISOString(),
    });

    // Handle health check
    if (body.action === "health") {
      return createHealthResponse(FUNCTION_NAME);
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(body);

    // Validate required fields
    const requiredFields = ["fromAddress", "toAddress", "parcel"];
    const validation = validateRequired(sanitizedBody, requiredFields);

    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing.join(", ")}`,
        400,
        { missingFields: validation.missing },
        FUNCTION_NAME,
      );
    }

    const { fromAddress, toAddress, parcel } = sanitizedBody;

    try {
      // Get API key - use environment variable
      const apiKey = Deno.env.get("VITE_COURIER_GUY_API_KEY");

      if (!apiKey) {
        console.log(
          `[${FUNCTION_NAME}] Using fallback quotes - API key not configured`,
        );
        return createFallbackQuotes(
          fromAddress,
          toAddress,
          parcel,
          "API key not configured",
        );
      }

      // Prepare quote data with proper format
      const quoteData = {
        collection_address: {
          street_address: fromAddress.streetAddress || fromAddress.street || "",
          suburb: fromAddress.suburb || "",
          city: fromAddress.city || "",
          postal_code: fromAddress.postalCode || fromAddress.postcode || "",
          province: fromAddress.province || fromAddress.state || "",
        },
        delivery_address: {
          street_address: toAddress.streetAddress || toAddress.street || "",
          suburb: toAddress.suburb || "",
          city: toAddress.city || "",
          postal_code: toAddress.postalCode || toAddress.postcode || "",
          province: toAddress.province || toAddress.state || "",
        },
        parcel: {
          submitted_length_cm: Number(parcel.length) || 20,
          submitted_width_cm: Number(parcel.width) || 15,
          submitted_height_cm: Number(parcel.height) || 5,
          submitted_weight_kg: Number(parcel.weight) || 0.5,
        },
      };

      // Call external API with proper timeout and retry
      const result = await callExternalAPI(
        "https://api.courierguy.co.za/v1/rates",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quoteData),
        },
        8000, // 8 second timeout
        2, // 2 retries
      );

      if (result.success && result.data?.rates) {
        // Transform API response to standard format
        const quotes = result.data.rates.map((rate: any) => ({
          service: rate.service_name || rate.service || "Unknown Service",
          price: parseFloat(rate.rate) || parseFloat(rate.price) || 0,
          currency: "ZAR",
          estimated_days: rate.delivery_time || rate.estimated_days || "2-3",
          service_code: rate.service_code || "STD",
          provider: "courier-guy",
        }));

        console.log(
          `[${FUNCTION_NAME}] Successfully retrieved ${quotes.length} quotes from API`,
        );

        return createSuccessResponse({
          quotes,
          provider: "courier-guy",
          source: "api",
          message: "Courier Guy quotes retrieved successfully",
        });
      }

      // API failed, return fallback
      console.warn(
        `[${FUNCTION_NAME}] Courier Guy API failed, using fallback quotes:`,
        result.error,
      );
      return createFallbackQuotes(fromAddress, toAddress, parcel, result.error);
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Unexpected error:`, error);
      return createFallbackQuotes(fromAddress, toAddress, parcel, error);
    }
  }),
);

// Fallback quotes function with guaranteed success response
function createFallbackQuotes(
  fromAddress: any,
  toAddress: any,
  parcel: any,
  originalError: any,
): Response {
  const fallbackQuotes = [
    {
      service: "Standard Overnight",
      price: 89.0,
      currency: "ZAR",
      estimated_days: "1-2",
      service_code: "ON",
      provider: "courier-guy",
      fallback: true,
    },
    {
      service: "Economy Service",
      price: 65.0,
      currency: "ZAR",
      estimated_days: "2-3",
      service_code: "EC",
      provider: "courier-guy",
      fallback: true,
    },
    {
      service: "Express Same Day",
      price: 150.0,
      currency: "ZAR",
      estimated_days: "0-1",
      service_code: "SD",
      provider: "courier-guy",
      fallback: true,
    },
  ];

  return createFallbackResponse(
    originalError,
    {
      quotes: fallbackQuotes,
      provider: "courier-guy",
      source: "fallback",
      message: "Courier Guy quotes retrieved with fallback data",
    },
    "Courier Guy service is temporarily unavailable. Showing standard rates.",
  );
}
