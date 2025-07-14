import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReceiptDownloader from "@/components/receipt/ReceiptDownloader";
import { useUserOrders } from "@/hooks/useUserOrders";
import { OrderData } from "@/services/paystackPaymentService";
import { toast } from "sonner";

const ReceiptPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { getOrderByReference } = useUserOrders();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reference) {
      loadOrderDetails();
    } else {
      setError("No payment reference provided");
      setIsLoading(false);
    }
  }, [reference]);

  const loadOrderDetails = async () => {
    if (!reference) return;

    try {
      setIsLoading(true);
      setError(null);

      const foundOrder = await getOrderByReference(reference);

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError("Order not found for this payment reference");
        toast.error("Order not found");
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      setError("Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading receipt...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="text-center mt-6 space-y-4">
              <Button onClick={() => navigate("/my-orders")}>
                View All Orders
              </Button>
              <Button onClick={() => navigate("/")} variant="outline">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Receipt</h1>
            <p className="text-gray-600">Payment Reference: {reference}</p>
          </div>
        </div>

        {/* Receipt */}
        <Card>
          <CardHeader>
            <CardTitle>Download Your Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiptDownloader
              reference={order.paystack_ref || reference || ""}
              amount={order.amount / 100}
              items={order.items.map((item) => ({
                id: item.id || item.book_id,
                title: item.title,
                author: item.author,
                price: item.price / 100,
              }))}
              buyer={order.buyer_info}
              seller={order.seller_info}
              deliveryMethod={order.delivery_method || "Standard Delivery"}
              deliveryFee={order.delivery_fee ? order.delivery_fee / 100 : 0}
              deliveryAddress={order.delivery_address || order.shipping_address}
              timestamp={order.created_at}
            />
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="flex gap-4">
          <Button onClick={() => navigate("/my-orders")} className="flex-1">
            View All Orders
          </Button>
          <Button
            onClick={() => navigate("/books")}
            variant="outline"
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
