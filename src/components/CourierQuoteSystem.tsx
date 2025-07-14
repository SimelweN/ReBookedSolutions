import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Truck,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Package,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

interface CourierQuote {
  courier: "fastway" | "courier-guy";
  service_name: string;
  price: number;
  estimated_days: number;
  description: string;
}

interface CourierQuoteSystemProps {
  sellerAddress: DeliveryAddress;
  onAddressChange: (address: DeliveryAddress) => void;
  onQuoteSelect: (quote: CourierQuote) => void;
  selectedQuote?: CourierQuote;
  initialAddress?: DeliveryAddress;
}

const CourierQuoteSystem: React.FC<CourierQuoteSystemProps> = ({
  sellerAddress,
  onAddressChange,
  onQuoteSelect,
  selectedQuote,
  initialAddress,
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(
    initialAddress || {
      street: "",
      city: "",
      province: "",
      postal_code: "",
      country: "South Africa",
    },
  );

  const [quotes, setQuotes] = useState<CourierQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [addressComplete, setAddressComplete] = useState(false);

  // Update delivery address when initialAddress prop changes
  useEffect(() => {
    if (
      initialAddress &&
      (initialAddress.street !== deliveryAddress.street ||
        initialAddress.city !== deliveryAddress.city ||
        initialAddress.province !== deliveryAddress.province ||
        initialAddress.postal_code !== deliveryAddress.postal_code)
    ) {
      console.log(
        "📍 Updating delivery address from initialAddress:",
        initialAddress,
      );
      setDeliveryAddress(initialAddress);
    }
  }, [initialAddress]);

  // Check if address is complete
  useEffect(() => {
    const isComplete =
      deliveryAddress.street &&
      deliveryAddress.city &&
      deliveryAddress.province &&
      deliveryAddress.postal_code;
    setAddressComplete(!!isComplete);

    if (isComplete) {
      fetchDeliveryQuotes();
    } else {
      setQuotes([]);
      setQuotesError(null);
    }
  }, [
    deliveryAddress.street,
    deliveryAddress.city,
    deliveryAddress.province,
    deliveryAddress.postal_code,
    sellerAddress.street,
    sellerAddress.city,
    sellerAddress.province,
    sellerAddress.postal_code,
  ]);

  const handleAddressFieldChange = (
    field: keyof DeliveryAddress,
    value: string,
  ) => {
    const updatedAddress = {
      ...deliveryAddress,
      [field]: value,
    };
    setDeliveryAddress(updatedAddress);
    onAddressChange(updatedAddress);
  };

  const fetchDeliveryQuotes = async () => {
    // Validate buyer address
    if (!addressComplete) {
      setQuotesError(
        "Please complete your delivery address to get shipping quotes",
      );
      return;
    }

    // Validate seller address
    if (!sellerAddress || !sellerAddress.postal_code || !sellerAddress.city) {
      setQuotesError(
        "⚠️ Seller's address is incomplete. Cannot calculate accurate delivery costs. Please contact support.",
      );
      return;
    }

    setLoadingQuotes(true);
    setQuotesError(null);
    setQuotes([]);

    try {
      // Use the existing get-delivery-quotes function
      const { data, error } = await supabase.functions.invoke(
        "get-delivery-quotes",
        {
          body: {
            fromAddress: {
              streetAddress: sellerAddress.street,
              suburb: "", // Most sellers won't have suburb
              city: sellerAddress.city,
              province: sellerAddress.province,
              postalCode: sellerAddress.postal_code,
            },
            toAddress: {
              streetAddress: deliveryAddress.street,
              suburb: "", // Extract suburb from street if needed
              city: deliveryAddress.city,
              province: deliveryAddress.province,
              postalCode: deliveryAddress.postal_code,
            },
            weight: 0.5, // Default book weight
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to get delivery quotes");
      }

      if (data && data.quotes) {
        interface RawQuote {
          courier: string;
          serviceName: string;
          price: number;
          estimatedDays: number;
        }

        const formattedQuotes: CourierQuote[] = data.quotes.map(
          (quote: RawQuote) => ({
            courier: quote.courier as "fastway" | "courier-guy",
            service_name: quote.serviceName,
            price: quote.price,
            estimated_days: quote.estimatedDays,
            description: getCourierDescription(quote.courier),
          }),
        );

        setQuotes(formattedQuotes);

        // Auto-select cheapest option
        if (formattedQuotes.length > 0 && !selectedQuote) {
          const cheapest = formattedQuotes.reduce((prev, current) =>
            prev.price < current.price ? prev : current,
          );
          onQuoteSelect(cheapest);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get delivery quotes";

      // Provide user-friendly error messages
      let userMessage = errorMessage;
      if (errorMessage.includes("timeout")) {
        userMessage = "⏱️ Request timed out. Using standard delivery rates.";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("connection")
      ) {
        userMessage = "🌐 Network error. Using standard delivery rates.";
      } else if (
        errorMessage.includes("address") ||
        errorMessage.includes("location")
      ) {
        userMessage =
          "📍 Address validation failed. Using estimated delivery rates.";
      } else {
        userMessage =
          "⚠️ Couldn't get real-time quotes. Using standard delivery rates.";
      }

      setQuotesError(userMessage);
      // Set fallback quotes
      const fallbackQuotes: CourierQuote[] = [
        {
          courier: "fastway",
          service_name: "Fastway Standard (Estimated)",
          price: 85,
          estimated_days: 3,
          description: "Reliable standard delivery service - estimated rate",
        },
        {
          courier: "courier-guy",
          service_name: "Courier Guy Express (Estimated)",
          price: 95,
          estimated_days: 2,
          description: "Fast express delivery service - estimated rate",
        },
      ];

      setQuotes(fallbackQuotes);

      // Auto-select cheapest fallback option
      if (!selectedQuote && fallbackQuotes.length > 0) {
        onQuoteSelect(fallbackQuotes[0]);
      }
    } finally {
      setLoadingQuotes(false);
    }
  };

  const getCourierDescription = (courier: string): string => {
    switch (courier) {
      case "fastway":
        return "Fastway Couriers - Reliable nationwide delivery network";
      case "courier-guy":
        return "The Courier Guy - Premium express delivery service";
      default:
        return "Professional courier delivery service";
    }
  };

  const getCourierLogo = (courier: string): string => {
    switch (courier) {
      case "fastway":
        return "📦"; // Could be replaced with actual Fastway logo
      case "courier-guy":
        return "🚚"; // Could be replaced with actual Courier Guy logo
      default:
        return "🚛";
    }
  };

  const getCourierBrandColor = (courier: string): string => {
    switch (courier) {
      case "fastway":
        return "border-green-300 bg-green-50";
      case "courier-guy":
        return "border-blue-300 bg-blue-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Address Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={deliveryAddress.street}
                onChange={(e) =>
                  handleAddressFieldChange("street", e.target.value)
                }
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={deliveryAddress.city}
                onChange={(e) =>
                  handleAddressFieldChange("city", e.target.value)
                }
                placeholder="Cape Town"
                required
              />
            </div>

            <div>
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                value={deliveryAddress.province}
                onChange={(e) =>
                  handleAddressFieldChange("province", e.target.value)
                }
                placeholder="Western Cape"
                required
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                value={deliveryAddress.postal_code}
                onChange={(e) =>
                  handleAddressFieldChange("postal_code", e.target.value)
                }
                placeholder="8000"
                required
              />
            </div>
          </div>

          {!addressComplete && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>
                  Complete your address to see delivery options and pricing
                </strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Options */}
      {addressComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingQuotes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Getting real-time delivery quotes...</span>
              </div>
            ) : quotesError ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {quotesError}. Using standard rates below.
                </AlertDescription>
              </Alert>
            ) : null}

            {quotes.length > 0 && (
              <div className="space-y-3 mt-4">
                {quotes.map((quote, index) => (
                  <div
                    key={`${quote.courier}-${index}`}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedQuote?.courier === quote.courier &&
                      selectedQuote?.service_name === quote.service_name
                        ? "border-book-500 bg-book-50"
                        : getCourierBrandColor(quote.courier)
                    }`}
                    onClick={() => onQuoteSelect(quote)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getCourierLogo(quote.courier)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {quote.service_name}
                          </h4>
                          <p className="text-sm text-gray-600 max-w-xs">
                            {quote.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {quote.estimated_days} business day
                              {quote.estimated_days !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          R{quote.price.toFixed(2)}
                        </div>

                        {selectedQuote?.courier === quote.courier &&
                          selectedQuote?.service_name ===
                            quote.service_name && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-4 h-4 text-book-600" />
                              <span className="text-xs text-book-600 font-medium">
                                Selected
                              </span>
                            </div>
                          )}

                        {index === 0 && quotes.length > 1 && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Cheapest
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {addressComplete && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Delivery Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All deliveries are tracked and insured</li>
                  <li>• Delivery times are business days (Mon-Fri)</li>
                  <li>• You'll receive tracking information via email</li>
                  <li>• Someone must be available to receive the package</li>
                </ul>
              </div>
            )}

            {quotes.length > 0 && (
              <Button
                onClick={fetchDeliveryQuotes}
                variant="outline"
                size="sm"
                disabled={loadingQuotes}
                className="mt-4 w-full"
              >
                <Package className="w-4 h-4 mr-2" />
                {loadingQuotes ? "Refreshing..." : "Refresh Quotes"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourierQuoteSystem;
