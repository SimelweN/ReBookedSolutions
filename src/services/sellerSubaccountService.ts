import { supabase } from "@/integrations/supabase/client";

/**
 * Utility service for managing seller subaccount relationships with books
 * This ensures consistent retrieval of seller payment details across the system
 */
export class SellerSubaccountService {
  /**
   * Get seller's subaccount code from banking_subaccounts table
   */
  static async getSellerSubaccount(sellerId: string): Promise<string | null> {
    try {
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", sellerId)
        .single();

      if (error) {
        console.warn(`No subaccount found for seller ${sellerId}:`, error);
        return null;
      }

      return subaccountData?.subaccount_code || null;
    } catch (error) {
      console.error("Error fetching seller subaccount:", error);
      return null;
    }
  }

  /**
   * Get subaccount codes for multiple sellers (used in cart with multiple sellers)
   */
  static async getMultipleSellerSubaccounts(
    sellerIds: string[],
  ): Promise<Record<string, string>> {
    try {
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("user_id, subaccount_code")
        .in("user_id", sellerIds);

      if (error) {
        console.error("Error fetching multiple seller subaccounts:", error);
        return {};
      }

      const subaccounts: Record<string, string> = {};
      subaccountData?.forEach((data) => {
        if (data.subaccount_code) {
          subaccounts[data.user_id] = data.subaccount_code;
        }
      });

      return subaccounts;
    } catch (error) {
      console.error("Error in getMultipleSellerSubaccounts:", error);
      return {};
    }
  }

  /**
   * Get book details with seller subaccount information
   */
  static async getBookWithSellerSubaccount(bookId: string): Promise<{
    book: any;
    sellerSubaccount: string | null;
  } | null> {
    try {
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        console.error("Book not found:", bookError);
        return null;
      }

      // Use direct subaccount_code from book if available, fallback to seller lookup
      let sellerSubaccount = book.subaccount_code;

      if (!sellerSubaccount) {
        console.warn(
          "Book missing direct subaccount_code, falling back to seller lookup",
        );
        sellerSubaccount = await this.getSellerSubaccount(book.seller_id);
      }

      return {
        book,
        sellerSubaccount,
      };
    } catch (error) {
      console.error("Error getting book with seller subaccount:", error);
      return null;
    }
  }

  /**
   * Validate that a seller has a valid subaccount before allowing book operations
   */
  static async validateSellerSubaccount(sellerId: string): Promise<{
    isValid: boolean;
    subaccountCode: string | null;
    message: string;
  }> {
    try {
      const subaccountCode = await this.getSellerSubaccount(sellerId);

      if (!subaccountCode) {
        return {
          isValid: false,
          subaccountCode: null,
          message:
            "Seller has not completed banking setup. Cannot process payments.",
        };
      }

      return {
        isValid: true,
        subaccountCode,
        message: "Seller subaccount is valid.",
      };
    } catch (error) {
      return {
        isValid: false,
        subaccountCode: null,
        message: "Error validating seller subaccount.",
      };
    }
  }

  /**
   * Get all books for a seller along with their subaccount status
   */
  static async getSellerBooksWithSubaccountStatus(sellerId: string): Promise<{
    books: any[];
    hasSubaccount: boolean;
    subaccountCode: string | null;
  }> {
    try {
      const [booksResult, subaccountCode] = await Promise.all([
        supabase
          .from("books")
          .select("*")
          .eq("seller_id", sellerId)
          .order("created_at", { ascending: false }),
        this.getSellerSubaccount(sellerId),
      ]);

      const { data: books = [], error: booksError } = booksResult;

      if (booksError) {
        console.error("Error fetching seller books:", booksError);
      }

      return {
        books,
        hasSubaccount: !!subaccountCode,
        subaccountCode,
      };
    } catch (error) {
      console.error("Error in getSellerBooksWithSubaccountStatus:", error);
      return {
        books: [],
        hasSubaccount: false,
        subaccountCode: null,
      };
    }
  }

  /**
   * Link a new book to the seller's current subaccount (updates subaccount_code column)
   */
  static async linkBookToSellerSubaccount(
    bookId: string,
    sellerId: string,
  ): Promise<boolean> {
    try {
      // Verify seller has subaccount
      const validation = await this.validateSellerSubaccount(sellerId);

      if (!validation.isValid) {
        console.error(
          "Cannot link book to seller without valid subaccount:",
          validation.message,
        );
        return false;
      }

      // Update book's subaccount_code column directly
      const { error } = await supabase
        .from("books")
        .update({ subaccount_code: validation.subaccountCode })
        .eq("id", bookId)
        .eq("seller_id", sellerId); // Security check

      if (error) {
        console.error("Error updating book subaccount_code:", error);
        return false;
      }

      console.log(
        `✅ Book ${bookId} directly linked to subaccount ${validation.subaccountCode}`,
      );

      return true;
    } catch (error) {
      console.error("Error linking book to seller subaccount:", error);
      return false;
    }
  }
}

export default SellerSubaccountService;
