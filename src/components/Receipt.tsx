import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Share2,
  Package,
  Calendar,
  MapPin,
  User,
  CreditCard,
} from "lucide-react";
import { OrderData } from "@/services/paystackPaymentService";
import { toast } from "sonner";

interface ReceiptProps {
  order: OrderData;
  className?: string;
  showActions?: boolean;
}

const Receipt: React.FC<ReceiptProps> = ({
  order,
  className = "",
  showActions = true,
}) => {
  const downloadReceipt = () => {
    const receiptContent = generateReceiptText(order);
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ReBooked-Receipt-${order.id.slice(0, 8)}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded successfully!");
  };

  const shareReceipt = async () => {
    const receiptText = generateReceiptText(order);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ReBooked Receipt - Order ${order.id.slice(0, 8)}`,
          text: receiptText,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
        copyToClipboard(receiptText);
      }
    } else {
      copyToClipboard(receiptText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Receipt copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy receipt");
      });
  };

  const generateReceiptText = (order: OrderData): string => {
    const deliveryAddress = order.delivery_address || order.shipping_address;
    const deliveryFee =
      order.delivery_data?.delivery_fee || order.delivery_fee || 0;

    return `
═══════════════════════════════════════
              REBOOKED SOLUTIONS
           📚 Textbook Marketplace
═══════════════════════════════════════

PURCHASE RECEIPT

Order ID: ${order.id}
Payment Ref: ${order.paystack_ref}
Date: ${new Date(order.created_at).toLocaleDateString()}
Time: ${new Date(order.created_at).toLocaleTimeString()}

───────────────────────────────────────
BUYER INFORMATION
───────────────────────────────────────
Email: ${order.buyer_email}

${
  deliveryAddress
    ? `
───────────────────────────────────────
DELIVERY ADDRESS
───────────────────────────────────────
${deliveryAddress.street || deliveryAddress.address_line_1}
${deliveryAddress.city}, ${deliveryAddress.province || deliveryAddress.state}
${deliveryAddress.postal_code || deliveryAddress.zip_code}
`
    : `
───────────────────────────────────────
COLLECTION
───────────────────────────────────────
Buyer to arrange collection with seller
`
}

───────────────────────────────────────
ITEMS PURCHASED
───────────────────────────────────────
${order.items
  .map(
    (item, index) => `
${index + 1}. ${item.title}
   Author: ${item.author || "Unknown"}
   Condition: ${item.condition || "Used"}
   Price: R${(item.price / 100).toFixed(2)}
   ${item.isbn ? `ISBN: ${item.isbn}` : ""}
`,
  )
  .join("")}

───────────────────────────────────────
PAYMENT BREAKDOWN
───────────────────────────────────────
Subtotal: R${((order.amount - deliveryFee) / 100).toFixed(2)}
${deliveryFee > 0 ? `Delivery Fee: R${(deliveryFee / 100).toFixed(2)}` : ""}

TOTAL PAID: R${(order.amount / 100).toFixed(2)}

──────────────────────────���────────────
PAYMENT DETAILS
───────────────────────────────────────
Status: ${order.status.toUpperCase()}
Payment Method: Paystack
${order.paid_at ? `Paid At: ${new Date(order.paid_at).toLocaleString()}` : ""}

───────────────────────────────────────
NEXT STEPS
───────────────────────────────────────
✓ Payment completed successfully
• Seller has 48 hours to commit to order
• You'll receive updates via email
• Track your order at rebookedsolutions.co.za

───────────────────────────────────────
SUPPORT
───────────────────────────────────────
Email: support@rebookedsolutions.co.za
Website: www.rebookedsolutions.co.za

Thank you for choosing ReBooked Solutions!
═══════════════════════════════════════
    `.trim();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deliveryAddress = order.delivery_address || order.shipping_address;
  const deliveryFee =
    order.delivery_data?.delivery_fee || order.delivery_fee || 0;

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader className="text-center bg-book-50 border-b">
        <CardTitle className="text-2xl font-bold text-book-800">
          ReBooked Solutions
        </CardTitle>
        <p className="text-book-600">📚 Textbook Marketplace Receipt</p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Order Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Purchase Receipt</h2>
          <div className="flex justify-center">
            <Badge className={getStatusColor(order.status)}>
              {order.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Order ID:</span>
            <div className="font-mono">{order.id}</div>
          </div>
          <div>
            <span className="text-gray-600">Payment Ref:</span>
            <div className="font-mono text-xs">{order.paystack_ref}</div>
          </div>
          <div>
            <span className="text-gray-600">Date:</span>
            <div>{formatDate(order.created_at)}</div>
          </div>
          <div>
            <span className="text-gray-600">Buyer:</span>
            <div>{order.buyer_email}</div>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Items Purchased
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-12 h-16 bg-gray-200 rounded border flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.author && (
                    <p className="text-sm text-gray-600">by {item.author}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.condition && (
                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                    )}
                    {item.isbn && (
                      <span className="text-xs text-gray-500">
                        ISBN: {item.isbn}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">
                    R{(item.price / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Delivery Information */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Delivery Information
          </h3>
          {deliveryAddress ? (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-900">Delivery Address:</p>
              <div className="text-blue-800 text-sm mt-1">
                {deliveryAddress.street || deliveryAddress.address_line_1}
                <br />
                {deliveryAddress.city},{" "}
                {deliveryAddress.province || deliveryAddress.state}
                <br />
                {deliveryAddress.postal_code || deliveryAddress.zip_code}
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="font-medium text-orange-900">Collection Required</p>
              <p className="text-orange-800 text-sm mt-1">
                Please arrange collection directly with the seller
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Breakdown */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R{((order.amount - deliveryFee) / 100).toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee:</span>
                <span>R{(deliveryFee / 100).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Paid:</span>
              <span className="text-green-600">
                R{(order.amount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-book-50 border border-book-200 rounded-lg p-4">
          <h4 className="font-semibold text-book-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-book-800 space-y-1">
            <li>✓ Payment completed successfully</li>
            <li>• Seller has 48 hours to commit to your order</li>
            <li>• You'll receive email updates on order status</li>
            <li>• Track your order progress in "My Orders"</li>
          </ul>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={downloadReceipt}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={shareReceipt} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Thank you for choosing ReBooked Solutions!</p>
          <p>Support: support@rebookedsolutions.co.za</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Receipt;
