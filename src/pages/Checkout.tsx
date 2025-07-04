import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CreditCard, Truck, MapPin, User } from "lucide-react";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import EnhancedShippingForm from "@/components/checkout/EnhancedShippingForm";
import SimpleShippingForm from "@/components/checkout/SimpleShippingForm";
import PaystackPaymentButton from "@/components/payment/PaystackPaymentButton";
import GoogleMapsErrorHandler from "@/components/GoogleMapsErrorHandler";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { toast } from "sonner";

interface ShippingData {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  specialInstructions?: string;
}

interface DeliveryQuote {
  id: string;
  service: string;
  price: number;
  estimatedDays: string;
  provider: string;
  details?: unknown;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const { loadError } = useGoogleMaps();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<any>(null);
  const [deliveryQuotes, setDeliveryQuotes] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useSimpleForm, setUseSimpleForm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [items, navigate, isAuthenticated]);

  // Show loading while checking authentication/cart
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Please log in to continue...</p>
            <Button onClick={() => navigate("/login")} className="mt-4">
              Go to Login
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some books to your cart to proceed with checkout.
            </p>
            <Button onClick={() => navigate("/")}>Browse Books</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const bookTotal = getTotalPrice();
  const deliveryFee = selectedDelivery?.price || 0;
  const totalAmount = bookTotal + deliveryFee;

  const steps = [
    { number: 1, title: "Shipping", icon: MapPin },
    { number: 2, title: "Delivery", icon: Truck },
    { number: 3, title: "Payment", icon: CreditCard },
  ];

  const handleShippingComplete = (data: any, deliveryOptions: any[]) => {
    setShippingData(data);
    setDeliveryQuotes(deliveryOptions);
    setCurrentStep(2);
    toast.success("Address saved! Please select your delivery option.");
  };

  const handleDeliverySelected = (delivery: any) => {
    setSelectedDelivery(delivery);
    setCurrentStep(3);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      setIsProcessing(true);

      // Clear cart after successful payment
      clearCart();

      // Navigate to payment status page with order details
      navigate(`/payment-status?reference=${paymentData.paystack_reference}`, {
        state: {
          orderId: paymentData.order_id,
          paymentReference: paymentData.paystack_reference,
          totalAmount,
          items,
        },
      });

      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error handling payment success:", error);
      toast.error(
        "Order was paid but there was an issue. Please contact support.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep >= step.number ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const DeliverySelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Select Delivery Option
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deliveryQuotes.length === 0 ? (
          <Alert>
            <AlertDescription>
              No delivery quotes available. Please go back and check your
              shipping address.
            </AlertDescription>
          </Alert>
        ) : (
          deliveryQuotes.map((quote, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedDelivery?.id === quote.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleDeliverySelected(quote)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{quote.service_name}</h3>
                  <p className="text-sm text-gray-600">
                    Estimated delivery: {quote.estimated_days} business days
                  </p>
                  {quote.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {quote.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">R{(quote.price || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Incl. VAT</p>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipping
          </Button>
          {selectedDelivery && (
            <Button onClick={() => setCurrentStep(3)} className="flex-1">
              Continue to Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">
              Complete your purchase securely
            </p>
          </div>

          <StepIndicator />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Google Maps Status */}
                  {loadError && (
                    <GoogleMapsErrorHandler
                      error={loadError}
                      variant="minimal"
                    />
                  )}

                  {/* Form Selector */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant={useSimpleForm ? "outline" : "default"}
                      size="sm"
                      onClick={() => setUseSimpleForm(false)}
                    >
                      Enhanced Form
                    </Button>
                    <Button
                      variant={useSimpleForm ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseSimpleForm(true)}
                    >
                      Simple Form
                    </Button>
                  </div>

                  {/* Shipping Form */}
                  {useSimpleForm ? (
                    <SimpleShippingForm
                      onComplete={handleShippingComplete}
                      cartItems={items}
                    />
                  ) : (
                    <EnhancedShippingForm
                      onComplete={handleShippingComplete}
                      cartItems={items}
                    />
                  )}
                </div>
              )}

              {currentStep === 2 && <DeliverySelection />}

              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Payment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Books ({items.length} items):</span>
                        <span>R{bookTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery:</span>
                        <span>R{deliveryFee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>R{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping & Delivery Confirmation */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Shipping to:</p>
                          <p className="text-gray-600">
                            {shippingData?.street}, {shippingData?.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Delivery:</p>
                          <p className="text-gray-600">
                            {selectedDelivery?.service_name} -
                            {selectedDelivery?.estimated_days} business days
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <PaystackPaymentButton
                      amount={Math.round(totalAmount * 100)} // Convert to kobo for Paystack
                      onSuccess={(reference) => {
                        handlePaymentSuccess({
                          paystack_reference: reference,
                          order_id: `order_${Date.now()}`,
                        });
                      }}
                      onError={(error) => {
                        toast.error(`Payment failed: ${error}`);
                      }}
                      metadata={{
                        shipping_address: shippingData,
                        delivery_option: selectedDelivery,
                        items_count: items.length,
                      }}
                    />

                    {/* Back Button */}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Delivery Options
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <CheckoutOrderSummary
                items={items}
                bookTotal={bookTotal}
                deliveryFee={deliveryFee}
                totalAmount={totalAmount}
                deliveryService={selectedDelivery?.service_name}
                shippingAddress={shippingData}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
