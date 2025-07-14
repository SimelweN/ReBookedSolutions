// Multi-seller cart types for the marketplace

export interface SellerCart {
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  subaccountCode?: string;
  items: CartItem[];
  subtotal: number;
  platformCommission: number;
  sellerReceives: number;
}

export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  quantity: number; // Always 1 for books
}

export interface MultiSellerCartState {
  carts: { [sellerId: string]: SellerCart };
  totalItems: number;
  totalValue: number;
  activeSellerId?: string; // For single-cart-at-a-time mode
}

export interface CourierQuote {
  courier: "fastway" | "courier-guy";
  serviceName: string;
  price: number;
  estimatedDays: number;
  description: string;
}

export interface CheckoutData {
  sellerId: string;
  sellerName: string;
  subaccountCode: string;
  items: CartItem[];
  subtotal: number;
  courierFee: number;
  total: number;
  courierQuote: CourierQuote;
  buyerAddress: DeliveryAddress;
  sellerAddress: DeliveryAddress;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  rating?: number;
  totalSales?: number;
  memberSince: string;
  pickupAddress?: DeliveryAddress;
  hasValidBanking: boolean;
  subaccountCode?: string;
}

export interface SellerBookListing {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  imageUrl: string;
  frontCover?: string;
  backCover?: string;
  grade?: string;
  universityYear?: string;
  availability: "available" | "sold" | "unavailable";
  createdAt: string;
}

export interface SellerMarketplace {
  profile: SellerProfile;
  books: SellerBookListing[];
  totalBooks: number;
  availableBooks: number;
}

// Cart operation types
export type CartOperation =
  | "add_to_cart"
  | "remove_from_cart"
  | "clear_seller_cart"
  | "clear_all_carts"
  | "switch_seller";

export interface CartOperationResult {
  success: boolean;
  message: string;
  newCart?: MultiSellerCartState;
}
