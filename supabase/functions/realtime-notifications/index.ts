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

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop() || "send";

    // Handle different actions based on URL or body
    let body = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    console.log("Action:", action, "Body:", body);

    // Handle health check
    if (action === "health" || body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Realtime notifications function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    switch (action) {
      case "send":
        return await handleSendNotification(body, supabase);

      case "get":
        return await handleGetNotifications(url, supabase);

      case "mark-read":
        return await handleMarkAsRead(body, supabase);

      case "get-unread-count":
        return await handleGetUnreadCount(url, supabase);

      default:
        return new Response(
          JSON.stringify({
            success: true,
            message: "Notification service ready",
            action: action,
            availableEndpoints: [
              "send",
              "get",
              "mark-read",
              "get-unread-count",
            ],
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

async function handleSendNotification(body: any, supabase: any) {
  try {
    const { userId, type, title, message, data, channels = ["in_app"] } = body;

    if (!userId || !title || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: userId, title, message",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate creating notification (replace with real DB insert)
    const notification = {
      id: crypto.randomUUID(),
      user_id: userId,
      type: type || "general",
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
    };

    console.log("Created notification:", notification);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
        notification: notification,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send notification",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleGetNotifications(url: URL, supabase: any) {
  try {
    const userId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User ID is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mock notifications data
    const mockNotifications = [
      {
        id: "1",
        user_id: userId,
        type: "order",
        title: "Order Confirmed",
        message: "Your order has been confirmed by the seller",
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: userId,
        type: "general",
        title: "Welcome!",
        message: "Welcome to Rebooked Solutions",
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const paginatedNotifications = mockNotifications.slice(
      offset,
      offset + limit,
    );

    return new Response(
      JSON.stringify({
        success: true,
        notifications: paginatedNotifications,
        total: mockNotifications.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to get notifications",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleMarkAsRead(body: any, supabase: any) {
  try {
    const { notificationId, userId } = body;

    if (!notificationId || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: notificationId, userId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate marking as read
    console.log(
      `Marking notification ${notificationId} as read for user ${userId}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification marked as read",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to mark as read",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleGetUnreadCount(url: URL, supabase: any) {
  try {
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User ID is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mock unread count
    const unreadCount = Math.floor(Math.random() * 5);

    return new Response(
      JSON.stringify({
        success: true,
        unreadCount: unreadCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to get unread count",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
