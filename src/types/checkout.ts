export interface CheckoutBook {
  id: string;
  title: string;
  author: string;
  price: number;
  condition: string;
  isbn?: string;
  image_url?: string;
  seller_id: string;
  seller_name?: string;
  seller_subaccount_code?: string;
}

export interface CheckoutAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface DeliveryOption {
  courier: "fastway" | "courier-guy";
  service_name: string;
  price: number;
  estimated_days: number;
  description: string;
  zone_type: "local" | "provincial" | "national";
}

export interface CheckoutStep {
  current: 1 | 2 | 3 | 4 | 5;
  completed: number[];
}

export interface OrderSummary {
  book: CheckoutBook;
  delivery: DeliveryOption;
  buyer_address: CheckoutAddress;
  seller_address: CheckoutAddress;
  book_price: number;
  delivery_price: number;
  total_price: number;
}

export interface CheckoutState {
  step: CheckoutStep;
  book: CheckoutBook | null;
  buyer_address: CheckoutAddress | null;
  seller_address: CheckoutAddress | null;
  delivery_options: DeliveryOption[];
  selected_delivery: DeliveryOption | null;
  order_summary: OrderSummary | null;
  loading: boolean;
  error: string | null;
}

export interface OrderConfirmation {
  order_id: string;
  payment_reference: string;
  book_id: string;
  seller_id: string;
  buyer_id: string;
  book_title: string;
  book_price: number;
  delivery_method: string;
  delivery_price: number;
  total_paid: number;
  created_at: string;
  status: "pending" | "completed" | "failed";
}
