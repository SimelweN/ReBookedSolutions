import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  Clock,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  lat?: number;
  lng?: number;
}

interface CourierQuote {
  courier: string;
  service_name: string;
  service_code: string;
  price: number;
  estimated_days: string;
  description: string;
}

interface CourierSelectionProps {
  fromAddress: DeliveryAddress;
  toAddress: DeliveryAddress;
  onQuoteSelect: (quote: CourierQuote) => void;
  selectedQuote?: CourierQuote;
  className?: string;
}

const CourierSelection: React.FC<CourierSelectionProps> = ({
  fromAddress,
  toAddress,
  onQuoteSelect,
  selectedQuote,
  className = "",
}) => {
  const [quotes, setQuotes] = useState<CourierQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      fromAddress &&
      toAddress &&
      fromAddress.postal_code &&
      toAddress.postal_code
    ) {
      fetchDeliveryQuotes();
    }
  }, [
    fromAddress.postal_code,
    toAddress.postal_code,
    fromAddress.city,
    toAddress.city,
  ]);

  const fetchDeliveryQuotes = async () => {
    setLoading(true);
    setError(null);
    setQuotes([]);

    try {
      // Fetch quotes from multiple couriers
      const [courierGuyQuotes, fastwayQuotes] = await Promise.allSettled([
        getCourierGuyQuote(),
        getFastwayQuote(),
      ]);

      const allQuotes: CourierQuote[] = [];

      // Process Courier Guy quotes
      if (courierGuyQuotes.status === "fulfilled" && courierGuyQuotes.value) {
        allQuotes.push(...courierGuyQuotes.value);
      }

      // Process Fastway quotes
      if (fastwayQuotes.status === "fulfilled" && fastwayQuotes.value) {
        allQuotes.push(...fastwayQuotes.value);
      }

      if (allQuotes.length === 0) {
        // Use fallback quotes if no API quotes available
        allQuotes.push(...getFallbackQuotes());
      }

      // Sort quotes by price
      allQuotes.sort((a, b) => a.price - b.price);
      setQuotes(allQuotes);

      // Auto-select the cheapest option
      if (allQuotes.length > 0 && !selectedQuote) {
        onQuoteSelect(allQuotes[0]);
      }
    } catch (error) {
      setError("Failed to fetch delivery quotes. Using standard rates.");

      // Use fallback quotes
      const fallbackQuotes = getFallbackQuotes();
      setQuotes(fallbackQuotes);
      if (fallbackQuotes.length > 0 && !selectedQuote) {
        onQuoteSelect(fallbackQuotes[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCourierGuyQuote = async (): Promise<CourierQuote[]> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "courier-guy-quote",
        {
          body: {
            collection_postcode: fromAddress.postal_code,
            delivery_postcode: toAddress.postal_code,
            parcel_value: 100, // Default book value
            weight: 0.5, // Default book weight in kg
          },
        },
      );

      if (error) throw error;

      interface CourierGuyQuote {
        service_name?: string;
        service_code?: string;
        price?: number;
        estimated_days?: string;
        description?: string;
      }

      if (data.success && data.quotes) {
        return data.quotes.map((quote: CourierGuyQuote) => ({
          courier: "courier-guy",
          service_name: quote.service_name || "Courier Guy Standard",
          service_code: quote.service_code || "STD",
          price: quote.price || 95,
          estimated_days: quote.estimated_days || "1-2",
          description: quote.description || "Courier Guy delivery service",
        }));
      }

      return [];
    } catch (error) {
      console.warn("Courier Guy API failed, using fallback options");
      // Return fallback courier options
      return [
        {
          courier: "courier-guy",
          service_name: "Standard Service (Estimate)",
          cost: 65,
          estimated_delivery: "3-5 business days",
          isEstimate: true,
        },
      ];
    }
  };

  const getFastwayQuote = async (): Promise<CourierQuote[]> => {
    try {
      const { data, error } = await supabase.functions.invoke("fastway-quote", {
        body: {
          collection_postcode: fromAddress.postal_code,
          delivery_postcode: toAddress.postal_code,
          weight: 0.5,
          value: 100,
        },
      });

      if (error) throw error;

      interface FastwayQuote {
        service_name?: string;
        service_code?: string;
        cost?: number;
        delivery_timeframe?: string;
        service_description?: string;
      }

      if (data.success && data.quotes) {
        return data.quotes.map((quote: FastwayQuote) => ({
          courier: "fastway",
          service_name: quote.service_name || "Fastway Standard",
          service_code: quote.service_code || "STANDARD",
          price: quote.cost || 85,
          estimated_days: quote.delivery_timeframe || "2-3",
          description: quote.service_description || "Fastway courier service",
        }));
      }

      return [];
    } catch (error) {
      console.warn("Fastway API failed, using fallback options");
      // Return fallback courier options
      return [
        {
          courier: "fastway",
          service_name: "Express Service (Estimate)",
          cost: 85,
          estimated_delivery: "2-4 business days",
          isEstimate: true,
        },
      ];
    }
  };

  const getFallbackQuotes = (): CourierQuote[] => {
    // Calculate distance-based pricing as fallback
    const basePrice = calculateDistanceBasedPrice();

    return [
      {
        courier: "courier-guy",
        service_name: "Courier Guy Express",
        service_code: "EXPRESS",
        price: Math.round(basePrice * 1.2),
        estimated_days: "1-2",
        description: "Express delivery service",
      },
      {
        courier: "fastway",
        service_name: "Fastway Standard",
        service_code: "STANDARD",
        price: basePrice,
        estimated_days: "2-3",
        description: "Standard delivery service",
      },
    ];
  };

  const calculateDistanceBasedPrice = (): number => {
    // Simple distance-based calculation
    // In production, this would use proper distance calculation
    const fromPostal = parseInt(fromAddress.postal_code) || 8000;
    const toPostal = parseInt(toAddress.postal_code) || 8000;
    const postalDiff = Math.abs(fromPostal - toPostal);

    // Base price starts at R50, increases with postal code difference
    const basePrice = 50;
    const distanceMultiplier = Math.min(postalDiff / 1000, 3); // Cap at 3x

    return Math.round(basePrice + basePrice * distanceMultiplier);
  };

  const getCourierLogo = (courier: string) => {
    switch (courier) {
      case "courier-guy":
        return "🚚"; // Could be replaced with actual logo
      case "fastway":
        return "📦"; // Could be replaced with actual logo
      default:
        return "🚛";
    }
  };

  const getCourierColor = (courier: string) => {
    switch (courier) {
      case "courier-guy":
        return "border-blue-200 bg-blue-50";
      case "fastway":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Getting delivery quotes...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Delivery Options
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quotes.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No delivery options available for this route. Please check your
              addresses.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote, index) => (
              <div
                key={`${quote.courier}-${quote.service_code}-${index}`}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedQuote?.courier === quote.courier &&
                  selectedQuote?.service_code === quote.service_code
                    ? "border-book-500 bg-book-50"
                    : getCourierColor(quote.courier)
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
                      <p className="text-sm text-gray-600">
                        {quote.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {quote.estimated_days} business days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        R{quote.price.toFixed(2)}
                      </span>
                    </div>

                    {selectedQuote?.courier === quote.courier &&
                      selectedQuote?.service_code === quote.service_code && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-4 h-4 text-book-600" />
                          <span className="text-xs text-book-600 font-medium">
                            Selected
                          </span>
                        </div>
                      )}

                    {index === 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Cheapest
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Delivery Information
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All deliveries are tracked and insured</li>
            <li>• You'll receive tracking information via email</li>
            <li>• Delivery times are business days (Mon-Fri)</li>
            <li>• Someone must be available to receive the package</li>
          </ul>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={fetchDeliveryQuotes}
          variant="outline"
          size="sm"
          disabled={loading}
          className="w-full"
        >
          <Package className="w-4 h-4 mr-2" />
          Refresh Quotes
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourierSelection;
