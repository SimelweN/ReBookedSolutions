import { Book } from "@/types/book";
import { BookQueryResult } from "./bookTypes";

export const mapBookFromDatabase = (bookData: BookQueryResult): Book => {
  const profile = bookData.profiles;

  console.log("Mapping book data:", bookData);
  console.log("Profile data:", profile);

  // Ensure we have required fields
  if (!bookData.id || !bookData.seller_id) {
    throw new Error("Invalid book data: missing required fields");
  }

  return {
    id: bookData.id,
    title: bookData.title || "Unknown Title",
    author: bookData.author || "Unknown Author",
    description: bookData.description || "",
    price: bookData.price || 0,
    category: bookData.category || "Other",
    condition:
      (bookData.condition as
        | "New"
        | "Good"
        | "Better"
        | "Average"
        | "Below Average") || "Good",
    imageUrl:
      bookData.front_cover ||
      bookData.image_url ||
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&auto=format&q=80",
    frontCover: bookData.front_cover,
    backCover: bookData.back_cover,
    insidePages: bookData.inside_pages,
    sold: bookData.sold || false,
    availability:
      bookData.availability || (bookData.sold ? "sold" : "available"),
    createdAt: bookData.created_at || new Date().toISOString(),
    grade: bookData.grade,
    universityYear: bookData.university_year,
    university: bookData.university,
    province: bookData.province || null,
    subaccountCode: bookData.subaccount_code,
    // Seller address data for efficient checkout
    seller_street: (bookData as any).seller_street,
    seller_city: (bookData as any).seller_city,
    seller_province: (bookData as any).seller_province,
    seller_postal_code: (bookData as any).seller_postal_code,
    seller_country: (bookData as any).seller_country,
    seller_subaccount_code: (bookData as any).seller_subaccount_code,
    seller: {
      id: bookData.seller_id,
      name: profile?.name || `User ${bookData.seller_id.slice(0, 8)}`,
      email: profile?.email || "",
      hasAddress: !!(
        (bookData as any).seller_street &&
        (bookData as any).seller_city &&
        (bookData as any).seller_province &&
        (bookData as any).seller_postal_code
      ),
      hasSubaccount: !!(
        (bookData as any).seller_subaccount_code || bookData.subaccount_code
      ),
      isReadyForOrders: !!(
        ((bookData as any).seller_subaccount_code ||
          bookData.subaccount_code) &&
        (bookData as any).seller_street &&
        (bookData as any).seller_city &&
        (bookData as any).seller_province &&
        (bookData as any).seller_postal_code
      ),
    },
  };
};
