import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import { toast } from "sonner";

export interface UseUserOrdersResult {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getOrderByReference: (reference: string) => Promise<OrderData | null>;
}

export const useUserOrders = (): UseUserOrdersResult => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.email) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userOrders = await PaystackPaymentService.getUserOrders(user.email);
      setOrders(userOrders);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);

      // Show toast only if it's not a missing table error
      if (
        !errorMessage.includes("does not exist") &&
        !errorMessage.includes("missing")
      ) {
        toast.error("Failed to load orders");
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrderByReference = async (
    reference: string,
  ): Promise<OrderData | null> => {
    if (!user?.email) return null;

    try {
      return await PaystackPaymentService.getUserOrder(user.email, reference);
    } catch (err) {
      console.error("Error fetching order by reference:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.email]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    getOrderByReference,
  };
};

export default useUserOrders;
