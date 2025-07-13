export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  book_id: string;
  amount: number; // in kobo (ZAR cents)
  delivery_option: "pickup" | "delivery";
  delivery_method?: string;
  tracking_number?: string;
  delivery_address?: any;
  paystack_reference: string;
  paystack_subaccount?: string;
  status:
    | "pending"
    | "paid"
    | "committed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status: "unpaid" | "paid" | "refunded";
  commit_deadline?: string;
  committed_at?: string;
  paid_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;

  // Optional joined data from relations
  book?: {
    title: string;
    author: string;
    imageUrl?: string;
  };
  buyer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
}

export interface Receipt {
  id: string;
  order_id: string;
  receipt_number: string;
  buyer_email: string;
  seller_email: string;
  receipt_data: any;
  generated_at: string;
  sent_to_buyer: boolean;
  sent_to_admin: boolean;
}

export interface OrderNotification {
  id: string;
  order_id: string;
  user_id: string;
  type:
    | "payment_success"
    | "commit_reminder"
    | "order_committed"
    | "order_cancelled"
    | "receipt_ready"
    | "order_shipped";
  title: string;
  message: string;
  read: boolean;
  sent_at: string;

  // Optional joined order data
  order?: {
    id: string;
    amount: number;
    status: string;
  };
}

export type OrderStatus = Order["status"];
export type PaymentStatus = Order["payment_status"];
export type NotificationType = OrderNotification["type"];
export type DeliveryOption = Order["delivery_option"];

// Helper types for order creation and updates
export interface CreateOrderData {
  buyer_id: string;
  seller_id: string;
  book_id: string;
  amount: number;
  delivery_option: DeliveryOption;
  delivery_address?: any;
  paystack_reference: string;
  paystack_subaccount?: string;
  metadata?: any;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  committed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  metadata?: any;
}
