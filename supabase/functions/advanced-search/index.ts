import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SearchFilters {
  query?: string;
  category?: string;
  condition?: string;
  university?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  grade?: string;
  availability?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "relevance";
  limit?: number;
  offset?: number;
  action?: string;
}

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

    // Only call req.json() ONCE
    const filters: SearchFilters = await req.json();
    console.log("Received filters:", filters);

    // Handle health check
    if (filters.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Advanced search function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mock books data for search
    const mockBooks = [
      {
        id: "1",
        title: "Advanced Physics Textbook",
        author: "Dr. Smith",
        price: 450.0,
        category: "Science",
        condition: "excellent",
        university: "UCT",
        grade: "undergraduate",
        availability: "available",
        province: "Western Cape",
        image_url: "https://example.com/book1.jpg",
        created_at: "2024-01-15T10:00:00Z",
        sold: false,
      },
      {
        id: "2",
        title: "Mathematics for Engineers",
        author: "Prof. Johnson",
        price: 320.0,
        category: "Engineering",
        condition: "good",
        university: "Wits",
        grade: "undergraduate",
        availability: "available",
        province: "Gauteng",
        image_url: "https://example.com/book2.jpg",
        created_at: "2024-01-14T09:00:00Z",
        sold: false,
      },
      {
        id: "3",
        title: "Chemistry Lab Manual",
        author: "Dr. Williams",
        price: 280.0,
        category: "Science",
        condition: "fair",
        university: "Stellenbosch",
        grade: "undergraduate",
        availability: "available",
        province: "Western Cape",
        image_url: "https://example.com/book3.jpg",
        created_at: "2024-01-13T08:00:00Z",
        sold: false,
      },
    ];

    const {
      query = "",
      category,
      condition,
      university,
      minPrice,
      maxPrice,
      location,
      grade,
      availability = "available",
      sortBy = "newest",
      limit = 20,
      offset = 0,
    } = filters;

    // Apply filters
    let filteredBooks = mockBooks.filter((book) => !book.sold);

    if (query) {
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (category) {
      filteredBooks = filteredBooks.filter(
        (book) => book.category === category,
      );
    }

    if (condition) {
      filteredBooks = filteredBooks.filter(
        (book) => book.condition === condition,
      );
    }

    if (university) {
      filteredBooks = filteredBooks.filter(
        (book) => book.university === university,
      );
    }

    if (grade) {
      filteredBooks = filteredBooks.filter((book) => book.grade === grade);
    }

    if (location) {
      filteredBooks = filteredBooks.filter(
        (book) => book.province === location,
      );
    }

    if (minPrice !== undefined) {
      filteredBooks = filteredBooks.filter((book) => book.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      filteredBooks = filteredBooks.filter((book) => book.price <= maxPrice);
    }

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        filteredBooks.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filteredBooks.sort((a, b) => b.price - a.price);
        break;
      case "oldest":
        filteredBooks.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "newest":
      default:
        filteredBooks.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    // Apply pagination
    const total = filteredBooks.length;
    const paginatedBooks = filteredBooks.slice(offset, offset + limit);

    return new Response(
      JSON.stringify({
        success: true,
        books: paginatedBooks,
        total: total,
        hasMore: total > offset + limit,
        filters: filters,
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
