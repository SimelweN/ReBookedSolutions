import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MapPin, Truck } from "lucide-react";
import { CartItem } from "@/types/cart";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  bookTotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryService?: string;
  shippingAddress?: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  bookTotal,
  deliveryFee,
  totalAmount,
  deliveryService,
  shippingAddress,
}) => {
  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600">by {item.author}</p>
                  <p className="text-xs text-gray-500">
                    Sold by {item.sellerName}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Qty: {item.quantity}
                    </Badge>
                    <span className="font-semibold">
                      R{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
              </span>
              <span>R{bookTotal.toFixed(2)}</span>
            </div>

            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>R{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-1">💡 Payment info:</p>
            <p>• Secure payment processing by Paystack</p>
            <p>• Books are shipped after payment confirmation</p>
            <p>• Delivery fees are charged separately</p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      {deliveryService && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{deliveryService}</p>
                <p className="text-sm text-gray-600">
                  R{deliveryFee.toFixed(2)}
                </p>
              </div>

              {shippingAddress && (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </p>
                  <div className="text-sm text-gray-600 mt-1 pl-6">
                    <p>{shippingAddress.recipient_name}</p>
                    <p>{shippingAddress.street_address}</p>
                    {shippingAddress.apartment && (
                      <p>{shippingAddress.apartment}</p>
                    )}
                    <p>
                      {shippingAddress.city}, {shippingAddress.province}{" "}
                      {shippingAddress.postal_code}
                    </p>
                    {shippingAddress.phone && (
                      <p className="mt-1">Phone: {shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
              🔒
            </div>
            <p className="text-sm font-medium text-green-800">Secure Payment</p>
            <p className="text-xs text-green-600 mt-1">
              Powered by Paystack. Your payment information is encrypted and
              secure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutOrderSummary;
