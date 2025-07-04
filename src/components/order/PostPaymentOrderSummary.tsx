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
} from "lucide-react";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [paymentReference]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.email) {
        setError("User not authenticated");
        return;
      }

      // Try to fetch the order using payment reference
      const foundOrder = await PaystackPaymentService.getUserOrder(
        user.email,
        paymentReference,
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // If order not found, use the order data passed as prop
        if (orderData) {
          setOrder(orderData as OrderData);
        } else {
          setError("Order details not found");
        }
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;

    const receiptContent = `
ReBooked Solutions - Purchase Receipt

Order ID: ${order.id}
Payment Reference: ${order.paystack_ref}
Date: ${new Date(order.created_at).toLocaleDateString()}

Items Purchased:
${order.items.map((item) => `- ${item.title} by ${item.author}: R${(item.price / 100).toFixed(2)}`).join("\n")}

Total Amount: R${(order.amount / 100).toFixed(2)}
${order.delivery_fee ? `Delivery Fee: R${(order.delivery_fee / 100).toFixed(2)}` : ""}

${
  order.delivery_address
    ? `
Delivery Address:
${order.delivery_address.street}
${order.delivery_address.city}, ${order.delivery_address.province}
${order.delivery_address.postal_code}
`
    : "Collection: Buyer to collect from seller"
}

Thank you for your purchase!
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                R{((order.amount - (order.delivery_fee || 0)) / 100).toFixed(2)}
              </span>
            </div>
            {order.delivery_fee && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>R{(order.delivery_fee / 100).toFixed(2)}</span>
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
          {order.delivery_address ? (
            <div>
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-gray-600">
                    {order.delivery_address.street}
                    <br />
                    {order.delivery_address.city},{" "}
                    {order.delivery_address.province}
                    <br />
                    {order.delivery_address.postal_code}
                  </p>
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleDownloadReceipt}
          variant="outline"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
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
