import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    switch (path) {
      case "dashboard":
        return await handleDashboardAnalytics(req);
      case "sales":
        return await handleSalesAnalytics(req);
      case "books":
        return await handleBooksAnalytics(req);
      case "users":
        return await handleUsersAnalytics(req);
      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in analytics-reporting:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleDashboardAnalytics(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "30d";

  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  const [
    { count: totalUsers },
    { count: totalBooks },
    { count: totalOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("amount")
      .eq("payment_status", "paid")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),
  ]);

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + order.amount, 0) || 0;

  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      `
      id,
      amount,
      status,
      created_at,
      buyer_email
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  return new Response(
    JSON.stringify({
      summary: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        period,
      },
      recentOrders,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleSalesAnalytics(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "30d";

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(period.replace("d", "")));

  const { data: salesData } = await supabase
    .from("orders")
    .select("amount, created_at, status")
    .eq("payment_status", "paid")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  const salesByDate =
    salesData?.reduce(
      (acc, order) => {
        const date = order.created_at.split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += order.amount;
        acc[date].orders += 1;
        return acc;
      },
      {} as Record<string, any>,
    ) || {};

  const { data: topBooks } = await supabase
    .from("orders")
    .select(
      `
      book_id,
      amount,
      books(title, author, category)
    `,
    )
    .eq("payment_status", "paid")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  const bookStats =
    topBooks?.reduce(
      (acc, order) => {
        const bookId = order.book_id;
        if (!acc[bookId]) {
          acc[bookId] = {
            bookId,
            title: order.books?.title,
            author: order.books?.author,
            category: order.books?.category,
            revenue: 0,
            sales: 0,
          };
        }
        acc[bookId].revenue += order.amount;
        acc[bookId].sales += 1;
        return acc;
      },
      {} as Record<string, any>,
    ) || {};

  return new Response(
    JSON.stringify({
      salesByDate: Object.values(salesByDate),
      topBooks: Object.values(bookStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleBooksAnalytics(req: Request) {
  const { data: booksByCategory } = await supabase
    .from("books")
    .select("category")
    .eq("sold", false);

  const categoryStats =
    booksByCategory?.reduce(
      (acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const { data: booksByCondition } = await supabase
    .from("books")
    .select("condition")
    .eq("sold", false);

  const conditionStats =
    booksByCondition?.reduce(
      (acc, book) => {
        acc[book.condition] = (acc[book.condition] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const { data: priceData } = await supabase
    .from("books")
    .select("category, price")
    .eq("sold", false);

  const priceByCategory =
    priceData?.reduce(
      (acc, book) => {
        if (!acc[book.category]) {
          acc[book.category] = { total: 0, count: 0 };
        }
        acc[book.category].total += book.price;
        acc[book.category].count += 1;
        return acc;
      },
      {} as Record<string, any>,
    ) || {};

  const avgPriceByCategory = Object.keys(priceByCategory).map((category) => ({
    category,
    averagePrice:
      priceByCategory[category].total / priceByCategory[category].count,
  }));

  return new Response(
    JSON.stringify({
      categoryStats,
      conditionStats,
      avgPriceByCategory,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleUsersAnalytics(req: Request) {
  const { data: userRegistrations } = await supabase
    .from("profiles")
    .select("created_at")
    .order("created_at", { ascending: true });

  const registrationsByDate =
    userRegistrations?.reduce(
      (acc, user) => {
        const date = user.created_at.split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const { data: activeSellers } = await supabase.from("profiles").select(`
      id,
      full_name,
      created_at,
      books(count)
    `);

  return new Response(
    JSON.stringify({
      registrationsByDate,
      activeSellers:
        activeSellers?.filter((seller) => seller.books?.[0]?.count > 0) || [],
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
