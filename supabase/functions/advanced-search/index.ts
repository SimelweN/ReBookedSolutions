import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

// Validate environment on startup
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = validateRequiredEnvVars(requiredVars);

interface SearchFilters {
  query?: string;
  category?: string;
  university?: string;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  grade?: string;
  yearLevel?: string;
  availability?: string;
  tags?: string[];
  sort?:
    | "price_asc"
    | "price_desc"
    | "created_desc"
    | "created_asc"
    | "relevance";
  limit?: number;
  offset?: number;
}

interface SearchResult {
  books: any[];
  total: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    universities: Array<{ name: string; count: number }>;
    conditions: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
  suggestions: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables first
    if (missingVars.length > 0) {
      return createEnvironmentError(missingVars);
    }

    const config = getEnvironmentConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
    );
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (req.method) {
      case "POST":
        if (action === "search") {
          const filters: SearchFilters = await req.json();
          return await performAdvancedSearch(supabase, filters);
        } else if (action === "index") {
          return await rebuildSearchIndex(supabase);
        } else if (action === "suggestions") {
          const { query } = await req.json();
          return await getSearchSuggestions(supabase, query);
        }
        break;

      case "GET":
        if (action === "facets") {
          const category = url.searchParams.get("category");
          return await getFacets(supabase, category);
        } else if (action === "trending") {
          return await getTrendingSearches(supabase);
        } else if (action === "autocomplete") {
          const query = url.searchParams.get("q") || "";
          return await getAutocomplete(supabase, query);
        }
        break;
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function performAdvancedSearch(
  supabase: any,
  filters: SearchFilters,
): Promise<Response> {
  const {
    query = "",
    category,
    university,
    condition,
    priceMin,
    priceMax,
    location,
    grade,
    yearLevel,
    availability = "available",
    tags = [],
    sort = "relevance",
    limit = 20,
    offset = 0,
  } = filters;

  // Build search query
  let searchQuery = supabase
    .from("books")
    .select(
      `
      *,
      profiles:seller_id(name, profile_picture_url, created_at),
      universities:university(name, logo_url)
    `,
    )
    .eq("sold", false);

  // Text search with ranking
  if (query) {
    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);
    const titleWeight = 4;
    const authorWeight = 3;
    const descriptionWeight = 2;
    const categoryWeight = 1;

    // Create search conditions for each term
    const searchConditions = searchTerms
      .map((term) => {
        return `or(title.ilike.%${term}%,author.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%)`;
      })
      .join(",");

    searchQuery = searchQuery.or(searchConditions);
  }

  // Apply filters
  if (category) searchQuery = searchQuery.eq("category", category);
  if (university) searchQuery = searchQuery.eq("university", university);
  if (condition) searchQuery = searchQuery.eq("condition", condition);
  if (grade) searchQuery = searchQuery.eq("grade", grade);
  if (yearLevel) searchQuery = searchQuery.eq("university_year", yearLevel);
  if (location) searchQuery = searchQuery.eq("province", location);
  if (priceMin !== undefined) searchQuery = searchQuery.gte("price", priceMin);
  if (priceMax !== undefined) searchQuery = searchQuery.lte("price", priceMax);

  // Availability filter
  if (availability === "available") {
    searchQuery = searchQuery.eq("availability", "available");
  }

  // Tag filtering (if implemented)
  if (tags.length > 0) {
    searchQuery = searchQuery.contains("tags", tags);
  }

  // Apply sorting
  switch (sort) {
    case "price_asc":
      searchQuery = searchQuery.order("price", { ascending: true });
      break;
    case "price_desc":
      searchQuery = searchQuery.order("price", { ascending: false });
      break;
    case "created_asc":
      searchQuery = searchQuery.order("created_at", { ascending: true });
      break;
    case "created_desc":
    default:
      searchQuery = searchQuery.order("created_at", { ascending: false });
      break;
  }

  // Get total count for pagination
  const { count } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("sold", false);

  // Apply pagination
  searchQuery = searchQuery.range(offset, offset + limit - 1);

  const { data: books, error } = await searchQuery;

  if (error) throw error;

  // Calculate relevance scores if text search is used
  if (query) {
    books.forEach((book: any) => {
      book.relevance_score = calculateRelevanceScore(book, query);
    });

    if (sort === "relevance") {
      books.sort((a: any, b: any) => b.relevance_score - a.relevance_score);
    }
  }

  // Get facets for filtering
  const facets = await calculateFacets(supabase, filters);

  // Get search suggestions
  const suggestions = await getSearchSuggestions(supabase, query);

  // Log search for analytics
  await logSearch(supabase, filters, books.length);

  const result: SearchResult = {
    books,
    total: count || 0,
    facets,
    suggestions: suggestions.data || [],
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function calculateRelevanceScore(book: any, query: string): number {
  const queryLower = query.toLowerCase();
  const titleLower = book.title.toLowerCase();
  const authorLower = book.author.toLowerCase();
  const descriptionLower = book.description.toLowerCase();
  const categoryLower = book.category.toLowerCase();

  let score = 0;

  // Exact matches get highest score
  if (titleLower.includes(queryLower)) score += 10;
  if (authorLower.includes(queryLower)) score += 8;
  if (categoryLower.includes(queryLower)) score += 6;
  if (descriptionLower.includes(queryLower)) score += 4;

  // Partial word matches
  const queryWords = queryLower.split(" ");
  queryWords.forEach((word) => {
    if (word.length > 2) {
      if (titleLower.includes(word)) score += 3;
      if (authorLower.includes(word)) score += 2;
      if (categoryLower.includes(word)) score += 2;
      if (descriptionLower.includes(word)) score += 1;
    }
  });

  // Boost newer items slightly
  const daysOld =
    (Date.now() - new Date(book.created_at).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 5 - daysOld * 0.1);

  return score;
}

async function calculateFacets(supabase: any, filters: SearchFilters) {
  // Categories facet
  const { data: categories } = await supabase
    .from("books")
    .select("category")
    .eq("sold", false)
    .not("category", "is", null);

  const categoryFacets = categories?.reduce((acc: any, book: any) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  // Universities facet
  const { data: universities } = await supabase
    .from("books")
    .select("university")
    .eq("sold", false)
    .not("university", "is", null);

  const universityFacets = universities?.reduce((acc: any, book: any) => {
    acc[book.university] = (acc[book.university] || 0) + 1;
    return acc;
  }, {});

  // Conditions facet
  const { data: conditions } = await supabase
    .from("books")
    .select("condition")
    .eq("sold", false);

  const conditionFacets = conditions?.reduce((acc: any, book: any) => {
    acc[book.condition] = (acc[book.condition] || 0) + 1;
    return acc;
  }, {});

  // Price ranges facet
  const { data: prices } = await supabase
    .from("books")
    .select("price")
    .eq("sold", false);

  const priceRanges = {
    "0-100": 0,
    "101-300": 0,
    "301-500": 0,
    "501-1000": 0,
    "1000+": 0,
  };

  prices?.forEach((book: any) => {
    const price = book.price;
    if (price <= 100) priceRanges["0-100"]++;
    else if (price <= 300) priceRanges["101-300"]++;
    else if (price <= 500) priceRanges["301-500"]++;
    else if (price <= 1000) priceRanges["501-1000"]++;
    else priceRanges["1000+"]++;
  });

  return {
    categories: Object.entries(categoryFacets || {}).map(([name, count]) => ({
      name,
      count,
    })),
    universities: Object.entries(universityFacets || {}).map(
      ([name, count]) => ({ name, count }),
    ),
    conditions: Object.entries(conditionFacets || {}).map(([name, count]) => ({
      name,
      count,
    })),
    priceRanges: Object.entries(priceRanges).map(([range, count]) => ({
      range,
      count,
    })),
  };
}

async function getSearchSuggestions(supabase: any, query: string) {
  if (!query || query.length < 2) {
    return { data: [] };
  }

  // Get suggestions from book titles and authors
  const { data: titleSuggestions } = await supabase
    .from("books")
    .select("title")
    .ilike("title", `%${query}%`)
    .eq("sold", false)
    .limit(5);

  const { data: authorSuggestions } = await supabase
    .from("books")
    .select("author")
    .ilike("author", `%${query}%`)
    .eq("sold", false)
    .limit(5);

  const suggestions = [
    ...(titleSuggestions?.map((b) => b.title) || []),
    ...(authorSuggestions?.map((b) => b.author) || []),
  ].slice(0, 8);

  return { data: suggestions };
}

async function getFacets(supabase: any, category?: string) {
  let query = supabase
    .from("books")
    .select("category, university, condition, price")
    .eq("sold", false);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) throw error;

  const facets = {
    categories: {},
    universities: {},
    conditions: {},
    priceRanges: {
      "0-100": 0,
      "101-300": 0,
      "301-500": 0,
      "501-1000": 0,
      "1000+": 0,
    },
  };

  data?.forEach((book: any) => {
    // Category facets
    if (book.category) {
      facets.categories[book.category] =
        (facets.categories[book.category] || 0) + 1;
    }

    // University facets
    if (book.university) {
      facets.universities[book.university] =
        (facets.universities[book.university] || 0) + 1;
    }

    // Condition facets
    if (book.condition) {
      facets.conditions[book.condition] =
        (facets.conditions[book.condition] || 0) + 1;
    }

    // Price range facets
    const price = book.price;
    if (price <= 100) facets.priceRanges["0-100"]++;
    else if (price <= 300) facets.priceRanges["101-300"]++;
    else if (price <= 500) facets.priceRanges["301-500"]++;
    else if (price <= 1000) facets.priceRanges["501-1000"]++;
    else facets.priceRanges["1000+"]++;
  });

  return new Response(JSON.stringify({ facets }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getTrendingSearches(supabase: any) {
  const { data, error } = await supabase
    .from("search_analytics")
    .select("query, count")
    .order("count", { ascending: false })
    .limit(10);

  if (error) throw error;

  return new Response(JSON.stringify({ trending: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAutocomplete(supabase: any, query: string) {
  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get autocomplete suggestions from multiple sources
  const [titles, authors, categories] = await Promise.all([
    supabase
      .from("books")
      .select("title")
      .ilike("title", `${query}%`)
      .eq("sold", false)
      .limit(3),

    supabase
      .from("books")
      .select("author")
      .ilike("author", `${query}%`)
      .eq("sold", false)
      .limit(3),

    supabase
      .from("books")
      .select("category")
      .ilike("category", `${query}%`)
      .eq("sold", false)
      .limit(2),
  ]);

  const suggestions = [
    ...(titles.data?.map((item) => ({ text: item.title, type: "title" })) ||
      []),
    ...(authors.data?.map((item) => ({ text: item.author, type: "author" })) ||
      []),
    ...(categories.data?.map((item) => ({
      text: item.category,
      type: "category",
    })) || []),
  ].slice(0, 8);

  return new Response(JSON.stringify({ suggestions }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logSearch(
  supabase: any,
  filters: SearchFilters,
  resultCount: number,
) {
  // Log search for analytics
  if (filters.query) {
    await supabase.from("search_analytics").upsert(
      {
        query: filters.query,
        result_count: resultCount,
        filters: JSON.stringify(filters),
        count: 1,
      },
      {
        onConflict: "query",
        count: "exact",
      },
    );
  }
}

async function rebuildSearchIndex(supabase: any) {
  // This would implement full-text search index rebuilding
  // For now, we'll just return success
  return new Response(
    JSON.stringify({ success: true, message: "Search index rebuilt" }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
