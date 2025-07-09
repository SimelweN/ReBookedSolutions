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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      // Handle health check
      if (action === "health") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Study resources API function is healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      switch (action) {
        case "search":
          return await handleSearchFromBody(body);
        case "create":
          return await handleCreate(req);
        case "update":
          return await handleUpdate(req);
        case "delete":
          return await handleDelete(req);
        case "get":
          return await handleGetFromBody(body);
        case "rate":
          return await handleRate(req);
        case "verify":
          return await handleVerify(req);
        default:
          return new Response(
            JSON.stringify({
              error:
                "Invalid action. Supported actions: search, create, update, delete, get, rate, verify",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
      }
    } else {
      const url = new URL(req.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const action = segments[segments.length - 1];

      switch (action) {
        case "search":
          return await handleSearch(req);
        case "get":
          return await handleGet(req);
        default:
          return new Response(JSON.stringify({ error: "Invalid action" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    }
  } catch (error) {
    console.error("Error in study-resources-api:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSearch(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category");
  const university = url.searchParams.get("university");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let dbQuery = supabase
    .from("books")
    .select(
      `
      *,
      profiles!books_seller_id_fkey(full_name, email)
    `,
    )
    .eq("sold", false);

  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  if (university) {
    dbQuery = dbQuery.eq("university", university);
  }

  const { data: books, error } = await dbQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const { count: total } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("sold", false);

  return new Response(
    JSON.stringify({
      success: true,
      books,
      total,
      hasMore: (total || 0) > offset + limit,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleCreate(req: Request) {
  const bookData = await req.json();

  const { data: book, error } = await supabase
    .from("books")
    .insert(bookData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    action: "book_created",
    table_name: "books",
    record_id: book.id,
    user_id: book.seller_id,
    new_values: bookData,
  });

  return new Response(
    JSON.stringify({
      success: true,
      book,
      message: "Book created successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleUpdate(req: Request) {
  const { bookId, updates } = await req.json();

  const { data: book, error } = await supabase
    .from("books")
    .update(updates)
    .eq("id", bookId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    action: "book_updated",
    table_name: "books",
    record_id: bookId,
    user_id: book.seller_id,
    new_values: updates,
  });

  return new Response(
    JSON.stringify({
      success: true,
      book,
      message: "Book updated successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleDelete(req: Request) {
  const { bookId, userId } = await req.json();

  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId)
    .eq("seller_id", userId);

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    action: "book_deleted",
    table_name: "books",
    record_id: bookId,
    user_id: userId,
    new_values: { deleted: true },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Book deleted successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleGet(req: Request) {
  const url = new URL(req.url);
  const bookId = url.searchParams.get("bookId");

  if (!bookId) {
    return new Response(JSON.stringify({ error: "Book ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: book, error } = await supabase
    .from("books")
    .select(
      `
      *,
      profiles!books_seller_id_fkey(full_name, email, pickup_address)
    `,
    )
    .eq("id", bookId)
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      book,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleRate(req: Request) {
  const { bookId, userId, rating, review } = await req.json();

  // This would typically insert into a ratings table
  // For now, we'll log it as an audit entry
  await supabase.from("audit_logs").insert({
    action: "book_rated",
    table_name: "books",
    record_id: bookId,
    user_id: userId,
    new_values: { rating, review },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Rating submitted successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleVerify(req: Request) {
  const { bookId, adminId, verified } = await req.json();

  const { data: book, error } = await supabase
    .from("books")
    .update({ verified: verified })
    .eq("id", bookId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("audit_logs").insert({
    action: "book_verified",
    table_name: "books",
    record_id: bookId,
    user_id: adminId,
    new_values: { verified },
  });

  return new Response(
    JSON.stringify({
      success: true,
      book,
      message: `Book ${verified ? "verified" : "unverified"} successfully`,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleSearchFromBody(body: any) {
  const { query = "", category, university, limit = 20, offset = 0 } = body;

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
    },
    {
      id: "2",
      title: "Physics Study Guide",
      subject: "physics",
      type: "study_guide",
      difficulty: "intermediate",
      description: "Physics study guide covering mechanics",
      rating: 4.2,
    },
    {
      id: "3",
      title: "Chemistry Lab Manual",
      subject: "chemistry",
      type: "lab_manual",
      difficulty: "beginner",
      description: "Laboratory manual for chemistry",
      rating: 4.0,
    },
  ];

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
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleGetFromBody(body: any) {
  const { id } = body;

  const mockResources = [
    {
      id: "1",
      title: "Advanced Mathematics Textbook",
      subject: "mathematics",
      type: "textbook",
      difficulty: "advanced",
      description: "Comprehensive mathematics textbook",
      rating: 4.5,
    },
    {
      id: "2",
      title: "Physics Study Guide",
      subject: "physics",
      type: "study_guide",
      difficulty: "intermediate",
      description: "Physics study guide covering mechanics",
      rating: 4.2,
    },
    {
      id: "3",
      title: "Chemistry Lab Manual",
      subject: "chemistry",
      type: "lab_manual",
      difficulty: "beginner",
      description: "Laboratory manual for chemistry",
      rating: 4.0,
    },
  ];

  const resource = mockResources.find((r) => r.id === id);
  if (!resource) {
    return new Response(
      JSON.stringify({ success: false, error: "Resource not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ success: true, data: resource }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
