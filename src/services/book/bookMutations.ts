import { supabase } from "@/integrations/supabase/client";
import { Book, BookFormData } from "@/types/book";
import { mapBookFromDatabase } from "./bookMapper";
import { handleBookServiceError } from "./bookErrorHandler";
import { BookQueryResult } from "./bookTypes";
import { ActivityService } from "@/services/activityService";
import { PaystackSubaccountService } from "@/services/paystackSubaccountService";

export const createBook = async (bookData: BookFormData): Promise<Book> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
      throw new Error(
        "Failed to verify user authentication. Please log in again.",
      );
    }

    if (!user) {
      throw new Error(
        "User not authenticated. Please log in to create a book listing.",
      );
    }

    // Verify user has valid subaccount before allowing book creation
    const subaccountValidation =
      await PaystackSubaccountService.validateSubaccount(user.id);

    if (!subaccountValidation.isValid) {
      throw new Error(subaccountValidation.message);
    }

    // Get the user's subaccount code for direct linking
    const userSubaccountCode = subaccountValidation.subaccountCode;

    // Fetch seller address data from user's pickup address
    let province = null;
    let sellerAddress = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("pickup_address")
        .eq("id", user.id)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          // No profile found - this is okay, continue without address
          console.log("No profile found for user, continuing without address");
        } else {
          console.warn(
            "Error fetching user profile for address:",
            profileError,
          );
          // Continue without address - it's not critical for book creation
        }
      } else if (profileData?.pickup_address) {
        // Extract seller address data for book table
        const pickupAddress = profileData.pickup_address as any;
        if (pickupAddress && typeof pickupAddress === "object") {
          sellerAddress = {
            street: pickupAddress.streetAddress || pickupAddress.street || "",
            city: pickupAddress.city || "",
            province: pickupAddress.province || "",
            postal_code:
              pickupAddress.postalCode || pickupAddress.postal_code || "",
            country: "South Africa",
          };
          province = pickupAddress.province;
        } else if (typeof pickupAddress === "string") {
          // If pickup_address is a string, try to extract province from it
          // This is a fallback for older address formats
          const addressStr = pickupAddress.toLowerCase();
          if (addressStr.includes("western cape")) province = "Western Cape";
          else if (addressStr.includes("gauteng")) province = "Gauteng";
          else if (addressStr.includes("kwazulu")) province = "KwaZulu-Natal";
          else if (addressStr.includes("eastern cape"))
            province = "Eastern Cape";
          else if (addressStr.includes("free state")) province = "Free State";
          else if (addressStr.includes("limpopo")) province = "Limpopo";
          else if (addressStr.includes("mpumalanga")) province = "Mpumalanga";
          else if (addressStr.includes("northern cape"))
            province = "Northern Cape";
          else if (addressStr.includes("north west")) province = "North West";
        }
      }
    } catch (addressError) {
      console.warn("Could not fetch user address:", addressError);
      // Continue without address - it's not critical for book creation
    }

    // Create book data with subaccount_code (only use existing database fields)
    const bookDataWithSubaccount = {
      seller_id: user.id,
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: bookData.price,
      category: bookData.category,
      condition: bookData.condition,
      image_url: bookData.imageUrl,
      front_cover: bookData.frontCover,
      back_cover: bookData.backCover,
      inside_pages: bookData.insidePages,
      grade: bookData.grade,
      university_year: bookData.universityYear,
      province: province,
      subaccount_code: userSubaccountCode, // Direct link to seller's subaccount
    };

    // Log seller data inclusion
    if (sellerAddress) {
      console.log("📍 Seller address included in book data:", sellerAddress);
      console.log("💡 Book now contains all seller data needed for checkout");
    }

    const { data: book, error } = await supabase
      .from("books")
      .insert([bookDataWithSubaccount])
      .select()
      .single();

    if (error) {
      console.error("Error creating book:", error.message || String(error));

      // Enhanced error handling with specific error types
      if (error.code === "23505") {
        throw new Error(
          "A book with similar details already exists. Please check your listings.",
        );
      } else if (error.code === "23502") {
        throw new Error(
          "Missing required book information. Please fill in all required fields.",
        );
      } else if (error.code === "42P01") {
        throw new Error("Database table not found. Please contact support.");
      } else if (error.message?.includes("permission")) {
        throw new Error(
          "You don't have permission to create books. Please contact support.",
        );
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("timeout")
      ) {
        throw new Error(
          "Network error. Please check your connection and try again.",
        );
      }

      handleBookServiceError(error, "create book");
    }

    // Fetch seller profile with error handling
    const { data: seller, error: sellerError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", user.id)
      .single();

    if (sellerError) {
      console.warn("Could not fetch seller profile:", sellerError);
      // Continue without seller profile - book creation was successful
    }

    const bookWithProfile: BookQueryResult = {
      ...book,
      profiles: seller
        ? {
            id: seller.id,
            name: seller.name,
            email: seller.email,
          }
        : null,
    };

    const mappedBook = mapBookFromDatabase(bookWithProfile);

    // Book is now directly linked to seller's subaccount and contains seller address
    console.log(
      `✅ Book ${book.id} created with seller data - subaccount: ${userSubaccountCode}, address: ${sellerAddress ? "included" : "not available"}`,
    );

    // Log activity for book listing
    try {
      await ActivityService.logBookListing(
        user.id,
        book.id,
        bookData.title,
        bookData.price,
      );
      console.log("✅ Activity logged for book listing:", book.id);
    } catch (activityError) {
      console.warn(
        "⚠️ Failed to log activity for book listing:",
        activityError,
      );
      // Don't throw here - book creation was successful, activity logging is secondary
    }

    return mappedBook;
  } catch (error) {
    console.error(
      "Error in createBook:",
      error instanceof Error ? error.message : String(error),
    );
    handleBookServiceError(error, "create book");
    throw error; // This line will never be reached due to handleBookServiceError throwing, but TypeScript needs it
  }
};

export const updateBook = async (
  bookId: string,
  bookData: Partial<BookFormData>,
): Promise<Book | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
      throw new Error(
        "Failed to verify user authentication. Please log in again.",
      );
    }

    if (!user) {
      throw new Error(
        "User not authenticated. Please log in to update your book.",
      );
    }

    // First verify the user owns this book
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("seller_id")
      .eq("id", bookId)
      .single();

    if (fetchError) {
      console.error("Error fetching book for update:", fetchError);
      if (fetchError.code === "PGRST116") {
        throw new Error("Book not found. It may have been deleted.");
      } else if (fetchError.code === "42P01") {
        throw new Error("Database table not found. Please contact support.");
      } else {
        throw new Error("Failed to fetch book details. Please try again.");
      }
    }

    if (!existingBook) {
      throw new Error("Book not found. It may have been deleted.");
    }

    if (existingBook.seller_id !== user.id) {
      throw new Error("You are not authorized to edit this book.");
    }

    const updateData: any = {};

    if (bookData.title !== undefined) updateData.title = bookData.title;
    if (bookData.author !== undefined) updateData.author = bookData.author;
    if (bookData.description !== undefined)
      updateData.description = bookData.description;
    if (bookData.price !== undefined) updateData.price = bookData.price;
    if (bookData.category !== undefined)
      updateData.category = bookData.category;
    if (bookData.condition !== undefined)
      updateData.condition = bookData.condition;
    if (bookData.imageUrl !== undefined)
      updateData.image_url = bookData.imageUrl;
    if (bookData.frontCover !== undefined)
      updateData.front_cover = bookData.frontCover;
    if (bookData.backCover !== undefined)
      updateData.back_cover = bookData.backCover;
    if (bookData.insidePages !== undefined)
      updateData.inside_pages = bookData.insidePages;
    if (bookData.grade !== undefined) updateData.grade = bookData.grade;
    if (bookData.universityYear !== undefined)
      updateData.university_year = bookData.universityYear;

    const { data: book, error } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", bookId)
      .select()
      .single();

    if (error) {
      console.error("Error updating book:", error.message || String(error));
      handleBookServiceError(error, "update book");
    }

    // Fetch seller profile
    const { data: seller } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", book.seller_id)
      .single();

    const bookWithProfile: BookQueryResult = {
      ...book,
      profiles: seller
        ? {
            id: seller.id,
            name: seller.name,
            email: seller.email,
          }
        : null,
    };

    return mapBookFromDatabase(bookWithProfile);
  } catch (error) {
    console.error(
      "Error in updateBook:",
      error instanceof Error ? error.message : String(error),
    );
    handleBookServiceError(error, "update book");
    return null; // This line will never be reached due to handleBookServiceError throwing, but TypeScript needs it
  }
};

export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
      throw new Error(
        "Failed to verify user authentication. Please log in again.",
      );
    }

    if (!user) {
      throw new Error(
        "User not authenticated. Please log in to delete your book.",
      );
    }

    console.log("Attempting to delete book:", bookId);

    // First verify the user owns this book or is an admin
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("seller_id, title")
      .eq("id", bookId)
      .single();

    if (fetchError) {
      console.error("Error fetching book for deletion:", fetchError);
      if (fetchError.code === "PGRST116") {
        throw new Error("Book not found. It may have already been deleted.");
      } else if (fetchError.code === "42P01") {
        throw new Error("Database table not found. Please contact support.");
      } else {
        throw new Error("Failed to fetch book details. Please try again.");
      }
    }

    if (!existingBook) {
      throw new Error("Book not found. It may have already been deleted.");
    }

    // Check if user is admin with error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn(
        "Could not fetch user profile for admin check:",
        profileError,
      );
      // Continue with owner check only
    }

    const isAdmin = profile?.is_admin || false;
    const isOwner = existingBook.seller_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("User not authorized to delete this book");
    }

    console.log("User authorized to delete book. Proceeding with deletion...");

    // Delete related records first to maintain referential integrity
    // Delete any reports related to this book
    const { error: reportsDeleteError } = await supabase
      .from("reports")
      .delete()
      .eq("book_id", bookId);

    if (reportsDeleteError) {
      console.warn("Error deleting related reports:", reportsDeleteError);
      // Continue with deletion even if reports cleanup fails
    }

    // Delete any transactions related to this book
    const { error: transactionsDeleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("book_id", bookId);

    if (transactionsDeleteError) {
      console.warn(
        "Error deleting related transactions:",
        transactionsDeleteError,
      );
      // Continue with deletion even if transactions cleanup fails
    }

    // Finally delete the book itself
    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (deleteError) {
      console.error(
        "Error deleting book:",
        deleteError.message || String(deleteError),
      );
      throw new Error(`Failed to delete book: ${deleteError.message}`);
    }

    console.log("Book deleted successfully:", existingBook.title);
  } catch (error) {
    console.error(
      "Error in deleteBook:",
      error instanceof Error ? error.message : String(error),
    );
    handleBookServiceError(error, "delete book");
    throw error; // This line will never be reached due to handleBookServiceError throwing, but TypeScript needs it
  }
};
