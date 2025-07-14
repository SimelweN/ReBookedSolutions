import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
  withRetry,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["GET", "POST", "OPTIONS"];

interface Address {
  street?: string;
  city: string;
  province: string;
  postal_code?: string;
  country?: string;
}

interface PackageDetails {
  weight?: number; // kg
  dimensions?: {
    length?: number; // cm
    width?: number;
    height?: number;
  };
  value?: number; // ZAR
  fragile?: boolean;
}

interface DeliveryQuote {
  provider: string;
  service: string;
  price: number;
  currency: string;
  estimated_days: string;
  tracking_included: boolean;
  insurance_included?: boolean;
  max_value?: number;
  restrictions?: string[];
  provider_id?: string;
}

const calculateDistance = (pickup: Address, delivery: Address): number => {
  // Simplified distance calculation based on province
  const provinceDist: Record<string, number> = {
    "Western Cape-Western Cape": 50,
    "Gauteng-Gauteng": 40,
    "KwaZulu-Natal-KwaZulu-Natal": 60,
    "Western Cape-Gauteng": 1400,
    "Western Cape-KwaZulu-Natal": 1600,
    "Gauteng-KwaZulu-Natal": 600,
  };

  const key = `${pickup.province}-${delivery.province}`;
  const reverseKey = `${delivery.province}-${pickup.province}`;

  return provinceDist[key] || provinceDist[reverseKey] || 800; // Default 800km
};

const calculatePricing = (
  distance: number,
  weight: number = 1,
): { standard: number; express: number; economy: number } => {
  const basePrice = 45;
  const distanceRate = Math.max(0.08, Math.min(0.25, (distance / 1000) * 0.08)); // R0.08-0.25 per km
  const weightRate = Math.max(1, weight * 15); // R15 per kg minimum

  const standard =
    Math.round((basePrice + distance * distanceRate + weightRate) * 100) / 100;
  const express = Math.round(standard * 1.4 * 100) / 100; // 40% premium
  const economy = Math.round(standard * 0.75 * 100) / 100; // 25% discount

  return { standard, express, economy };
};

const generateQuotes = (
  pickup: Address,
  delivery: Address,
  packageDetails?: PackageDetails,
): DeliveryQuote[] => {
  const distance = calculateDistance(pickup, delivery);
  const weight = packageDetails?.weight || 1;
  const pricing = calculatePricing(distance, weight);

  const isLocal = pickup.province === delivery.province;
  const estimatedDays = {
    express: isLocal ? "1-2" : "2-3",
    standard: isLocal ? "2-3" : "3-5",
    economy: isLocal ? "3-5" : "5-7",
  };

  const quotes: DeliveryQuote[] = [];

  // CourierGuy quotes
  if (Deno.env.get("COURIER_GUY_API_KEY") || true) {
    // Always include for now
    quotes.push({
      provider: "courier-guy",
      service: "Standard Delivery",
      price: pricing.standard,
      currency: "ZAR",
      estimated_days: estimatedDays.standard,
      tracking_included: true,
      insurance_included: true,
      max_value: 5000,
      provider_id: "cg_std",
    });

    if (distance <= 500) {
      // Express only for shorter distances
      quotes.push({
        provider: "courier-guy",
        service: "Express Delivery",
        price: pricing.express,
        currency: "ZAR",
        estimated_days: estimatedDays.express,
        tracking_included: true,
        insurance_included: true,
        max_value: 5000,
        provider_id: "cg_exp",
      });
    }
  }

  // Fastway quotes
  if (Deno.env.get("FASTWAY_API_KEY") || true) {
    // Always include for now
    quotes.push({
      provider: "fastway",
      service: "Parcel Connect",
      price: Math.round(pricing.standard * 1.1 * 100) / 100, // Slightly higher
      currency: "ZAR",
      estimated_days: estimatedDays.standard,
      tracking_included: true,
      insurance_included: false,
      max_value: 3000,
      provider_id: "fw_std",
    });

    if (isLocal) {
      quotes.push({
        provider: "fastway",
        service: "Local Delivery",
        price: Math.round(pricing.economy * 1.2 * 100) / 100,
        currency: "ZAR",
        estimated_days: estimatedDays.economy,
        tracking_included: true,
        insurance_included: false,
        max_value: 2000,
        provider_id: "fw_local",
      });
    }
  }

  // PostNet quotes
  quotes.push({
    provider: "postnet",
    service: "PostNet Economy",
    price: pricing.economy,
    currency: "ZAR",
    estimated_days: estimatedDays.economy,
    tracking_included: false,
    insurance_included: false,
    max_value: 1000,
    restrictions: ["No fragile items", "Max 5kg"],
    provider_id: "pn_eco",
  });

  // Local courier for same city
  if (pickup.city.toLowerCase() === delivery.city.toLowerCase()) {
    quotes.push({
      provider: "local-courier",
      service: "Same Day Delivery",
      price: Math.round(Math.max(pricing.economy, 60) * 100) / 100, // Minimum R60
      currency: "ZAR",
      estimated_days: "0-1",
      tracking_included: true,
      insurance_included: false,
      max_value: 2000,
      restrictions: ["Same city only"],
      provider_id: "local_same",
    });
  }

  // Sort by price
  return quotes.sort((a, b) => a.price - b.price);
};

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Health check for GET requests
  if (req.method === "GET") {
    const apiKeys = {
      courierGuy: !!Deno.env.get("COURIER_GUY_API_KEY"),
      fastway: !!Deno.env.get("FASTWAY_API_KEY"),
      shiplogic: !!Deno.env.get("SHIPLOGIC_API_KEY"),
    };

    return successResponse({
      service: "get-delivery-quotes",
      timestamp: new Date().toISOString(),
      status: "healthy",
      apiIntegrations: apiKeys,
      fallbackMode: !Object.values(apiKeys).some(Boolean),
      supportedProviders: [
        "courier-guy",
        "fastway",
        "postnet",
        "local-courier",
      ],
      coverage: ["South Africa nationwide"],
    });
  }

  // Parse request body
  const { data: requestBody, error: parseError } = await safeJsonParse(req);
  if (parseError) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON", {
      error: parseError,
    });
  }

  // Handle test requests
  if (requestBody.test === true || requestBody.action === "test") {
    const mockQuotes: DeliveryQuote[] = [
      {
        provider: "courier-guy",
        service: "Standard Delivery",
        price: 85.0,
        currency: "ZAR",
        estimated_days: "2-3",
        tracking_included: true,
        insurance_included: true,
        provider_id: "test_cg",
      },
      {
        provider: "fastway",
        service: "Express Delivery",
        price: 120.0,
        currency: "ZAR",
        estimated_days: "1-2",
        tracking_included: true,
        provider_id: "test_fw",
      },
      {
        provider: "postnet",
        service: "Economy",
        price: 65.0,
        currency: "ZAR",
        estimated_days: "3-5",
        tracking_included: false,
        provider_id: "test_pn",
      },
    ];

    return successResponse({
      quotes: mockQuotes,
      test: true,
      message: "Test quotes generated successfully",
    });
  }

  const { pickup_address, delivery_address, package_details } = requestBody;

  // Validate required fields
  if (!pickup_address || !delivery_address) {
    return errorResponse(
      "Missing required fields: pickup_address and delivery_address are required",
      400,
      "REQUIRED_FIELDS_MISSING",
      { required: ["pickup_address", "delivery_address"] },
    );
  }

  // Validate address format
  if (
    !pickup_address.city ||
    !pickup_address.province ||
    !delivery_address.city ||
    !delivery_address.province
  ) {
    return errorResponse(
      "Address must include city and province",
      400,
      "INVALID_ADDRESS_FORMAT",
      {
        pickup_address: {
          hasCity: !!pickup_address.city,
          hasProvince: !!pickup_address.province,
        },
        delivery_address: {
          hasCity: !!delivery_address.city,
          hasProvince: !!delivery_address.province,
        },
      },
    );
  }

  try {
    // Generate quotes based on addresses and package details
    const quotes = generateQuotes(
      pickup_address,
      delivery_address,
      package_details,
    );

    if (quotes.length === 0) {
      return errorResponse(
        "No delivery options available for this route",
        404,
        "NO_QUOTES_AVAILABLE",
        { pickup_address, delivery_address },
      );
    }

    // Log the quote request (non-blocking)
    supabase
      .from("audit_logs")
      .insert({
        action: "delivery_quotes_requested",
        table_name: "delivery_quotes",
        new_values: {
          pickup_city: pickup_address.city,
          pickup_province: pickup_address.province,
          delivery_city: delivery_address.city,
          delivery_province: delivery_address.province,
          quotes_count: quotes.length,
          package_weight: package_details?.weight,
          requested_at: new Date().toISOString(),
        },
      })
      .catch((error) =>
        console.warn("Failed to log quote request:", error.message),
      );

    return successResponse(
      {
        quotes,
        route: {
          from: `${pickup_address.city}, ${pickup_address.province}`,
          to: `${delivery_address.city}, ${delivery_address.province}`,
          distance_estimate: `${calculateDistance(pickup_address, delivery_address)}km`,
        },
        package_details: package_details || {
          weight: 1,
          note: "Default package weight assumed",
        },
        pricing_note:
          "Prices are estimates and may vary based on actual package details and current rates",
      },
      `Found ${quotes.length} delivery options`,
    );
  } catch (error) {
    console.error("Error generating delivery quotes:", error);
    return errorResponse(
      "Failed to generate delivery quotes",
      500,
      "QUOTE_GENERATION_ERROR",
      { error: error.message },
    );
  }
};

serve(wrapFunction(handler, requiredEnvVars, allowedMethods));
