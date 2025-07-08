import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface NotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: ("in_app" | "email" | "push")[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    switch (action) {
      case "send":
        return await handleSendNotification(req);
      case "get":
        return await handleGetNotifications(req);
      case "mark-read":
        return await handleMarkAsRead(req);
      case "get-unread-count":
        return await handleGetUnreadCount(req);
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 404,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Error in realtime-notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function handleSendNotification(req: Request) {
  const notificationData: NotificationRequest = await req.json();
  const {
    userId,
    type,
    title,
    message,
    data,
    channels = ["in_app"],
  } = notificationData;

  // Create in-app notification
  if (channels.includes("in_app")) {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        read: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("In-app notification created:", notification.id);
  }

  // Send email notification
  if (channels.includes("email")) {
    try {
      const { data: user } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      if (user?.email) {
        await supabase.functions.invoke("email-automation", {
          body: {
            to: user.email,
            subject: title,
            template: "notification",
            data: {
              name: user.full_name,
              message: message,
            },
          },
        });
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }
  }

  // Log the notification
  await supabase.from("audit_logs").insert({
    action: "notification_sent",
    table_name: "notifications",
    user_id: userId,
    new_values: {
      type,
      title,
      channels,
      success: true,
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Notification sent successfully",
    }),
    { headers: corsHeaders },
  );
}

async function handleGetNotifications(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      notifications,
    }),
    { headers: corsHeaders },
  );
}

async function handleMarkAsRead(req: Request) {
  const { notificationId, userId } = await req.json();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Notification marked as read",
    }),
    { headers: corsHeaders },
  );
}

async function handleGetUnreadCount(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      unreadCount: count || 0,
    }),
    { headers: corsHeaders },
  );
}
