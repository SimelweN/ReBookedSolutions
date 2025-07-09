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

    // Only call req.json() ONCE (handle both POST and GET)
    let body = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    console.log("Received body:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Study resources API function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mock study resources data
    const mockResources = [
      {
        id: "1",
        title: "Advanced Mathematics Textbook",
        subject: "mathematics",
        type: "textbook",
        difficulty: "advanced",
        description: "Comprehensive mathematics textbook",
        rating: 4.5,
        price: 450.0,
        author: "Dr. Smith",
        university: "UCT",
      },
      {
        id: "2",
        title: "Physics Study Guide",
        subject: "physics",
        type: "study_guide",
        difficulty: "intermediate",
        description: "Physics study guide covering mechanics",
        rating: 4.2,
        price: 320.0,
        author: "Prof. Johnson",
        university: "Wits",
      },
      {
        id: "3",
        title: "Chemistry Lab Manual",
        subject: "chemistry",
        type: "lab_manual",
        difficulty: "beginner",
        description: "Laboratory manual for chemistry",
        rating: 4.0,
        price: 280.0,
        author: "Dr. Williams",
        university: "Stellenbosch",
      },
    ];

    const {
      action,
      query = "",
      category,
      university,
      limit = 20,
      offset = 0,
      id,
    } = body;

    switch (action) {
      case "search":
        const filteredResources = query
          ? mockResources.filter(
              (r) =>
                r.title.toLowerCase().includes(query.toLowerCase()) ||
                r.subject.toLowerCase().includes(query.toLowerCase()) ||
                r.description.toLowerCase().includes(query.toLowerCase()),
            )
          : mockResources;

        return new Response(
          JSON.stringify({
            success: true,
            data: filteredResources,
            count: filteredResources.length,
            total: mockResources.length,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );

      case "get":
        const resource = mockResources.find((r) => r.id === id);
        if (!resource) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Resource not found",
            }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: resource,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );

      default:
        // Default: return all resources
        return new Response(
          JSON.stringify({
            success: true,
            data: mockResources,
            count: mockResources.length,
            message: "Study resources retrieved successfully",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }
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
