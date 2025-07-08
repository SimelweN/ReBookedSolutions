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

interface DisputeRequest {
  orderId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  evidence?: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    switch (action) {
      case "create":
        return await handleCreateDispute(req);
      case "update-status":
        return await handleUpdateDisputeStatus(req);
      case "get-disputes":
        return await handleGetDisputes(req);
      case "resolve":
        return await handleResolveDispute(req);
      case "escalate":
        return await handleEscalateDispute(req);
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in dispute-resolution:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCreateDispute(req: Request) {
  const disputeData: DisputeRequest = await req.json();
  const { orderId, reporterId, reportedUserId, reason, description, evidence } =
    disputeData;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      books(id, title, author)
    `,
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: reportedUser, error: userError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", reportedUserId)
    .single();

  if (userError || !reportedUser) {
    return new Response(JSON.stringify({ error: "Reported user not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      book_id: order.book_id,
      book_title: order.books.title,
      reporter_user_id: reporterId,
      reported_user_id: reportedUserId,
      seller_name: reportedUser.full_name,
      reason,
      status: "pending",
    })
    .select()
    .single();

  if (reportError) {
    throw reportError;
  }

  await supabase.from("audit_logs").insert({
    action: "dispute_created",
    table_name: "reports",
    record_id: report.id,
    user_id: reporterId,
    new_values: {
      orderId,
      reason,
      description,
      evidence,
    },
  });

  await supabase.from("notifications").insert([
    {
      user_id: reportedUserId,
      type: "dispute_reported",
      title: "Dispute Reported Against You",
      message: `A dispute has been reported against you for order ${orderId}. Please check your account for details.`,
    },
  ]);

  return new Response(
    JSON.stringify({
      success: true,
      disputeId: report.id,
      message: "Dispute created successfully and will be reviewed by our team.",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleUpdateDisputeStatus(req: Request) {
  const { disputeId, status, adminNotes, adminId } = await req.json();

  const { data: report, error } = await supabase
    .from("reports")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    action: "dispute_status_updated",
    table_name: "reports",
    record_id: disputeId,
    user_id: adminId,
    new_values: {
      status,
      adminNotes,
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Dispute status updated successfully",
      report,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleGetDisputes(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const isAdmin = url.searchParams.get("isAdmin") === "true";

  let query = supabase.from("reports").select(`
      *,
      profiles!reports_reporter_user_id_fkey(full_name, email),
      profiles!reports_reported_user_id_fkey(full_name, email)
    `);

  if (!isAdmin && userId) {
    query = query.or(
      `reporter_user_id.eq.${userId},reported_user_id.eq.${userId}`,
    );
  }

  const { data: disputes, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      disputes,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleResolveDispute(req: Request) {
  const { disputeId, resolution, adminId } = await req.json();

  const { data: report, error } = await supabase
    .from("reports")
    .update({
      status: "resolved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("notifications").insert([
    {
      user_id: report.reporter_user_id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `Your dispute has been resolved. Resolution: ${resolution}`,
    },
    {
      user_id: report.reported_user_id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `The dispute against you has been resolved. Resolution: ${resolution}`,
    },
  ]);

  return new Response(
    JSON.stringify({
      success: true,
      message: "Dispute resolved successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleEscalateDispute(req: Request) {
  const { disputeId, escalationReason, adminId } = await req.json();

  const { data: report, error } = await supabase
    .from("reports")
    .update({
      status: "escalated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    action: "dispute_escalated",
    table_name: "reports",
    record_id: disputeId,
    user_id: adminId,
    new_values: {
      escalationReason,
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Dispute escalated successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
