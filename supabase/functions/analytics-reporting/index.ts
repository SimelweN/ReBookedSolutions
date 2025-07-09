import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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
    let body;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }

    console.log("Received body:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Analytics reporting function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get analytics data - simulated for now
    const analyticsData = {
      totalUsers: 1247,
      totalBooks: 15632,
      totalOrders: 3451,
      totalRevenue: 156789.5,
      topCategories: [
        { name: "Fiction", count: 4200 },
        { name: "Science", count: 3800 },
        { name: "Technology", count: 3200 },
        { name: "History", count: 2800 },
        { name: "Arts", count: 1600 },
      ],
      recentActivity: [
        {
          type: "order",
          description: "New order #12345",
          timestamp: new Date().toISOString(),
        },
        {
          type: "user",
          description: "New user registration",
          timestamp: new Date().toISOString(),
        },
        {
          type: "book",
          description: "Book listing approved",
          timestamp: new Date().toISOString(),
        },
      ],
      growthMetrics: {
        userGrowth: 12.5,
        bookGrowth: 8.3,
        orderGrowth: 15.7,
        revenueGrowth: 23.1,
      },
      generatedAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: analyticsData,
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
