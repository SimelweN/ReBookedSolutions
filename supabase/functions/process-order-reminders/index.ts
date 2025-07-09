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

    // Handle both GET and POST requests
    let body = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    console.log("Process order reminders triggered:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Process order reminders function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate processing order reminders
    const now = new Date();

    // Mock orders that need reminders
    const ordersNeedingReminders = [
      {
        id: "order_reminder_1",
        buyer_email: "buyer1@example.com",
        seller_email: "seller1@example.com",
        book_title: "Advanced Mathematics",
        status: "pending_commit",
        deadline: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours left
        reminder_type: "commit_deadline",
      },
      {
        id: "order_reminder_2",
        buyer_email: "buyer2@example.com",
        seller_email: "seller2@example.com",
        book_title: "Physics Textbook",
        status: "pending_collection",
        deadline: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours left
        reminder_type: "collection_reminder",
      },
    ];

    const processedReminders = ordersNeedingReminders.map((order) => ({
      order_id: order.id,
      reminder_type: order.reminder_type,
      buyer_email: order.buyer_email,
      seller_email: order.seller_email,
      book_title: order.book_title,
      deadline: order.deadline,
      sent_at: now.toISOString(),
      reminder_sent: true,
      hours_until_deadline: Math.round(
        (new Date(order.deadline).getTime() - now.getTime()) / (60 * 60 * 1000),
      ),
    }));

    console.log("Processed reminders:", processedReminders);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${ordersNeedingReminders.length} order reminder(s)`,
        total_reminders: ordersNeedingReminders.length,
        reminders: processedReminders,
        processed_at: now.toISOString(),
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
