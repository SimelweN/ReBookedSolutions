import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: "low" | "normal" | "high" | "urgent";
  channels?: ("in_app" | "email" | "push")[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (req.method) {
      case "POST":
        if (path === "send") {
          const payload: NotificationPayload = await req.json();
          return await sendNotification(supabase, payload);
        } else if (path === "broadcast") {
          const payload = await req.json();
          return await broadcastNotification(supabase, payload);
        } else if (path === "mark-read") {
          const { notificationIds, userId } = await req.json();
          return await markNotificationsRead(supabase, notificationIds, userId);
        }
        break;

      case "GET":
        if (path === "notifications") {
          const userId = url.searchParams.get("user_id");
          const limit = parseInt(url.searchParams.get("limit") || "50");
          const offset = parseInt(url.searchParams.get("offset") || "0");
          return await getUserNotifications(supabase, userId!, limit, offset);
        } else if (path === "unread-count") {
          const userId = url.searchParams.get("user_id");
          return await getUnreadCount(supabase, userId!);
        }
        break;

      case "DELETE":
        if (path === "notifications") {
          const { notificationIds, userId } = await req.json();
          return await deleteNotifications(supabase, notificationIds, userId);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendNotification(supabase: any, payload: NotificationPayload) {
  const {
    user_id,
    type,
    title,
    message,
    data = {},
    priority = "normal",
    channels = ["in_app"],
  } = payload;

  // Create in-app notification
  if (channels.includes("in_app")) {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        priority,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger real-time event
    await supabase.channel("notifications").send({
      type: "broadcast",
      event: "new_notification",
      payload: {
        ...notification,
        user_id,
      },
    });
  }

  // Send email notification
  if (channels.includes("email")) {
    await sendEmailNotification(supabase, user_id, title, message, data);
  }

  // Send push notification (if implemented)
  if (channels.includes("push")) {
    await sendPushNotification(supabase, user_id, title, message, data);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function broadcastNotification(supabase: any, payload: any) {
  const {
    target_audience = "all",
    type,
    title,
    message,
    data = {},
    priority = "normal",
  } = payload;

  let userQuery = supabase.from("profiles").select("id");

  if (target_audience === "admin") {
    userQuery = userQuery.eq("is_admin", true);
  } else if (target_audience === "users") {
    userQuery = userQuery.eq("is_admin", false);
  }

  const { data: users, error: userError } = await userQuery;

  if (userError) throw userError;

  // Create broadcast record
  const { data: broadcast, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      type,
      title,
      message,
      target_audience,
      priority,
      active: true,
    })
    .select()
    .single();

  if (broadcastError) throw broadcastError;

  // Create individual notifications for each user
  const notifications = users.map((user: any) => ({
    user_id: user.id,
    type: `broadcast_${type}`,
    title,
    message,
    data: { ...data, broadcast_id: broadcast.id },
    priority,
    read: false,
  }));

  const { error: notifError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (notifError) throw notifError;

  // Trigger real-time broadcast
  await supabase.channel("notifications").send({
    type: "broadcast",
    event: "broadcast_notification",
    payload: broadcast,
  });

  return new Response(
    JSON.stringify({ success: true, broadcast_id: broadcast.id }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function getUserNotifications(
  supabase: any,
  userId: string,
  limit: number,
  offset: number,
) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUnreadCount(supabase: any, userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;

  return new Response(JSON.stringify({ count }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function markNotificationsRead(
  supabase: any,
  notificationIds: string[],
  userId: string,
) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .in("id", notificationIds)
    .eq("user_id", userId)
    .select();

  if (error) throw error;

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteNotifications(
  supabase: any,
  notificationIds: string[],
  userId: string,
) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .in("id", notificationIds)
    .eq("user_id", userId);

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendEmailNotification(
  supabase: any,
  userId: string,
  title: string,
  message: string,
  data: any,
) {
  // Get user email preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, email_preferences")
    .eq("id", userId)
    .single();

  if (!profile?.email || !profile?.email_preferences?.notifications) {
    return; // User has disabled email notifications
  }

  // Queue email for sending
  await supabase.from("email_queue").insert({
    to_email: profile.email,
    subject: title,
    html_content: generateEmailTemplate(title, message, data),
    scheduled_for: new Date().toISOString(),
    status: "pending",
  });
}

async function sendPushNotification(
  supabase: any,
  userId: string,
  title: string,
  message: string,
  data: any,
) {
  // Implementation for push notifications
  // This would integrate with services like Firebase Cloud Messaging
  console.log("Push notification would be sent here:", {
    userId,
    title,
    message,
  });
}

function generateEmailTemplate(
  title: string,
  message: string,
  data: any,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #44ab83; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
      </div>
      
      <div style="text-align: center; padding: 20px;">
        <a href="${Deno.env.get("SITE_URL") || "https://rebooked.co.za"}" 
           style="background: #44ab83; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View on ReBooked
        </a>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>You received this because you have notifications enabled.</p>
        <p><a href="${Deno.env.get("SITE_URL")}/profile" style="color: #44ab83;">Manage notification preferences</a></p>
      </div>
    </body>
    </html>
  `;
}
