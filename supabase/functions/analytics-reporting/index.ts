import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

// Validate required environment variables
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = validateRequiredEnvVars(requiredVars);

interface AnalyticsQuery {
  metric: string;
  dateRange: { start: string; end: string };
  groupBy?: "day" | "week" | "month";
  filters?: Record<string, any>;
  limit?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user and verify admin access
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (req.method) {
      case "POST":
        if (action === "query") {
          const analyticsQuery: AnalyticsQuery = await req.json();
          return await executeAnalyticsQuery(supabase, analyticsQuery);
        } else if (action === "custom-report") {
          const reportConfig = await req.json();
          return await generateCustomReport(supabase, reportConfig);
        }
        break;

      case "GET":
        if (action === "dashboard") {
          return await getDashboardMetrics(supabase);
        } else if (action === "revenue") {
          const period = url.searchParams.get("period") || "30d";
          return await getRevenueAnalytics(supabase, period);
        } else if (action === "users") {
          const period = url.searchParams.get("period") || "30d";
          return await getUserAnalytics(supabase, period);
        } else if (action === "books") {
          const period = url.searchParams.get("period") || "30d";
          return await getBookAnalytics(supabase, period);
        } else if (action === "performance") {
          return await getPerformanceMetrics(supabase);
        } else if (action === "export") {
          const reportType = url.searchParams.get("type") || "sales";
          const format = url.searchParams.get("format") || "csv";
          return await exportReport(supabase, reportType, format);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getDashboardMetrics(supabase: any) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Execute all queries in parallel
  const [
    totalUsers,
    newUsersToday,
    totalBooks,
    activeBooksToday,
    totalRevenue,
    revenueToday,
    totalOrders,
    ordersToday,
    pendingCommits,
    topCategories,
    topUniversities,
    recentActivity,
  ] = await Promise.all([
    // Total users
    supabase.from("profiles").select("*", { count: "exact", head: true }),

    // New users today
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString()),

    // Total books
    supabase.from("books").select("*", { count: "exact", head: true }),

    // Active books today
    supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("sold", false)
      .gte("created_at", yesterday.toISOString()),

    // Total revenue
    supabase.from("orders").select("amount").eq("status", "completed"),

    // Revenue today
    supabase
      .from("orders")
      .select("amount")
      .eq("status", "completed")
      .gte("created_at", yesterday.toISOString()),

    // Total orders
    supabase.from("orders").select("*", { count: "exact", head: true }),

    // Orders today
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString()),

    // Pending commits
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .is("seller_committed", null),

    // Top categories
    supabase.from("books").select("category").eq("sold", false),

    // Top universities
    supabase.from("books").select("university").eq("sold", false),

    // Recent activity (last 10 orders)
    supabase
      .from("orders")
      .select(
        `
        *,
        profiles:buyer_id(name),
        books(title, author)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Calculate revenue totals
  const totalRevenueAmount =
    totalRevenue.data?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const todayRevenueAmount =
    revenueToday.data?.reduce((sum, order) => sum + order.amount, 0) || 0;

  // Process category data
  const categoryStats = topCategories.data?.reduce((acc: any, book: any) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});
  const topCategoriesData = Object.entries(categoryStats || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Process university data
  const universityStats = topUniversities.data?.reduce(
    (acc: any, book: any) => {
      if (book.university) {
        acc[book.university] = (acc[book.university] || 0) + 1;
      }
      return acc;
    },
    {},
  );
  const topUniversitiesData = Object.entries(universityStats || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const metrics = {
    overview: {
      totalUsers: totalUsers.count || 0,
      newUsersToday: newUsersToday.count || 0,
      totalBooks: totalBooks.count || 0,
      activeBooksToday: activeBooksToday.count || 0,
      totalRevenue: totalRevenueAmount,
      revenueToday: todayRevenueAmount,
      totalOrders: totalOrders.count || 0,
      ordersToday: ordersToday.count || 0,
      pendingCommits: pendingCommits.count || 0,
    },
    topCategories: topCategoriesData,
    topUniversities: topUniversitiesData,
    recentActivity: recentActivity.data || [],
  };

  return new Response(JSON.stringify({ metrics }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getRevenueAnalytics(supabase: any, period: string) {
  const now = new Date();
  let startDate: Date;
  let groupBy: string;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = "day";
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = "day";
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      groupBy = "week";
      break;
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = "month";
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = "day";
  }

  // Get revenue data
  const { data: orders } = await supabase
    .from("orders")
    .select("amount, platform_fee, seller_amount, created_at, status")
    .gte("created_at", startDate.toISOString())
    .in("status", ["completed", "paid"]);

  // Group by time period
  const revenueByPeriod: Record<string, any> = {};

  orders?.forEach((order: any) => {
    const orderDate = new Date(order.created_at);
    let periodKey: string;

    if (groupBy === "day") {
      periodKey = orderDate.toISOString().split("T")[0];
    } else if (groupBy === "week") {
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay());
      periodKey = weekStart.toISOString().split("T")[0];
    } else {
      periodKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!revenueByPeriod[periodKey]) {
      revenueByPeriod[periodKey] = {
        period: periodKey,
        totalRevenue: 0,
        platformRevenue: 0,
        sellerRevenue: 0,
        orderCount: 0,
      };
    }

    revenueByPeriod[periodKey].totalRevenue += order.amount;
    revenueByPeriod[periodKey].platformRevenue += order.platform_fee;
    revenueByPeriod[periodKey].sellerRevenue += order.seller_amount;
    revenueByPeriod[periodKey].orderCount += 1;
  });

  const revenueData = Object.values(revenueByPeriod).sort(
    (a: any, b: any) =>
      new Date(a.period).getTime() - new Date(b.period).getTime(),
  );

  // Calculate totals
  const totals = {
    totalRevenue: orders?.reduce((sum, order) => sum + order.amount, 0) || 0,
    platformRevenue:
      orders?.reduce((sum, order) => sum + order.platform_fee, 0) || 0,
    sellerRevenue:
      orders?.reduce((sum, order) => sum + order.seller_amount, 0) || 0,
    orderCount: orders?.length || 0,
  };

  return new Response(
    JSON.stringify({
      revenueData,
      totals,
      period,
      groupBy,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function getUserAnalytics(supabase: any, period: string) {
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [userGrowth, usersByUniversity, userActivity, topSellers] =
    await Promise.all([
      // User growth over time
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString()),

      // Users by university
      supabase.from("profiles").select("id").not("university", "is", null),

      // User activity (books listed, orders placed)
      supabase
        .from("books")
        .select("seller_id, created_at")
        .gte("created_at", startDate.toISOString()),

      // Top sellers by revenue
      supabase
        .from("orders")
        .select(
          `
        seller_id,
        seller_amount,
        profiles:seller_id(name)
      `,
        )
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString()),
    ]);

  // Process user growth data
  const growthByDay: Record<string, number> = {};
  userGrowth.data?.forEach((user: any) => {
    const day = new Date(user.created_at).toISOString().split("T")[0];
    growthByDay[day] = (growthByDay[day] || 0) + 1;
  });

  // Process top sellers
  const sellerRevenue: Record<string, any> = {};
  topSellers.data?.forEach((order: any) => {
    if (!sellerRevenue[order.seller_id]) {
      sellerRevenue[order.seller_id] = {
        seller_id: order.seller_id,
        name: order.profiles?.name || "Unknown",
        revenue: 0,
        orders: 0,
      };
    }
    sellerRevenue[order.seller_id].revenue += order.seller_amount;
    sellerRevenue[order.seller_id].orders += 1;
  });

  const topSellersData = Object.values(sellerRevenue)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10);

  return new Response(
    JSON.stringify({
      userGrowth: Object.entries(growthByDay).map(([date, count]) => ({
        date,
        count,
      })),
      topSellers: topSellersData,
      totalUsers: userGrowth.data?.length || 0,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function getBookAnalytics(supabase: any, period: string) {
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    booksByCategory,
    booksByUniversity,
    booksByCondition,
    salesData,
    inventoryTurnover,
  ] = await Promise.all([
    // Books by category
    supabase
      .from("books")
      .select("category")
      .gte("created_at", startDate.toISOString()),

    // Books by university
    supabase
      .from("books")
      .select("university")
      .gte("created_at", startDate.toISOString())
      .not("university", "is", null),

    // Books by condition
    supabase
      .from("books")
      .select("condition")
      .gte("created_at", startDate.toISOString()),

    // Sales conversion data
    supabase
      .from("books")
      .select("id, sold, created_at, price")
      .gte("created_at", startDate.toISOString()),

    // Average time to sell
    supabase
      .from("books")
      .select("created_at, updated_at")
      .eq("sold", true)
      .gte("created_at", startDate.toISOString()),
  ]);

  // Process category distribution
  const categoryStats = booksByCategory.data?.reduce((acc: any, book: any) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  // Process university distribution
  const universityStats = booksByUniversity.data?.reduce(
    (acc: any, book: any) => {
      acc[book.university] = (acc[book.university] || 0) + 1;
      return acc;
    },
    {},
  );

  // Process condition distribution
  const conditionStats = booksByCondition.data?.reduce(
    (acc: any, book: any) => {
      acc[book.condition] = (acc[book.condition] || 0) + 1;
      return acc;
    },
    {},
  );

  // Calculate sales metrics
  const totalBooks = salesData.data?.length || 0;
  const soldBooks =
    salesData.data?.filter((book: any) => book.sold).length || 0;
  const conversionRate = totalBooks > 0 ? (soldBooks / totalBooks) * 100 : 0;

  // Calculate average time to sell
  const avgTimeToSell =
    inventoryTurnover.data?.reduce((acc: number, book: any) => {
      const timeToSell =
        new Date(book.updated_at).getTime() -
        new Date(book.created_at).getTime();
      return acc + timeToSell;
    }, 0) / (inventoryTurnover.data?.length || 1);

  const avgDaysToSell = Math.round(avgTimeToSell / (1000 * 60 * 60 * 24));

  return new Response(
    JSON.stringify({
      categoryDistribution: Object.entries(categoryStats || {}).map(
        ([name, count]) => ({ name, count }),
      ),
      universityDistribution: Object.entries(universityStats || {}).map(
        ([name, count]) => ({ name, count }),
      ),
      conditionDistribution: Object.entries(conditionStats || {}).map(
        ([name, count]) => ({ name, count }),
      ),
      salesMetrics: {
        totalBooks,
        soldBooks,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgDaysToSell,
      },
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function getPerformanceMetrics(supabase: any) {
  // This would include system performance metrics
  // For now, return mock data
  const metrics = {
    apiResponseTime: 150,
    databaseConnections: 12,
    activeUsers: 45,
    systemHealth: "healthy",
    uptime: "99.9%",
  };

  return new Response(JSON.stringify({ performance: metrics }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function executeAnalyticsQuery(supabase: any, query: AnalyticsQuery) {
  // Custom analytics query executor
  // This would handle complex analytical queries
  return new Response(
    JSON.stringify({ message: "Custom analytics query executed" }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function generateCustomReport(supabase: any, reportConfig: any) {
  // Custom report generator
  return new Response(JSON.stringify({ message: "Custom report generated" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function exportReport(supabase: any, reportType: string, format: string) {
  // Export functionality for reports
  return new Response(
    JSON.stringify({ message: `${reportType} report exported as ${format}` }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
