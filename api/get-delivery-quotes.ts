import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitConfigs } from "./utils/rate-limiter";

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
  if (
    process.env.COURIER_GUY_API_KEY ||
    !process.env.NODE_ENV ||
    process.env.NODE_ENV === "development"
  ) {
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
  if (
    process.env.FASTWAY_API_KEY ||
    !process.env.NODE_ENV ||
    process.env.NODE_ENV === "development"
  ) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply rate limiting
  const rateLimiter = rateLimit(rateLimitConfigs.general);
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
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check for GET requests
  if (req.method === "GET") {
    const apiKeys = {
      courierGuy: !!process.env.COURIER_GUY_API_KEY,
      fastway: !!process.env.FASTWAY_API_KEY,
      shiplogic: !!process.env.SHIPLOGIC_API_KEY,
    };

    return res.status(200).json({
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

    const { pickup_address, delivery_address, package_details, test } =
      req.body;

    // Handle test requests
    if (test === true) {
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

      return res.status(200).json({
        success: true,
        quotes: mockQuotes,
        test: true,
        message: "Test quotes generated successfully",
      });
    }

    // Validate required fields
    if (!pickup_address || !delivery_address) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: pickup_address and delivery_address are required",
      });
    }

    // Validate address format
    if (
      !pickup_address.city ||
      !pickup_address.province ||
      !delivery_address.city ||
      !delivery_address.province
    ) {
      return res.status(400).json({
        success: false,
        error: "Address must include city and province",
      });
    }

    // Generate quotes based on addresses and package details
    const quotes = generateQuotes(
      pickup_address,
      delivery_address,
      package_details,
    );

    if (quotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No delivery options available for this route",
      });
    }

    // Log the quote request (non-blocking)
    try {
      await supabase.from("audit_logs").insert({
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
      });
    } catch (error: any) {
      console.warn("Failed to log quote request:", error.message);
    }

    return res.status(200).json({
      success: true,
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
      message: `Found ${quotes.length} delivery options`,
    });
  } catch (error: unknown) {
    console.error("Error generating delivery quotes:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate delivery quotes",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
