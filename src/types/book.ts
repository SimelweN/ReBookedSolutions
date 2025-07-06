export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Good" | "Better" | "Average" | "Below Average";
  imageUrl: string;
  frontCover?: string;
  backCover?: string;
  insidePages?: string;
  sold: boolean;
  availability?: "available" | "unavailable" | "sold";
  createdAt: string;
  grade?: string;
  universityYear?: string;
  university?: string;
  province?: string;
  subaccountCode?: string; // Direct link to seller's Paystack subaccount
  seller: {
    id: string;
    name: string;
    email: string;
    hasAddress?: boolean;
    hasSubaccount?: boolean;
    isReadyForOrders?: boolean;
  };
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Good" | "Better" | "Average" | "Below Average";
  imageUrl: string;
  frontCover?: string;
  backCover?: string;
  insidePages?: string;
  grade?: string;
  universityYear?: string;
  university?: string;
  province?: string;
}
