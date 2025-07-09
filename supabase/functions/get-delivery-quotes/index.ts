import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  validateRequired,
  callExternalAPI,
  createFallbackResponse,
  sanitizeInput,
  createAuditLog,
} from "../_shared/utilities.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

const FUNCTION_NAME = "get-delivery-quotes";

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
    let { fromAddress, toAddress, parcel } = sanitizedBody;

    // Provide graceful defaults for testing/fallback
    if (!fromAddress || !toAddress || !parcel) {
      console.log(
        `[${FUNCTION_NAME}] Using fallback data for missing parameters`,
      );

      fromAddress = fromAddress || {
        streetAddress: "123 Test Street",
        city: "Cape Town",
        postalCode: "8001",
        province: "Western Cape",
      };

      toAddress = toAddress || {
        streetAddress: "456 Example Road",
        city: "Johannesburg",
        postalCode: "2000",
        province: "Gauteng",
      };

      parcel = parcel || {
        weight: 1,
        length: 20,
        width: 15,
        height: 5,
      };
    }

    try {
      // Attempt to get real quotes from external services
      const externalQuotes = await getExternalQuotes(
        fromAddress,
        toAddress,
        parcel,
      );

      if (externalQuotes.success && externalQuotes.data?.length > 0) {
        const deliveryQuotes = {
          from: fromAddress,
          to: toAddress,
          parcel: parcel,
          quotes: externalQuotes.data,
          quote_count: externalQuotes.data.length,
          generated_at: new Date().toISOString(),
          source: "external_apis",
        };

        // Log successful quote generation
        await createAuditLog(
          supabase,
          "delivery_quotes_requested",
          "delivery_quotes",
          crypto.randomUUID(),
          undefined,
          { fromAddress, toAddress, parcel },
          deliveryQuotes,
          FUNCTION_NAME,
        );

        console.log(
          `[${FUNCTION_NAME}] Successfully generated external quotes:`,
          deliveryQuotes,
        );
        return createSuccessResponse({
          message: "Delivery quotes retrieved successfully",
          data: deliveryQuotes,
        });
      }

      // Fallback to local quotes if external services fail
      console.warn(
        `[${FUNCTION_NAME}] External services failed, using fallback quotes`,
      );
      return createFallbackQuotes(
        fromAddress,
        toAddress,
        parcel,
        externalQuotes.error,
      );
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Error generating quotes:`, error);
      return createFallbackQuotes(fromAddress, toAddress, parcel, error);
    }
  }),
);

// External API integration with resilience
async function getExternalQuotes(
  fromAddress: any,
  toAddress: any,
  parcel: any,
): Promise<{ success: boolean; data?: any[]; error?: any }> {
  const quotes: any[] = [];

  // Courier Guy API call
  try {
    const courierGuyResult = await callExternalAPI(
      "https://api.courierguy.co.za/v1/quotes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("VITE_COURIER_GUY_API_KEY")}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddress,
          parcel: parcel,
        }),
      },
      8000, // 8 second timeout
      2, // 2 retries
    );

    if (courierGuyResult.success && courierGuyResult.data?.quotes) {
      quotes.push(
        ...courierGuyResult.data.quotes.map((q: any) => ({
          ...q,
          provider: "Courier Guy",
          tracking_included: true,
        })),
      );
    }
  } catch (error) {
    console.warn("Courier Guy API failed:", error.message);
  }

  // Fastway API call
  try {
    const fastwayResult = await callExternalAPI(
      "https://api.fastway.co.za/v1/quotes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("VITE_FASTWAY_API_KEY")}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddress,
          parcel: parcel,
        }),
      },
      8000, // 8 second timeout
      2, // 2 retries
    );

    if (fastwayResult.success && fastwayResult.data?.quotes) {
      quotes.push(
        ...fastwayResult.data.quotes.map((q: any) => ({
          ...q,
          provider: "Fastway",
          tracking_included: true,
        })),
      );
    }
  } catch (error) {
    console.warn("Fastway API failed:", error.message);
  }

  // Return quotes if we have any, otherwise fallback
  if (quotes.length > 0) {
    return { success: true, data: quotes };
  }

  return { success: false, error: "All external quote services unavailable" };
}

// Fallback quotes with graceful degradation
function createFallbackQuotes(
  fromAddress: any,
  toAddress: any,
  parcel: any,
  originalError: any,
): Response {
  const fallbackQuotes = [
    {
      provider: "Self Collection",
      service: "Collect from Seller",
      price: 0,
      currency: "ZAR",
      estimated_days: "0",
      service_code: "SELF",
      tracking_included: false,
      fallback: true,
    },
    {
      provider: "Standard Delivery",
      service: "Local Courier",
      price: 75.0,
      currency: "ZAR",
      estimated_days: "2-3",
      service_code: "STD",
      tracking_included: true,
      fallback: true,
    },
    {
      provider: "Express Delivery",
      service: "Priority Courier",
      price: 120.0,
      currency: "ZAR",
      estimated_days: "1-2",
      service_code: "EXP",
      tracking_included: true,
      fallback: true,
    },
  ];

  const deliveryQuotes = {
    from: fromAddress,
    to: toAddress,
    parcel: parcel,
    quotes: fallbackQuotes,
    quote_count: fallbackQuotes.length,
    generated_at: new Date().toISOString(),
    source: "fallback",
  };

  return createFallbackResponse(
    originalError,
    {
      message: "Delivery quotes retrieved with fallback data",
      data: deliveryQuotes,
    },
    "External delivery services are temporarily unavailable. Showing standard rates.",
  );
}
