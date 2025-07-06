import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  MapPin,
  User,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Truck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DuplicatePaymentPrevention from "@/services/duplicatePaymentPrevention";
import GoogleMapsAddressPicker from "@/components/GoogleMapsAddressPicker";
import CourierSelection from "@/components/CourierSelection";
import { toast } from "sonner";

interface BookData {
  id: string;
  title: string;
  author: string;
  price: number;
  condition: string;
  isbn?: string;
  image_url?: string;
  seller_id: string;
  seller_name?: string;
  seller_subaccount_code?: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  lat?: number;
  lng?: number;
  formatted_address?: string;
  place_id?: string;
  special_instructions?: string;
}

interface CourierQuote {
  courier: string;
  service_name: string;
  service_code: string;
  price: number;
  estimated_days: string;
  description: string;
}

interface BookPurchaseProps {
  book: BookData;
  onBack?: () => void;
  onSuccess?: (orderData: any) => void;
}

const BookPurchase: React.FC<BookPurchaseProps> = ({
  book,
  onBack,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "South Africa",
  });
  const [sellerAddress, setSellerAddress] = useState<DeliveryAddress | null>(
    null,
  );
  const [selectedCourierQuote, setSelectedCourierQuote] =
    useState<CourierQuote | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  // Load seller information and user profile
  useEffect(() => {
    loadSellerInfo();
    loadUserProfile();
  }, [book.seller_id, user?.id]);

  const loadSellerInfo = async () => {
    try {
      const { data: seller, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", book.seller_id)
        .single();

      if (error) throw error;
      setSellerInfo(seller);

      // Set seller address for delivery calculations
      if (seller.address) {
        setSellerAddress({
          street: seller.address.street || "",
          city: seller.address.city || "Cape Town",
          province: seller.address.province || "Western Cape",
          postal_code: seller.address.postal_code || "8000",
          country: "South Africa",
          lat: seller.address.lat,
          lng: seller.address.lng,
        });
      } else {
        // Default seller address if not available
        setSellerAddress({
          street: "University of Cape Town",
          city: "Cape Town",
          province: "Western Cape",
          postal_code: "7700",
          country: "South Africa",
        });
      }

      // Load seller's Paystack subaccount if needed
      if (!book.seller_subaccount_code) {
        const { data: bankingData } = await supabase
          .from("banking_subaccounts")
          .select("subaccount_code")
          .eq("user_id", book.seller_id)
          .eq("is_active", true)
          .single();

        if (bankingData?.subaccount_code) {
          book.seller_subaccount_code = bankingData.subaccount_code;
        }
      }
    } catch (error) {
      console.error("Error loading seller info:", error);
      setError("Failed to load seller information");
    }
  };

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Pre-fill delivery address from profile if available
      if (profile.address) {
        setDeliveryAddress({
          street: profile.address.street || "",
          city: profile.address.city || "",
          province: profile.address.province || "",
          postal_code: profile.address.postal_code || "",
          country: "South Africa",
          lat: profile.address.lat,
          lng: profile.address.lng,
          formatted_address: profile.address.formatted_address,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleCourierQuoteSelect = (quote: CourierQuote) => {
    setSelectedCourierQuote(quote);
    setDeliveryFee(quote.price);
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
  };

  const getTotalAmount = () => {
    return book.price + deliveryFee;
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCourierQuoteSelect = (quote: CourierQuote) => {
    setSelectedCourierQuote(quote);
    setDeliveryFee(quote.price);
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
  };

  const validateStep1 = () => {
    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.province ||
      !deliveryAddress.postal_code
    ) {
      setError("Please select a complete delivery address");
      return false;
    }

    if (!selectedCourierQuote) {
      setError("Please select a delivery option");
      return false;
    }

    return true;
  };

  const handleContinueToPayment = () => {
    setError(null);

    if (!validateStep1()) {
      return;
    }

    if (!book.seller_subaccount_code) {
      setError("Seller payment setup incomplete. Cannot process payment.");
      return;
    }

    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.email || !user?.id) {
        throw new Error("User not authenticated");
      }

      // Validate purchase attempt
      const validation =
        await DuplicatePaymentPrevention.validatePurchaseAttempt(
          user.email,
          user.id,
          book.id,
          getTotalAmount(),
        );

      if (!validation.valid) {
        setError(validation.reason || "Purchase validation failed");
        toast.error(validation.reason || "Cannot proceed with purchase");
        return;
      }

      // Register payment attempt to prevent duplicates
      DuplicatePaymentPrevention.registerAttempt(
        user.id,
        book.id,
        getTotalAmount(),
      );

      // Call the process-book-purchase function
      const { data, error } = await supabase.functions.invoke(
        "process-book-purchase",
        {
          body: {
            book_id: book.id,
            delivery_method: deliveryMethod,
            delivery_address:
              deliveryMethod === "delivery" ? deliveryAddress : null,
            payment_method: "paystack",
          },
        },
      );

      if (error) throw error;

      if (data.success && data.payment_url) {
        // Update attempt status to pending
        DuplicatePaymentPrevention.updateAttemptStatus(
          user.id,
          book.id,
          "pending",
        );

        // Redirect to Paystack payment page
        window.location.href = data.payment_url;
      } else {
        // Update attempt status to failed
        DuplicatePaymentPrevention.updateAttemptStatus(
          user.id,
          book.id,
          "failed",
        );
        throw new Error(data.error || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);

      // Update attempt status to failed
      if (user?.id) {
        DuplicatePaymentPrevention.updateAttemptStatus(
          user.id,
          book.id,
          "failed",
        );
      }

      setError(error instanceof Error ? error.message : "Payment failed");
      toast.error("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Book Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Purchase Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {book.image_url ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-20 h-28 object-cover rounded border"
              />
            ) : (
              <div className="w-20 h-28 bg-gray-200 rounded border flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-gray-600">by {book.author}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{book.condition}</Badge>
                {book.isbn && (
                  <span className="text-sm text-gray-500">
                    ISBN: {book.isbn}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-green-600">
                  R{book.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {sellerInfo && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Seller:</strong>{" "}
                {sellerInfo.full_name || sellerInfo.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Maps Address Picker */}
      <GoogleMapsAddressPicker
        onAddressSelect={handleAddressSelect}
        initialAddress={deliveryAddress}
      />

      {/* Courier Selection */}
      {sellerAddress && deliveryAddress.postal_code && (
        <CourierSelection
          fromAddress={sellerAddress}
          toAddress={deliveryAddress}
          onQuoteSelect={handleCourierQuoteSelect}
          selectedQuote={selectedCourierQuote}
        />
      )}

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Book Price</span>
              <span>R{book.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>R{deliveryFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R{getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleContinueToPayment} className="flex-1">
          Continue to Payment
          <CreditCard className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Ready to Pay</span>
              </div>
              <div className="text-sm text-green-700">
                You'll be redirected to Paystack to complete your payment
                securely.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Book:</span>
                <div className="font-medium">{book.title}</div>
              </div>
              <div>
                <span className="text-gray-600">Seller:</span>
                <div className="font-medium">
                  {sellerInfo?.full_name || "Unknown"}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Delivery:</span>
                <div className="font-medium capitalize">{deliveryMethod}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <div className="font-bold text-lg text-green-600">
                  R{getTotalAmount().toFixed(2)}
                </div>
              </div>
            </div>

            {deliveryMethod === "delivery" && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Delivery Address:</h4>
                <div className="text-sm text-gray-600">
                  {deliveryAddress.street}
                  <br />
                  {deliveryAddress.city}, {deliveryAddress.province}
                  <br />
                  {deliveryAddress.postal_code}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Details
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? "Processing..." : `Pay R${getTotalAmount().toFixed(2)}`}
          <CreditCard className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div
          className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 1 ? "border-blue-600 bg-blue-50" : "border-gray-300"
            }`}
          >
            1
          </div>
          <span className="ml-2 text-sm font-medium">Details</span>
        </div>

        <div
          className={`w-16 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}
        />

        <div
          className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 2 ? "border-blue-600 bg-blue-50" : "border-gray-300"
            }`}
          >
            2
          </div>
          <span className="ml-2 text-sm font-medium">Payment</span>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
};

export default BookPurchase;
