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

const FUNCTION_NAME = "fastway-quote";

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
      const apiKey = Deno.env.get("VITE_FASTWAY_API_KEY");

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
        PickupAddress: {
          Street: fromAddress.streetAddress || fromAddress.street || "",
          Suburb: fromAddress.suburb || "",
          City: fromAddress.city || "",
          PostalCode: fromAddress.postalCode || fromAddress.postcode || "",
          Province: fromAddress.province || fromAddress.state || "",
        },
        DestinationAddress: {
          Street: toAddress.streetAddress || toAddress.street || "",
          Suburb: toAddress.suburb || "",
          City: toAddress.city || "",
          PostalCode: toAddress.postalCode || toAddress.postcode || "",
          Province: toAddress.province || toAddress.state || "",
        },
        Parcel: {
          Length: Number(parcel.length) || 20,
          Width: Number(parcel.width) || 15,
          Height: Number(parcel.height) || 5,
          Weight: Number(parcel.weight) || 0.5,
        },
      };

      // Call external API with proper timeout and retry
      const result = await callExternalAPI(
        "https://api.fastway.co.za/v1/quote",
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

      if (result.success && result.data?.quotes) {
        // Transform API response to standard format
        const quotes = result.data.quotes.map((quote: any) => ({
          service: quote.service_name || quote.service || "Unknown Service",
          price: parseFloat(quote.price) || parseFloat(quote.rate) || 0,
          currency: "ZAR",
          estimated_days: quote.delivery_time || quote.estimated_days || "2-3",
          service_code: quote.service_code || "STD",
          provider: "fastway",
        }));

        console.log(
          `[${FUNCTION_NAME}] Successfully retrieved ${quotes.length} quotes from API`,
        );

        return createSuccessResponse({
          quotes,
          provider: "fastway",
          source: "api",
          message: "Fastway quotes retrieved successfully",
        });
      }

      // API failed, return fallback
      console.warn(
        `[${FUNCTION_NAME}] Fastway API failed, using fallback quotes:`,
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
      service: "Local Parcel",
      price: 55.0,
      currency: "ZAR",
      estimated_days: "1-2",
      service_code: "LP",
      provider: "fastway",
      fallback: true,
    },
    {
      service: "Road Freight",
      price: 85.0,
      currency: "ZAR",
      estimated_days: "2-4",
      service_code: "RF",
      provider: "fastway",
      fallback: true,
    },
    {
      service: "Express Delivery",
      price: 120.0,
      currency: "ZAR",
      estimated_days: "1",
      service_code: "EXP",
      provider: "fastway",
      fallback: true,
    },
  ];

  return createFallbackResponse(
    originalError,
    {
      quotes: fallbackQuotes,
      provider: "fastway",
      source: "fallback",
      message: "Fastway quotes retrieved with fallback data",
    },
    "Fastway service is temporarily unavailable. Showing standard rates.",
  );
}
