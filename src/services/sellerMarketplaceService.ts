import { supabase } from "@/integrations/supabase/client";
import { safeDbOperation } from "@/utils/databaseErrorHandler";
import {
  SellerProfile,
  SellerBookListing,
  SellerMarketplace,
} from "@/types/multiSellerCart";

export class SellerMarketplaceService {
  /**
   * Get seller profile by user ID
   */
  static async getSellerProfile(
    sellerId: string,
  ): Promise<SellerProfile | null> {
    if (!sellerId) {
      return null;
    }

    const { data, error } = await safeDbOperation(
      () =>
        supabase
          .from("profiles")
          .select(
            `
          id,
          name,
          email,
          bio,
          created_at,
          pickup_address,
          addresses_same
        `,
          )
          .eq("id", sellerId)
          .single(),
      "getSellerProfile",
      { showToast: false },
    );

    if (error || !data) {
      // If single() fails, try without single() to check if seller exists at all
      const { data: checkData } = await safeDbOperation(
        () =>
          supabase
            .from("profiles")
            .select("id, name")
            .eq("id", sellerId)
            .limit(1),
        "checkSellerExists",
        { showToast: false },
      );

      if (!checkData || checkData.length === 0) {
        return null;
      }

      // If seller exists but single() failed, return the first result
      if (checkData.length > 0) {
        return {
          id: checkData[0].id,
          name: checkData[0].name || "Unknown Seller",
          email: "",
          bio: null,
          profileImage: null,
          university: null,
          rating: 4.5,
          totalSales: 0,
          memberSince: new Date().toISOString(),
          pickupAddress: null,
          hasValidBanking: false,
          subaccountCode: null,
        };
      }

      return null;
    }

    // Check if seller has valid banking setup
    const { data: bankingData } = await safeDbOperation(
      () =>
        supabase
          .from("banking_details")
          .select("paystack_subaccount_code, account_verified")
          .eq("user_id", sellerId)
          .single(),
      "getSellerBanking",
      { showToast: false },
    );

    // Get seller statistics
    const { data: statsData } = await safeDbOperation(
      () =>
        supabase
          .from("books")
          .select("id, sold, created_at")
          .eq("seller_id", sellerId),
      "getSellerStats",
      { showToast: false },
    );

    const totalSales = statsData?.filter((book) => book.sold).length || 0;
    const totalBooks = statsData?.length || 0;

    return {
      id: data.id,
      name: data.name || "Unknown Seller",
      email: data.email,
      bio: data.bio,
      rating: 4.5, // TODO: Implement rating system
      totalSales,
      memberSince: data.created_at,
      pickupAddress: data.pickup_address,
      hasValidBanking:
        !!bankingData?.paystack_subaccount_code &&
        !!bankingData?.account_verified,
      subaccountCode: bankingData?.paystack_subaccount_code,
    };
  }

  /**
   * Get seller's book listings
   */
  static async getSellerBooks(
    sellerId: string,
    filters?: {
      category?: string;
      condition?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      availability?: string;
    },
  ): Promise<SellerBookListing[]> {
    let query = supabase
      .from("books")
      .select(
        `
        id,
        title,
        author,
        description,
        price,
        category,
        condition,
        image_url,
        front_cover,
        back_cover,
        grade,
        university_year,
        sold,
        availability,
        created_at
      `,
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.condition) {
      query = query.eq("condition", filters.condition);
    }

    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`,
      );
    }

    if (filters?.availability) {
      if (filters.availability === "available") {
        query = query.eq("sold", false);
      } else if (filters.availability === "sold") {
        query = query.eq("sold", true);
      }
    } else {
      // Default: only show available books
      query = query.eq("sold", false);
    }

    const { data, error } = await safeDbOperation(
      () => query,
      "getSellerBooks",
      { showToast: false },
    );

    if (error || !data) {
      return [];
    }

    return data.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      category: book.category,
      condition: book.condition,
      imageUrl: book.image_url || book.front_cover || "",
      frontCover: book.front_cover,
      backCover: book.back_cover,
      grade: book.grade,
      universityYear: book.university_year,
      availability: book.sold ? "sold" : book.availability || "available",
      createdAt: book.created_at,
    }));
  }

  /**
   * Get complete seller marketplace (profile + books)
   */
  static async getSellerMarketplace(
    sellerId: string,
    bookFilters?: {
      category?: string;
      condition?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    },
  ): Promise<SellerMarketplace | null> {
    try {
      // Get profile and books in parallel
      const [profile, books] = await Promise.all([
        this.getSellerProfile(sellerId),
        this.getSellerBooks(sellerId, bookFilters),
      ]);

      if (!profile) {
        return null;
      }

      return {
        profile,
        books,
        totalBooks: books.length,
        availableBooks: books.filter(
          (book) => book.availability === "available",
        ).length,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Search sellers by name or university
   */
  static async searchSellers(query: string): Promise<SellerProfile[]> {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await safeDbOperation(
      () =>
        supabase
          .from("profiles")
          .select(
            `
          id,
          name,
          email,
          bio,
          created_at
        `,
          )
          .ilike("name", `%${query}%`)
          .limit(20),
      "searchSellers",
      { showToast: false },
    );

    if (error || !data) {
      return [];
    }

    // Filter to only sellers who have books
    const sellersWithBooks = [];
    for (const seller of data) {
      const { data: bookCount } = await safeDbOperation(
        () =>
          supabase
            .from("books")
            .select("id", { count: "exact", head: true })
            .eq("seller_id", seller.id)
            .eq("sold", false),
        "checkSellerBooks",
        { showToast: false },
      );

      if (bookCount && bookCount > 0) {
        sellersWithBooks.push({
          id: seller.id,
          name: seller.name || "Unknown Seller",
          email: seller.email,
          bio: seller.bio,
          rating: 4.5, // TODO: Implement rating system
          totalSales: 0, // Will be calculated separately if needed
          memberSince: seller.created_at,
          hasValidBanking: true, // Assume true for now
        });
      }
    }

    return sellersWithBooks;
  }

  /**
   * Get seller by username (if username field exists)
   */
  static async getSellerByUsername(
    username: string,
  ): Promise<SellerProfile | null> {
    // For now, try to find by name since username field doesn't exist
    const { data, error } = await safeDbOperation(
      () =>
        supabase
          .from("profiles")
          .select(
            `
          id,
          name,
          email,
          bio,
          created_at,
          pickup_address
        `,
          )
          .ilike("name", `%${username}%`)
          .limit(1)
          .single(),
      "getSellerByUsername",
      { showToast: false },
    );

    if (error || !data) {
      return null;
    }

    return this.getSellerProfile(data.id);
  }

  /**
   * Get featured/popular sellers
   */
  static async getFeaturedSellers(
    limit: number = 10,
  ): Promise<SellerProfile[]> {
    // Get sellers with most books or recent activity
    const { data, error } = await safeDbOperation(
      () =>
        supabase
          .from("profiles")
          .select(
            `
          id,
          name,
          email,
          bio,
          created_at
        `,
          )
          .not("name", "is", null)
          .limit(limit * 2), // Get more to filter
      "getFeaturedSellers",
      { showToast: false },
    );

    if (error || !data) {
      return [];
    }

    // Get sellers with book counts
    const sellersWithCounts = await Promise.all(
      data.map(async (seller) => {
        const { data: bookCount } = await safeDbOperation(
          () =>
            supabase
              .from("books")
              .select("id", { count: "exact", head: true })
              .eq("seller_id", seller.id)
              .eq("sold", false),
          "getSellerBookCount",
          { showToast: false },
        );

        return {
          ...seller,
          bookCount: bookCount || 0,
        };
      }),
    );

    // Filter and sort by book count
    return sellersWithCounts
      .filter((seller) => seller.bookCount > 0)
      .sort((a, b) => b.bookCount - a.bookCount)
      .slice(0, limit)
      .map((seller) => ({
        id: seller.id,
        name: seller.name || "Unknown Seller",
        email: seller.email,
        bio: seller.bio,
        rating: 4.5,
        totalSales: 0,
        memberSince: seller.created_at,
        hasValidBanking: true,
      }));
  }

  /**
   * Get seller's delivery address for courier calculations
   */
  static async getSellerDeliveryAddress(sellerId: string): Promise<any> {
    const profile = await this.getSellerProfile(sellerId);

    if (!profile?.pickupAddress) {
      // Return default address if seller doesn't have one
      return {
        street: "University of Cape Town",
        city: "Cape Town",
        province: "Western Cape",
        postal_code: "7700",
        country: "South Africa",
      };
    }

    return {
      street:
        profile.pickupAddress.streetAddress || profile.pickupAddress.street,
      city: profile.pickupAddress.city,
      province: profile.pickupAddress.province,
      postal_code:
        profile.pickupAddress.postalCode || profile.pickupAddress.postal_code,
      country: "South Africa",
    };
  }
}
