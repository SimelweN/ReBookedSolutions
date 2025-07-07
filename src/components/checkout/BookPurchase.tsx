import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
import CourierQuoteSystem from "@/components/CourierQuoteSystem";
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
  courier: "fastway" | "courier-guy";
  service_name: string;
  price: number;
  estimated_days: number;
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
  const [deliveryFee, setDeliveryFee] = useState(0); // No fee until address + courier selected
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [sellerInfoLoading, setSellerInfoLoading] = useState(true);

  // Load seller information and user profile
  useEffect(() => {
    console.log("BookPurchase - Book data received:", book);

    if (!book.seller_id) {
      setError("Invalid book data: missing seller information");
      setSellerInfoLoading(false);
      return;
    }

    if (!user?.id) {
      setError("User not authenticated");
      setSellerInfoLoading(false);
      return;
    }

    loadSellerInfo();
    loadUserProfile();
  }, [book.seller_id, user?.id]);

  const loadSellerInfo = async () => {
    setSellerInfoLoading(true);
    try {
      console.log("Loading seller info for seller_id:", book.seller_id);

      if (!book.seller_id) {
        throw new Error("No seller_id provided");
      }

      // Use simplified address service to get seller address
      const { getSellerDeliveryAddress } = await import(
        "@/services/simplifiedAddressService"
      );

      // Get seller delivery address (always returns a valid address)
      const deliveryAddress = await getSellerDeliveryAddress(book.seller_id);
      console.log("📍 Got seller delivery address:", deliveryAddress);

      // Validate seller address quality
      if (
        !deliveryAddress.street ||
        !deliveryAddress.city ||
        !deliveryAddress.postal_code
      ) {
        console.warn("⚠�� Seller address is incomplete, using fallback");
        toast.warning(
          "⚠️ Seller's address is incomplete. Delivery costs may be estimated.",
        );
      }

      // Ensure we always set a seller address
      console.log("Setting seller address:", deliveryAddress);
      setSellerAddress(deliveryAddress);

      // Get basic seller info from profiles
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("profiles")
        .select("id, name, email, subaccount_code")
        .eq("id", book.seller_id)
        .single();

      if (sellerError) {
        console.warn(
          "Could not load seller profile, using fallback:",
          sellerError,
        );
        setSellerInfo({
          id: book.seller_id,
          name: "Unknown Seller",
          email: "unknown@example.com",
          has_subaccount: false,
        });
      } else {
        console.log("Successfully loaded seller profile:", sellerProfile);
        setSellerInfo({
          id: sellerProfile.id,
          name: sellerProfile.name || "Unknown Seller",
          email: sellerProfile.email || "unknown@example.com",
          has_subaccount: !!sellerProfile.subaccount_code?.trim(),
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

      // Mark loading as complete
      setSellerInfoLoading(false);
    } catch (error) {
      console.error("Error loading seller info:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.message || JSON.stringify(error) || "Unknown error";
      console.error("Detailed seller info error:", errorMessage);

      // Always ensure a fallback address is set
      const fallbackAddress = {
        street: "University of Cape Town",
        city: "Cape Town",
        province: "Western Cape",
        postal_code: "7700",
        country: "South Africa",
      };
      console.log("Setting fallback seller address:", fallbackAddress);
      setSellerAddress(fallbackAddress);

      // Handle timeout errors differently
      if (errorMessage.includes("timeout")) {
        console.warn("Seller validation timed out, proceeding with fallback");
        toast.info("Using default location for delivery calculations");
        // Don't set error for timeout - just proceed with fallback
      } else {
        console.warn(
          `Seller info load failed, using fallback: ${errorMessage}`,
        );
        toast.info("Using default location for delivery calculations");
        // Don't block the user with an error, just use fallback
      }

      // Always mark loading as complete, even on error
      setSellerInfoLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      console.log("🏠 Loading user address data for checkout...");
      // Use simplified address service to get user's shipping address
      const { getSimpleUserAddresses } = await import(
        "@/services/simplifiedAddressService"
      );
      const userAddresses = await getSimpleUserAddresses(user.id);

      console.log("📍 User addresses retrieved:", userAddresses);

      // Pre-fill delivery address from user's shipping address
      if (userAddresses.shipping_address) {
        const shipping = userAddresses.shipping_address;
        console.log(
          "✅ Pre-filling delivery address from saved shipping address",
        );
        setDeliveryAddress({
          street: shipping.streetAddress || "",
          city: shipping.city || "",
          province: shipping.province || "",
          postal_code: shipping.postalCode || "",
          country: "South Africa",
        });
      } else {
        console.log(
          "⚠️ No saved shipping address found - user will need to enter address manually",
        );
        // Show a helpful message to the user
        toast.info(
          "💡 You'll need to enter your delivery address. Consider saving it in your profile for next time!",
        );
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.message || JSON.stringify(error) || "Unknown error";
      console.error("Detailed user profile error:", errorMessage);

      // Show a gentle warning to the user but don't block the purchase
      toast.warning(
        "⚠️ Couldn't load your saved address. You'll need to enter your delivery address manually.",
      );
    }
  };

  const handleAddressChange = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
  };

  const handleCourierSelect = (quote: CourierQuote) => {
    setSelectedCourierQuote(quote);
    setDeliveryFee(quote.price);
  };

  const getTotalAmount = () => {
    return book.price + deliveryFee;
  };

  const validateStep1 = () => {
    console.log("🔍 Validating checkout step 1...");
    console.log("📍 Current delivery address:", deliveryAddress);
    console.log("🚚 Selected courier quote:", selectedCourierQuote);

    // Check each required field specifically
    const missingFields = [];
    if (!deliveryAddress.street?.trim()) missingFields.push("street address");
    if (!deliveryAddress.city?.trim()) missingFields.push("city");
    if (!deliveryAddress.province?.trim()) missingFields.push("province");
    if (!deliveryAddress.postal_code?.trim()) missingFields.push("postal code");

    if (missingFields.length > 0) {
      const errorMsg = `❌ Please enter your ${missingFields.join(", ")} for delivery`;
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // Validate seller address exists
    if (!sellerAddress || !sellerAddress.street || !sellerAddress.city) {
      const errorMsg =
        "❌ Seller's address is not available. Cannot calculate delivery costs.";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // Ensure courier is selected
    if (!selectedCourierQuote || deliveryFee <= 0) {
      const errorMsg = "❌ Please select a delivery option to continue";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    console.log("✅ Checkout validation passed");
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

      // Call the process-book-purchase function with comprehensive error handling
      const { data, error } = await supabase.functions.invoke(
        "process-book-purchase",
        {
          body: {
            book_id: book.id,
            delivery_method: "delivery", // Always delivery with courier
            delivery_address: deliveryAddress,
            courier_info: selectedCourierQuote,
            delivery_fee: deliveryFee,
            payment_method: "paystack",
          },
        },
      );

      if (error) {
        console.error("Error processing book purchase:", error);

        // Enhanced error handling for specific error types
        if (error.message?.includes("authentication")) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (error.message?.includes("not found")) {
          throw new Error("Book not found. It may have been sold or removed.");
        } else if (error.message?.includes("already sold")) {
          throw new Error("This book has already been sold to another buyer.");
        } else if (error.message?.includes("insufficient funds")) {
          throw new Error("Payment failed due to insufficient funds.");
        } else if (
          error.message?.includes("network") ||
          error.message?.includes("timeout")
        ) {
          throw new Error(
            "Network error. Please check your connection and try again.",
          );
        } else if (error.message?.includes("paystack")) {
          throw new Error(
            "Payment processing error. Please try again or use a different payment method.",
          );
        }

        throw error;
      }

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

      {/* Courier Quote System */}
      {sellerAddress ? (
        <CourierQuoteSystem
          sellerAddress={sellerAddress}
          onAddressChange={handleAddressChange}
          onQuoteSelect={handleCourierSelect}
          selectedQuote={selectedCourierQuote}
          initialAddress={deliveryAddress}
        />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Loading Seller Information
            </h3>
            <p className="text-gray-600">
              Please wait while we load the seller's location to calculate
              delivery options.
            </p>
          </CardContent>
        </Card>
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
                <div className="font-medium">
                  {selectedCourierQuote?.service_name || "Standard Delivery"}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <div className="font-bold text-lg text-green-600">
                  R{getTotalAmount().toFixed(2)}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Delivery Details:</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Address:</strong>
                  <br />
                  {deliveryAddress.street}
                  <br />
                  {deliveryAddress.city}, {deliveryAddress.province}
                  <br />
                  {deliveryAddress.postal_code}
                </div>
                {selectedCourierQuote && (
                  <div>
                    <strong>Courier:</strong>{" "}
                    {selectedCourierQuote.service_name}
                    <br />
                    <strong>Estimated Delivery:</strong>{" "}
                    {selectedCourierQuote.estimated_days} business days
                  </div>
                )}
              </div>
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
