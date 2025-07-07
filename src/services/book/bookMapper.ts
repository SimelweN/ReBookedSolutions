import { Book } from "@/types/book";
import { BookQueryResult } from "./bookTypes";

export const mapBookFromDatabase = (
  bookData: BookQueryResult,
  sellerProfile?: any,
): Book => {
  const profile = bookData.profiles || sellerProfile;

  console.log("Mapping book data:", bookData);
  console.log("Profile data:", profile);

  // Ensure we have required fields
  if (!bookData.id || !bookData.seller_id) {
    throw new Error("Invalid book data: missing required fields");
  }

  // Determine if seller has address (check for pickup_address in profile)
  const hasPickupAddress = !!(
    profile?.pickup_address &&
    ((typeof profile.pickup_address === "object" &&
      profile.pickup_address.streetAddress &&
      profile.pickup_address.city &&
      profile.pickup_address.province &&
      profile.pickup_address.postalCode) ||
      (typeof profile.pickup_address === "string" &&
        profile.pickup_address.length > 10))
  );

  console.log("🏠 [bookMapper] Address validation:", {
    sellerId: bookData.seller_id,
    hasProfilePickupAddress: !!profile?.pickup_address,
    pickupAddressType: typeof profile?.pickup_address,
    pickupAddressData: profile?.pickup_address,
    hasPickupAddress,
  });

  const mappedBook = {
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
    frontCover: bookData.front_cover || undefined,
    backCover: bookData.back_cover || undefined,
    insidePages: bookData.inside_pages || undefined,
    sold: bookData.sold || false,
    availability:
      bookData.availability || (bookData.sold ? "sold" : "available"),
    createdAt: bookData.created_at || new Date().toISOString(),
    grade: bookData.grade || undefined,
    universityYear: bookData.university_year || undefined,
    university: bookData.university || undefined,
    province: bookData.province || undefined,
    subaccountCode: bookData.subaccount_code || undefined,
    // Seller address data for efficient checkout (will be null until migration is applied)
    seller_street: undefined,
    seller_city: undefined,
    seller_province: undefined,
    seller_postal_code: undefined,
    seller_country: undefined,
    seller_subaccount_code: bookData.subaccount_code || undefined, // Use existing field
    seller: {
      id: bookData.seller_id,
      name:
        profile?.name || `User ${bookData.seller_id?.slice(0, 8) || "Unknown"}`,
      email: profile?.email || "",
      hasAddress: hasPickupAddress,
      hasSubaccount: !!bookData.subaccount_code,
      isReadyForOrders: !!(bookData.subaccount_code && hasPickupAddress),
    },
  };

  console.log("🗂️ [bookMapper] Mapped book:", mappedBook);
  return mappedBook;
};
