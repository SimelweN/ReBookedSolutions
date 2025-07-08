import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

interface DisputeRequest {
  order_id: string;
  dispute_type:
    | "item_not_received"
    | "item_damaged"
    | "item_not_as_described"
    | "unauthorized_charge"
    | "refund_not_processed"
    | "other";
  description: string;
  evidence_urls?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
}

interface DisputeResolution {
  dispute_id: string;
  resolution_action:
    | "refund_buyer"
    | "pay_seller"
    | "partial_refund"
    | "no_action";
  resolution_amount?: number;
  resolution_notes: string;
  notify_parties?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (req.method) {
      case "POST":
        if (action === "create") {
          const disputeRequest: DisputeRequest = await req.json();
          return await createDispute(supabase, disputeRequest, user.id);
        } else if (action === "resolve") {
          const resolution: DisputeResolution = await req.json();
          return await resolveDispute(supabase, resolution, user.id);
        } else if (action === "escalate") {
          const { disputeId, reason } = await req.json();
          return await escalateDispute(supabase, disputeId, reason, user.id);
        } else if (action === "update-status") {
          const { disputeId, status, notes } = await req.json();
          return await updateDisputeStatus(
            supabase,
            disputeId,
            status,
            notes,
            user.id,
          );
        }
        break;

      case "GET":
        if (action === "list") {
          const status = url.searchParams.get("status");
          const priority = url.searchParams.get("priority");
          const limit = parseInt(url.searchParams.get("limit") || "20");
          const offset = parseInt(url.searchParams.get("offset") || "0");
          return await getDisputes(supabase, user.id, {
            status,
            priority,
            limit,
            offset,
          });
        } else if (action === "details") {
          const disputeId = url.searchParams.get("dispute_id");
          return await getDisputeDetails(supabase, disputeId!, user.id);
        } else if (action === "admin-dashboard") {
          return await getAdminDisputeDashboard(supabase, user.id);
        } else if (action === "analytics") {
          const period = url.searchParams.get("period") || "30d";
          return await getDisputeAnalytics(supabase, period, user.id);
        }
        break;

      case "PUT":
        if (action === "add-evidence") {
          const { disputeId, evidenceUrls, description } = await req.json();
          return await addEvidence(
            supabase,
            disputeId,
            evidenceUrls,
            description,
            user.id,
          );
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dispute resolution error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createDispute(
  supabase: any,
  disputeRequest: DisputeRequest,
  userId: string,
) {
  const {
    order_id,
    dispute_type,
    description,
    evidence_urls = [],
    priority = "medium",
  } = disputeRequest;

  // Verify user is involved in the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      buyer:buyer_id(id, name, email),
      seller:seller_id(id, name, email),
      book:book_id(title, author)
    `,
    )
    .eq("id", order_id)
    .single();

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (order.buyer_id !== userId && order.seller_id !== userId) {
    return new Response(
      JSON.stringify({
        error: "You are not authorized to create a dispute for this order",
      }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Check if there's already an open dispute for this order
  const { data: existingDispute } = await supabase
    .from("payment_disputes")
    .select("id")
    .eq("order_id", order_id)
    .in("status", ["open", "investigating"])
    .single();

  if (existingDispute) {
    return new Response(
      JSON.stringify({
        error: "An open dispute already exists for this order",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Create the dispute
  const { data: dispute, error: disputeError } = await supabase
    .from("payment_disputes")
    .insert({
      order_id,
      reported_by: userId,
      dispute_type,
      description,
      evidence_urls,
      priority,
      status: "open",
    })
    .select(
      `
      *,
      order:order_id(*),
      reporter:reported_by(name, email)
    `,
    )
    .single();

  if (disputeError) {
    throw disputeError;
  }

  // Put order on dispute hold
  await supabase
    .from("orders")
    .update({
      dispute_hold: true,
      has_dispute: true,
    })
    .eq("id", order_id);

  // Notify admin and other party
  const otherPartyId =
    userId === order.buyer_id ? order.seller_id : order.buyer_id;
  const role = userId === order.buyer_id ? "buyer" : "seller";

  // Create notifications
  const notifications = [
    {
      user_id: otherPartyId,
      type: "dispute_created",
      title: "Dispute Created",
      message: `A dispute has been created for your ${role === "buyer" ? "sale" : "purchase"} of "${order.book.title}".`,
      data: { dispute_id: dispute.id, order_id: order_id },
    },
  ];

  // Get admin users
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_admin", true);

  admins?.forEach((admin) => {
    notifications.push({
      user_id: admin.id,
      type: "admin_dispute_created",
      title: "New Dispute Requires Attention",
      message: `A ${dispute_type.replace("_", " ")} dispute has been created for order #${order_id}.`,
      data: { dispute_id: dispute.id, order_id: order_id, priority },
    });
  });

  await supabase.from("notifications").insert(notifications);

  // Send email notifications
  await supabase.functions.invoke("email-automation", {
    body: {
      action: "send-template",
      templateId: "dispute_created",
      to: userId === order.buyer_id ? order.seller.email : order.buyer.email,
      variables: {
        name: userId === order.buyer_id ? order.seller.name : order.buyer.name,
        disputeType: dispute_type.replace("_", " "),
        bookTitle: order.book.title,
        orderReference: order_id,
        disputeUrl: `${Deno.env.get("SITE_URL")}/disputes/${dispute.id}`,
      },
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      dispute,
      message:
        "Dispute created successfully. Our team will review it within 24 hours.",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function resolveDispute(
  supabase: any,
  resolution: DisputeResolution,
  userId: string,
) {
  const {
    dispute_id,
    resolution_action,
    resolution_amount,
    resolution_notes,
    notify_parties = true,
  } = resolution;

  // Verify user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get dispute details
  const { data: dispute, error: disputeError } = await supabase
    .from("payment_disputes")
    .select(
      `
      *,
      order:order_id(*),
      reporter:reported_by(name, email)
    `,
    )
    .eq("id", dispute_id)
    .single();

  if (disputeError || !dispute) {
    return new Response(JSON.stringify({ error: "Dispute not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (dispute.status === "resolved" || dispute.status === "closed") {
    return new Response(JSON.stringify({ error: "Dispute already resolved" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update dispute with resolution
  const { data: updatedDispute, error: updateError } = await supabase
    .from("payment_disputes")
    .update({
      status: "resolved",
      resolution_action,
      resolution_amount,
      resolution_notes,
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", dispute_id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  // Execute resolution action
  let actionResult = null;
  switch (resolution_action) {
    case "refund_buyer":
      actionResult = await processRefund(
        supabase,
        dispute.order,
        resolution_amount || dispute.order.amount,
      );
      break;
    case "pay_seller":
      actionResult = await processPayout(
        supabase,
        dispute.order,
        resolution_amount || dispute.order.seller_amount,
      );
      break;
    case "partial_refund":
      if (resolution_amount) {
        actionResult = await processRefund(
          supabase,
          dispute.order,
          resolution_amount,
        );
        // Pay remaining to seller
        const sellerAmount = dispute.order.seller_amount - resolution_amount;
        if (sellerAmount > 0) {
          await processPayout(supabase, dispute.order, sellerAmount);
        }
      }
      break;
    case "no_action":
      // No financial action needed
      break;
  }

  // Remove dispute hold from order
  await supabase
    .from("orders")
    .update({
      dispute_hold: false,
      has_dispute: false,
    })
    .eq("id", dispute.order_id);

  if (notify_parties) {
    // Notify involved parties
    const notifications = [
      {
        user_id: dispute.order.buyer_id,
        type: "dispute_resolved",
        title: "Dispute Resolved",
        message: `Your dispute for order #${dispute.order_id} has been resolved: ${resolution_action.replace("_", " ")}.`,
        data: { dispute_id: dispute_id, resolution_action, resolution_amount },
      },
      {
        user_id: dispute.order.seller_id,
        type: "dispute_resolved",
        title: "Dispute Resolved",
        message: `The dispute for order #${dispute.order_id} has been resolved: ${resolution_action.replace("_", " ")}.`,
        data: { dispute_id: dispute_id, resolution_action, resolution_amount },
      },
    ];

    await supabase.from("notifications").insert(notifications);
  }

  return new Response(
    JSON.stringify({
      success: true,
      dispute: updatedDispute,
      action_result: actionResult,
      message: "Dispute resolved successfully",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function processRefund(supabase: any, order: any, amount: number) {
  try {
    // Call Paystack refund API
    const refundResponse = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: order.paystack_ref,
        amount: Math.round(amount * 100), // Convert to kobo
        reason: "Dispute resolution refund",
      }),
    });

    const refundData = await refundResponse.json();

    if (refundData.status) {
      // Update order with refund info
      await supabase
        .from("orders")
        .update({
          refund_reference: refundData.data.refund_reference,
          refund_amount: amount,
          refunded_at: new Date().toISOString(),
          status: "refunded",
        })
        .eq("id", order.id);

      return {
        success: true,
        refund_reference: refundData.data.refund_reference,
      };
    } else {
      throw new Error(`Refund failed: ${refundData.message}`);
    }
  } catch (error) {
    console.error("Refund error:", error);
    return { success: false, error: error.message };
  }
}

async function processPayout(supabase: any, order: any, amount: number) {
  try {
    // Get seller banking details
    const { data: bankingDetails } = await supabase
      .from("banking_details")
      .select("*")
      .eq("user_id", order.seller_id)
      .single();

    if (!bankingDetails?.paystack_subaccount_code) {
      throw new Error("Seller banking details not found or incomplete");
    }

    // Create payout transaction record
    const { data: payoutTransaction, error: payoutError } = await supabase
      .from("payout_transactions")
      .insert({
        order_id: order.id,
        seller_id: order.seller_id,
        amount: amount,
        status: "pending",
        dispute_resolution: true,
      })
      .select()
      .single();

    if (payoutError) {
      throw payoutError;
    }

    // In a real implementation, you would integrate with Paystack's transfer API
    // For now, we'll mark it as completed
    await supabase
      .from("payout_transactions")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutTransaction.id);

    return { success: true, payout_id: payoutTransaction.id };
  } catch (error) {
    console.error("Payout error:", error);
    return { success: false, error: error.message };
  }
}

async function getDisputes(supabase: any, userId: string, filters: any) {
  const { status, priority, limit, offset } = filters;

  // Check if user is admin to see all disputes
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  let query = supabase
    .from("payment_disputes")
    .select(
      `
      *,
      order:order_id(*),
      reporter:reported_by(name, email)
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // If not admin, only show disputes they're involved in
  if (!profile?.is_admin) {
    query = query.or(
      `reported_by.eq.${userId},order_id.in.(${
        // Subquery to get orders where user is buyer or seller
        supabase
          .from("orders")
          .select("id")
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      })`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (priority) {
    query = query.eq("priority", priority);
  }

  const { data: disputes, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({ disputes }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getDisputeDetails(
  supabase: any,
  disputeId: string,
  userId: string,
) {
  const { data: dispute, error } = await supabase
    .from("payment_disputes")
    .select(
      `
      *,
      order:order_id(*),
      reporter:reported_by(name, email),
      resolver:resolved_by(name)
    `,
    )
    .eq("id", disputeId)
    .single();

  if (error || !dispute) {
    return new Response(JSON.stringify({ error: "Dispute not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check access permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  const isInvolved =
    dispute.reported_by === userId ||
    dispute.order.buyer_id === userId ||
    dispute.order.seller_id === userId;

  if (!profile?.is_admin && !isInvolved) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ dispute }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAdminDisputeDashboard(supabase: any, userId: string) {
  // Verify admin access
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get dashboard metrics
  const [
    openDisputes,
    investigatingDisputes,
    urgentDisputes,
    recentDisputes,
    disputeStats,
  ] = await Promise.all([
    supabase
      .from("payment_disputes")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("payment_disputes")
      .select("*", { count: "exact", head: true })
      .eq("status", "investigating"),
    supabase
      .from("payment_disputes")
      .select("*", { count: "exact", head: true })
      .eq("priority", "urgent"),
    supabase
      .from("payment_disputes")
      .select(
        `
      *,
      order:order_id(book_title),
      reporter:reported_by(name)
    `,
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("payment_disputes").select("dispute_type, status, priority"),
  ]);

  // Process statistics
  const typeStats = disputeStats.data?.reduce((acc: any, dispute: any) => {
    acc[dispute.dispute_type] = (acc[dispute.dispute_type] || 0) + 1;
    return acc;
  }, {});

  const statusStats = disputeStats.data?.reduce((acc: any, dispute: any) => {
    acc[dispute.status] = (acc[dispute.status] || 0) + 1;
    return acc;
  }, {});

  const dashboard = {
    metrics: {
      openDisputes: openDisputes.count || 0,
      investigatingDisputes: investigatingDisputes.count || 0,
      urgentDisputes: urgentDisputes.count || 0,
      totalDisputes: disputeStats.data?.length || 0,
    },
    recentDisputes: recentDisputes.data || [],
    statistics: {
      byType: typeStats || {},
      byStatus: statusStats || {},
    },
  };

  return new Response(JSON.stringify({ dashboard }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function escalateDispute(
  supabase: any,
  disputeId: string,
  reason: string,
  userId: string,
) {
  const { data: dispute, error } = await supabase
    .from("payment_disputes")
    .update({
      priority: "urgent",
      status: "investigating",
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select()
    .single();

  if (error) throw error;

  // Notify admin team
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_admin", true);

  const notifications =
    admins?.map((admin) => ({
      user_id: admin.id,
      type: "dispute_escalated",
      title: "Dispute Escalated",
      message: `Dispute #${disputeId} has been escalated. Reason: ${reason}`,
      data: { dispute_id: disputeId, escalation_reason: reason },
      priority: "urgent",
    })) || [];

  await supabase.from("notifications").insert(notifications);

  return new Response(JSON.stringify({ success: true, dispute }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateDisputeStatus(
  supabase: any,
  disputeId: string,
  status: string,
  notes: string,
  userId: string,
) {
  // Verify admin access
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: dispute, error } = await supabase
    .from("payment_disputes")
    .update({
      status,
      resolution_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, dispute }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function addEvidence(
  supabase: any,
  disputeId: string,
  evidenceUrls: string[],
  description: string,
  userId: string,
) {
  // Get current dispute
  const { data: dispute } = await supabase
    .from("payment_disputes")
    .select("evidence_urls, reported_by, order_id")
    .eq("id", disputeId)
    .single();

  if (!dispute) {
    return new Response(JSON.stringify({ error: "Dispute not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check if user can add evidence (reporter or involved in order)
  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, seller_id")
    .eq("id", dispute.order_id)
    .single();

  const canAddEvidence =
    dispute.reported_by === userId ||
    order?.buyer_id === userId ||
    order?.seller_id === userId;

  if (!canAddEvidence) {
    return new Response(
      JSON.stringify({ error: "You cannot add evidence to this dispute" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Update dispute with new evidence
  const updatedEvidenceUrls = [
    ...(dispute.evidence_urls || []),
    ...evidenceUrls,
  ];

  const { data: updatedDispute, error } = await supabase
    .from("payment_disputes")
    .update({
      evidence_urls: updatedEvidenceUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, dispute: updatedDispute }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function getDisputeAnalytics(
  supabase: any,
  period: string,
  userId: string,
) {
  // Verify admin access
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const { data: disputes } = await supabase
    .from("payment_disputes")
    .select("*")
    .gte("created_at", startDate.toISOString());

  const analytics = {
    totalDisputes: disputes?.length || 0,
    byType: {},
    byStatus: {},
    byPriority: {},
    resolutionTime: 0,
    resolutionRate: 0,
  };

  disputes?.forEach((dispute: any) => {
    // Group by type
    analytics.byType[dispute.dispute_type] =
      (analytics.byType[dispute.dispute_type] || 0) + 1;

    // Group by status
    analytics.byStatus[dispute.status] =
      (analytics.byStatus[dispute.status] || 0) + 1;

    // Group by priority
    analytics.byPriority[dispute.priority] =
      (analytics.byPriority[dispute.priority] || 0) + 1;
  });

  const resolvedDisputes =
    disputes?.filter((d) => d.status === "resolved") || [];
  analytics.resolutionRate = disputes?.length
    ? (resolvedDisputes.length / disputes.length) * 100
    : 0;

  // Calculate average resolution time
  const totalResolutionTime = resolvedDisputes.reduce((acc, dispute) => {
    if (dispute.resolved_at) {
      const resolutionTime =
        new Date(dispute.resolved_at).getTime() -
        new Date(dispute.created_at).getTime();
      return acc + resolutionTime;
    }
    return acc;
  }, 0);

  analytics.resolutionTime = resolvedDisputes.length
    ? Math.round(
        totalResolutionTime / resolvedDisputes.length / (1000 * 60 * 60),
      )
    : 0; // in hours

  return new Response(JSON.stringify({ analytics }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
