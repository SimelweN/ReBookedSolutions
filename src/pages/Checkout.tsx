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
import CheckoutShippingForm from "@/components/checkout/CheckoutShippingForm";
import CheckoutPaymentProcessor from "@/components/checkout/CheckoutPaymentProcessor";
import { toast } from "sonner";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<any>(null);
  const [deliveryQuotes, setDeliveryQuotes] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [items, navigate]);

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  const bookTotal = getTotalPrice();
  const deliveryFee = selectedDelivery?.price || 0;
  const totalAmount = bookTotal + deliveryFee;

  const steps = [
    { number: 1, title: "Shipping", icon: MapPin },
    { number: 2, title: "Delivery", icon: Truck },
    { number: 3, title: "Payment", icon: CreditCard },
  ];

  const handleShippingComplete = (data: any, quotes: any[]) => {
    setShippingData(data);
    setDeliveryQuotes(quotes);
    setCurrentStep(2);
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

      // Navigate to success page with order details
      navigate("/checkout/success", {
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
        <React.Fragment key={step.number}>
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
        </React.Fragment>
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
                  <p className="font-bold">R{quote.price.toFixed(2)}</p>
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
                <CheckoutShippingForm
                  onComplete={handleShippingComplete}
                  cartItems={items}
                />
              )}

              {currentStep === 2 && <DeliverySelection />}

              {currentStep === 3 && (
                <CheckoutPaymentProcessor
                  cartItems={items}
                  shippingData={shippingData}
                  deliveryData={selectedDelivery}
                  totalAmount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep(2)}
                  isProcessing={isProcessing}
                />
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
