import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  MapPin,
  Truck,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { MultiSellerCartService } from "@/services/multiSellerCartService";
import { SellerMarketplaceService } from "@/services/sellerMarketplaceService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  SellerCart,
  CheckoutData,
  CourierQuote,
  DeliveryAddress,
} from "@/types/multiSellerCart";
import { getUserAddresses } from "@/services/addressService";

const MultiSellerCheckout = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [cart, setCart] = useState<SellerCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [buyerAddress, setBuyerAddress] = useState<DeliveryAddress | null>(
    null,
  );
  const [sellerAddress, setSellerAddress] = useState<DeliveryAddress | null>(
    null,
  );
  const [courierQuotes, setCourierQuotes] = useState<CourierQuote[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierQuote | null>(
    null,
  );
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (sellerId) {
      loadCheckoutData();
    }
  }, [sellerId, isAuthenticated]);

  const loadCheckoutData = async () => {
    if (!sellerId || !user) return;

    try {
      setLoading(true);

      // Load seller cart
      const sellerCart = MultiSellerCartService.getSellerCart(sellerId);
      if (!sellerCart || sellerCart.items.length === 0) {
        toast.error("No items found for this seller");
        navigate("/cart");
        return;
      }
      setCart(sellerCart);

      // Load buyer address
      const addresses = await getUserAddresses(user.id);
      if (addresses.shipping_address) {
        setBuyerAddress({
          street: addresses.shipping_address.streetAddress,
          city: addresses.shipping_address.city,
          province: addresses.shipping_address.province,
          postal_code: addresses.shipping_address.postalCode,
          country: "South Africa",
        });
      }

      // Load seller address
      const sellerAddr =
        await SellerMarketplaceService.getSellerDeliveryAddress(sellerId);
      setSellerAddress(sellerAddr);

      // Load courier quotes if both addresses are available
      if (addresses.shipping_address && sellerAddr) {
        await loadCourierQuotes(sellerAddr, {
          street: addresses.shipping_address.streetAddress,
          city: addresses.shipping_address.city,
          province: addresses.shipping_address.province,
          postal_code: addresses.shipping_address.postalCode,
          country: "South Africa",
        });
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
      toast.error("Failed to load checkout information");
    } finally {
      setLoading(false);
    }
  };

  const loadCourierQuotes = async (
    fromAddr: DeliveryAddress,
    toAddr: DeliveryAddress,
  ) => {
    try {
      setLoadingQuotes(true);

      // Call the get-delivery-quotes function
      const { data, error } = await supabase.functions.invoke(
        "get-delivery-quotes",
        {
          body: {
            fromAddress: {
              streetAddress: fromAddr.street,
              suburb: "",
              city: fromAddr.city,
              province: fromAddr.province,
              postalCode: fromAddr.postal_code,
            },
            toAddress: {
              streetAddress: toAddr.street,
              suburb: "",
              city: toAddr.city,
              province: toAddr.province,
              postalCode: toAddr.postal_code,
            },
            weight: 0.5, // Default book weight
          },
        },
      );

      if (error) {
        console.error("Error getting courier quotes:", error);
        // Use fallback quotes
        const fallbackQuotes: CourierQuote[] = [
          {
            courier: "fastway",
            serviceName: "Fastway Standard",
            price: 85,
            estimatedDays: 3,
            description: "Reliable standard delivery service",
          },
          {
            courier: "courier-guy",
            serviceName: "Courier Guy Express",
            price: 95,
            estimatedDays: 2,
            description: "Fast express delivery service",
          },
        ];
        setCourierQuotes(fallbackQuotes);
        setSelectedCourier(fallbackQuotes[0]); // Select cheapest by default
        return;
      }

      if (data?.quotes && data.quotes.length > 0) {
        const quotes: CourierQuote[] = data.quotes.map((quote: any) => ({
          courier: quote.courier,
          serviceName: quote.serviceName,
          price: quote.price,
          estimatedDays: quote.estimatedDays,
          description: quote.description || `${quote.courier} delivery service`,
        }));

        setCourierQuotes(quotes);
        setSelectedCourier(quotes[0]); // Select first (usually cheapest)
      }
    } catch (error) {
      console.error("Error loading courier quotes:", error);
      toast.error("Failed to load delivery options");
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!cart || !selectedCourier || !buyerAddress || !sellerAddress || !user) {
      toast.error("Missing required information for checkout");
      return;
    }

    try {
      setProcessingPayment(true);

      const checkoutData: CheckoutData = {
        sellerId: cart.sellerId,
        sellerName: cart.sellerName,
        subaccountCode: cart.subaccountCode || "",
        items: cart.items,
        subtotal: cart.subtotal,
        courierFee: selectedCourier.price,
        total: cart.subtotal + selectedCourier.price,
        courierQuote: selectedCourier,
        buyerAddress,
        sellerAddress,
      };

      // Call the process-multi-seller-purchase function
      const { data, error } = await supabase.functions.invoke(
        "process-multi-seller-purchase",
        {
          body: {
            checkout: checkoutData,
            books: cart.items.map((item) => ({ id: item.bookId })),
          },
        },
      );

      if (error) {
        console.error("Payment processing error:", error);
        toast.error("Payment processing failed. Please try again.");
        return;
      }

      if (data?.success && data?.payment_url) {
        // Clear the seller's cart since we're proceeding to payment
        MultiSellerCartService.clearSellerCart(cart.sellerId);

        // Redirect to Paystack
        window.location.href = data.payment_url;
      } else {
        toast.error("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("An error occurred during checkout");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    return `R${price.toFixed(2)}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Items Found
              </h3>
              <p className="text-gray-600 mt-2">
                No items found for this seller.
              </p>
              <Button onClick={() => navigate("/cart")} className="mt-4">
                View Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const total = cart.subtotal + (selectedCourier?.price || 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-book-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-book-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cart.sellerName}</h3>
                      <p className="text-sm text-gray-600">
                        {cart.items.length} book
                        {cart.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {cart.subaccountCode && (
                      <Badge variant="outline" className="ml-auto">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Seller
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600">{item.author}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-book-600">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!buyerAddress ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please set up your shipping address to see delivery
                        options.
                        <Button
                          variant="link"
                          onClick={() => navigate("/profile")}
                          className="ml-2 p-0 h-auto"
                        >
                          Add Address
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : loadingQuotes ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading delivery options...</span>
                    </div>
                  ) : courierQuotes.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No delivery options available for your area.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {courierQuotes.map((quote, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedCourier === quote
                              ? "border-book-500 bg-book-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedCourier(quote)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {quote.serviceName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {quote.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {quote.estimatedDays} business day
                                {quote.estimatedDays !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                {formatPrice(quote.price)}
                              </div>
                              {index === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-1"
                                >
                                  Recommended
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {buyerAddress ? (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Shipping to:</p>
                      <p className="text-sm text-gray-600">
                        {buyerAddress.street}, {buyerAddress.city},{" "}
                        {buyerAddress.province} {buyerAddress.postal_code}
                      </p>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please add your shipping address to continue.
                        <Button
                          variant="link"
                          onClick={() => navigate("/profile")}
                          className="ml-2 p-0 h-auto"
                        >
                          Add Address
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span>
                        {selectedCourier
                          ? formatPrice(selectedCourier.price)
                          : "TBD"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform fee (10%):</span>
                      <span>{formatPrice(cart.platformCommission)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Seller receives:</span>
                      <span>{formatPrice(cart.sellerReceives)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-book-600">{formatPrice(total)}</span>
                  </div>

                  <Button
                    onClick={handleProcessPayment}
                    disabled={
                      !buyerAddress ||
                      !selectedCourier ||
                      !cart.subaccountCode ||
                      processingPayment
                    }
                    className="w-full"
                    size="lg"
                  >
                    {processingPayment ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay {formatPrice(total)}
                      </>
                    )}
                  </Button>

                  {!cart.subaccountCode && (
                    <div className="text-xs text-center text-gray-500">
                      This seller hasn't completed banking setup. Please try
                      again later.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MultiSellerCheckout;
