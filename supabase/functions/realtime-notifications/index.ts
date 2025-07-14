import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop() || 'send';
    console.log("Action:", action);

    // Handle different actions
    switch (action) {
      case 'send':
        return await handleSendNotification(req, supabase);
      case 'get':
        return await handleGetNotifications(req, supabase);
      case 'mark-read':
        return await handleMarkAsRead(req, supabase);
      case 'get-unread-count':
        return await handleGetUnreadCount(req, supabase);
      default:
        return new Response(JSON.stringify({
          success: true,
          message: 'Notification service ready',
          action: action
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error("Edge Function Error:", error);

    return new Response(JSON.stringify({
      success: false,
      error: "Function crashed",
      details: error.message || "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleSendNotification(req: Request, supabase: any) {
  try {
    const body = await req.json();
    const { userId, type, title, message, data, channels = ['in_app'] } = body;

    // Create in-app notification
    if (channels.includes('in_app')) {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          read: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Notification sent successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to send notification"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetNotifications(req: Request, supabase: any) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      notifications
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to get notifications"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleMarkAsRead(req: Request, supabase: any) {
  try {
    const body = await req.json();
    const { notificationId, userId } = body;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Notification marked as read'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to mark as read"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetUnreadCount(req: Request, supabase: any) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      unreadCount: count || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to get unread count"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}