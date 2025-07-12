import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  university?: string;
  province?: string;
  sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "relevance";
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
  condition: string;
  created_at: string;
  seller: {
    id: string;
    name: string;
    university?: string;
  };
  province?: string;
  category?: string;
}

/**
 * Search books with comprehensive filtering
 */
export const searchBooks = async (
  filters: SearchFilters,
  limit: number = 20,
  offset: number = 0,
): Promise<{
  books: SearchResult[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    let query = supabase
      .from("books")
      .select(
        `
        id,
        title,
        author,
        price,
        imageUrl,
        condition,
        created_at,
        province,
        category,
        seller:profiles!books_seller_id_fkey(
          id,
          name,
          university
        )
      `,
      )
      .eq("sold", false)
      .eq("available", true);

    // Text search
    if (filters.query) {
      const searchTerm = filters.query.trim();
      query = query.or(`
        title.ilike.%${searchTerm}%,
        author.ilike.%${searchTerm}%,
        category.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%
      `);
    }

    // Category filter
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    // Price range
    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // Condition filter
    if (filters.condition) {
      query = query.eq("condition", filters.condition);
    }

    // Province filter
    if (filters.province) {
      query = query.eq("province", filters.province);
    }

    // University filter (through seller profile)
    if (filters.university) {
      const { data: universityUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("university", filters.university);

      if (universityUsers && universityUsers.length > 0) {
        const userIds = universityUsers.map((u) => u.id);
        query = query.in("seller_id", userIds);
      }
    }

    // Sorting
    switch (filters.sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "price_low":
        query = query.order("price", { ascending: true });
        break;
      case "price_high":
        query = query.order("price", { ascending: false });
        break;
      default:
        // Default to newest first
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Get total count
    const countQuery = supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("sold", false)
      .eq("available", true);

    // Apply same filters to count query
    if (filters.query) {
      const searchTerm = filters.query.trim();
      countQuery.or(`
        title.ilike.%${searchTerm}%,
        author.ilike.%${searchTerm}%,
        category.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%
      `);
    }

    if (filters.category) {
      countQuery.eq("category", filters.category);
    }

    if (filters.minPrice !== undefined) {
      countQuery.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      countQuery.lte("price", filters.maxPrice);
    }

    if (filters.condition) {
      countQuery.eq("condition", filters.condition);
    }

    if (filters.province) {
      countQuery.eq("province", filters.province);
    }

    // Execute queries
    const [{ data: books, error: booksError }, { count, error: countError }] =
      await Promise.all([query.range(offset, offset + limit - 1), countQuery]);

    if (booksError) {
      console.error("Search books error:", booksError);
      throw new Error(`Search failed: ${booksError.message}`);
    }

    if (countError) {
      console.error("Count books error:", countError);
      // Continue without count if count fails
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return {
      books: books || [],
      total,
      hasMore,
    };
  } catch (error) {
    console.error("Error in searchBooks:", error);
    throw error;
  }
};

/**
 * Get popular search terms and categories
 */
export const getSearchSuggestions = async (): Promise<{
  categories: string[];
  universities: string[];
  authors: string[];
}> => {
  try {
    const [categoriesData, universitiesData, authorsData] = await Promise.all([
      // Get unique categories
      supabase
        .from("books")
        .select("category")
        .eq("sold", false)
        .not("category", "is", null),

      // Get unique universities from profiles
      supabase
        .from("profiles")
        .select("university")
        .not("university", "is", null),

      // Get popular authors
      supabase
        .from("books")
        .select("author")
        .eq("sold", false)
        .not("author", "is", null),
    ]);

    const categories = [
      ...new Set(
        categoriesData.data?.map((item) => item.category).filter(Boolean) || [],
      ),
    ].sort();

    const universities = [
      ...new Set(
        universitiesData.data?.map((item) => item.university).filter(Boolean) ||
          [],
      ),
    ].sort();

    const authors = [
      ...new Set(
        authorsData.data?.map((item) => item.author).filter(Boolean) || [],
      ),
    ]
      .sort()
      .slice(0, 20); // Limit to top 20 authors

    return {
      categories,
      universities,
      authors,
    };
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return {
      categories: [],
      universities: [],
      authors: [],
    };
  }
};

/**
 * Get trending searches and featured books
 */
export const getTrendingContent = async (): Promise<{
  trendingBooks: SearchResult[];
  featuredCategories: string[];
}> => {
  try {
    // Get recently added books as "trending"
    const { data: trendingBooks } = await supabase
      .from("books")
      .select(
        `
        id,
        title,
        author,
        price,
        imageUrl,
        condition,
        created_at,
        province,
        category,
        seller:profiles!books_seller_id_fkey(
          id,
          name,
          university
        )
      `,
      )
      .eq("sold", false)
      .eq("available", true)
      .order("created_at", { ascending: false })
      .limit(8);

    // Get categories with most books as "featured"
    const { data: categoryData } = await supabase
      .from("books")
      .select("category")
      .eq("sold", false)
      .not("category", "is", null);

    const categoryCounts =
      categoryData?.reduce((acc: Record<string, number>, book) => {
        if (book.category) {
          acc[book.category] = (acc[book.category] || 0) + 1;
        }
        return acc;
      }, {}) || {};

    const featuredCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([category]) => category);

    return {
      trendingBooks: trendingBooks || [],
      featuredCategories,
    };
  } catch (error) {
    console.error("Error getting trending content:", error);
    return {
      trendingBooks: [],
      featuredCategories: [],
    };
  }
};
