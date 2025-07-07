import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Package,
  MapPin,
  Truck,
  Clock,
  Phone,
  Mail,
  Download,
  Receipt,
} from "lucide-react";
import ReceiptDownloader from "@/components/receipt/ReceiptDownloader";
import { OrderData } from "@/services/paystackPaymentService";
import { useUserOrders } from "@/hooks/useUserOrders";
import { toast } from "sonner";

interface PostPaymentOrderSummaryProps {
  paymentReference: string;
  orderData?: Partial<OrderData>;
  onClose?: () => void;
}

const PostPaymentOrderSummary: React.FC<PostPaymentOrderSummaryProps> = ({
  paymentReference,
  orderData,
  onClose,
}) => {
  const navigate = useNavigate();
  const { getOrderByReference } = useUserOrders();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [paymentReference]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch the order using payment reference
      const foundOrder = await getOrderByReference(paymentReference);

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // If order not found, use the order data passed as prop
        if (orderData) {
          setOrder(orderData as OrderData);
        } else {
          setError("Order details not found");
          toast.error("Could not find order details");
        }
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      setError("Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReceipt = () => {
    setShowReceipt(!showReceipt);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your order summary...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={() => navigate("/my-orders")}>
              View All Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700">
              Your order has been confirmed and the seller has been notified.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-sm">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-medium mb-3">Books Purchased</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.author && (
                      <p className="text-sm text-gray-600">by {item.author}</p>
                    )}
                    {item.isbn && (
                      <p className="text-xs text-gray-500">ISBN: {item.isbn}</p>
                    )}
                    {item.condition && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.condition}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R{(item.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                R
                {(
                  (order.amount -
                    (order.delivery_data?.delivery_fee ||
                      order.delivery_fee ||
                      0)) /
                  100
                ).toFixed(2)}
              </span>
            </div>
            {(order.delivery_data?.delivery_fee || order.delivery_fee) && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>
                  R
                  {(
                    (order.delivery_data?.delivery_fee || order.delivery_fee) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Paid</span>
              <span>R{(order.amount / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.delivery_address ||
          order.shipping_address ||
          order.delivery_data?.delivery_address ? (
            <div>
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  {(() => {
                    const address =
                      order.delivery_address ||
                      order.shipping_address ||
                      order.delivery_data?.delivery_address;
                    return (
                      <p className="text-sm text-gray-600">
                        {address.street || address.address_line_1}
                        <br />
                        {address.city}, {address.province || address.state}
                        <br />
                        {address.postal_code || address.zip_code}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-2">Collection Required</p>
              <p className="text-sm text-gray-600">
                You will need to arrange collection directly with the seller.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              What happens next?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Seller has 48 hours to prepare your book for collection
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Courier will collect and deliver to your address
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                You'll receive email updates on the status
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact support if you have any questions
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Download */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Download Receipt</h3>
            </div>
            <Button
              onClick={toggleReceipt}
              variant="outline"
              size="sm"
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              {showReceipt ? "Hide" : "Show"} Receipt
            </Button>
          </div>

          {showReceipt && order && (
            <ReceiptDownloader
              reference={order.paystack_ref || paymentReference}
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
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
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

      {/* Contact Information */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 text-center">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@rebookedsolutions.co.za"
              className="text-blue-600 hover:underline"
            >
              support@rebookedsolutions.co.za
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostPaymentOrderSummary;
