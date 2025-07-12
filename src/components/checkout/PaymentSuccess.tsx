import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  Clock,
  Eye,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReceiptDownloader from "@/components/receipt/ReceiptDownloader";

interface PaymentSuccessProps {
  reference: string;
  amount: number;
  items: Array<{
    id: string;
    title: string;
    author?: string;
    price: number;
  }>;
  isCartCheckout: boolean;
  buyer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
  deliveryMethod?: string;
  deliveryFee?: number;
  deliveryAddress?: any;
  onClose?: () => void;
}

const PaymentSuccess = ({
  reference,
  amount,
  items,
  isCartCheckout,
  buyer,
  seller,
  deliveryMethod,
  deliveryFee,
  deliveryAddress,
  onClose,
}: PaymentSuccessProps) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-redirect to user orders page
          navigate("/my-orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleViewOrders = () => {
    navigate("/my-orders");
  };

  const handleViewShipping = () => {
    navigate("/shipping");
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  const toggleReceipt = () => {
    setShowReceipt(!showReceipt);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600">
            Your {isCartCheckout ? "cart" : "book"} purchase has been completed
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-800">
                Payment Reference
              </span>
              <code className="text-xs bg-green-200 px-2 py-1 rounded text-green-800">
                {reference}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">
                Total Paid
              </span>
              <span className="font-bold text-green-800">
                R{amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">
              {isCartCheckout ? "Cart Items" : "Purchased Book"}:
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium truncate">
                    {item.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    R{item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">What's Next?</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• We'll process your order shortly</li>
              <li>• Sellers will be notified to prepare shipment</li>
              <li>• You'll receive tracking information via email</li>
              <li>• Check the shipping page for updates</li>
            </ul>
          </div>

          {/* Countdown */}
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Redirecting to your orders in {countdown} seconds
              </span>
            </div>
          </div>

          {/* Receipt Download */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Download Receipt
                </span>
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

            {showReceipt && (
              <ReceiptDownloader
                reference={reference}
                amount={amount}
                items={items}
                buyer={buyer}
                seller={seller}
                deliveryMethod={deliveryMethod}
                deliveryFee={deliveryFee}
                deliveryAddress={deliveryAddress}
                timestamp={new Date().toISOString()}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleViewOrders}
              className="bg-book-600 hover:bg-book-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Orders
            </Button>
            <Button onClick={handleViewShipping} variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Track Shipping
            </Button>
          </div>

          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-500"
            >
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
