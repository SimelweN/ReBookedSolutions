import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Truck, Clock, DollarSign, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import {
  getAllDeliveryQuotes,
  UnifiedQuoteRequest,
} from "@/services/unifiedDeliveryService";
import FallbackDeliveryService from "@/services/fallbackDeliveryService";

const shippingSchema = z.object({
  recipient_name: z.string().min(2, "Recipient name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street_address: z.string().min(5, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postal_code: z.string().min(4, "Valid postal code is required"),
  special_instructions: z.string().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface DeliveryOption {
  id: string;
  provider: "courier-guy" | "fastway";
  service_name: string;
  price: number;
  estimated_days: string;
  description: string;
}

interface EnhancedShippingFormProps {
  onComplete: (
    shippingData: ShippingFormData,
    selectedDeliveryOption: DeliveryOption,
  ) => void;
  cartItems: any[];
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const EnhancedShippingForm: React.FC<EnhancedShippingFormProps> = ({
  onComplete,
  cartItems,
}) => {
  const { isLoaded } = useGoogleMaps();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] =
    useState<DeliveryOption | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const watchedValues = watch();

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (isLoaded && addressInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: "za" },
          fields: ["address_components", "formatted_address", "geometry"],
          types: ["address"],
        },
      );

      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

  // Load user's saved address on component mount
  useEffect(() => {
    loadSavedAddress();
  }, []);

  // Get delivery quotes when address is complete
  useEffect(() => {
    if (
      watchedValues.city &&
      watchedValues.province &&
      watchedValues.postal_code
    ) {
      getDeliveryQuotes();
    }
  }, [watchedValues.city, watchedValues.province, watchedValues.postal_code]);

  const loadSavedAddress = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get address from profiles table first
      const { data: profile } = await supabase
        .from("profiles")
        .select("shipping_address")
        .eq("id", user.id)
        .single();

      if (profile?.shipping_address) {
        setSavedAddress(profile.shipping_address);

        // Pre-fill form with saved address if not editing
        if (!isEditingAddress) {
          populateFormWithAddress(profile.shipping_address);
        }
      }
    } catch (error) {
      console.error("Error loading saved address:", error);
    }
  };

  const populateFormWithAddress = (address: any) => {
    setValue("recipient_name", address.name || "");
    setValue("phone", address.phone || "");
    setValue(
      "street_address",
      address.streetAddress || address.street_address || "",
    );
    setValue("apartment", address.apartment || address.unit_number || "");
    setValue("city", address.city || "");
    setValue("province", address.province || "");
    setValue("postal_code", address.postalCode || address.postal_code || "");
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.address_components) return;

    let streetNumber = "";
    let route = "";
    let locality = "";
    let sublocality = "";
    let adminArea1 = "";
    let postalCode = "";

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        route = component.long_name;
      } else if (types.includes("locality")) {
        locality = component.long_name;
      } else if (types.includes("sublocality")) {
        sublocality = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        adminArea1 = component.long_name;
      } else if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    });

    // Populate form fields
    setValue("street_address", `${streetNumber} ${route}`.trim());
    setValue("city", locality || sublocality);
    setValue("province", adminArea1);
    setValue("postal_code", postalCode);

    toast.success("Address details filled from Google Maps");
  };

  const getDeliveryQuotes = async () => {
    if (
      !watchedValues.city ||
      !watchedValues.province ||
      !watchedValues.postal_code
    ) {
      return;
    }

    setIsLoadingQuotes(true);
    try {
      // Calculate total weight and dimensions for quotes
      const totalWeight = cartItems.length * 0.5; // Assume 500g per book
      const dimensions = {
        length: 25,
        width: 20,
        height: cartItems.length * 2,
      };

      const quoteRequest: UnifiedQuoteRequest = {
        from: {
          streetAddress: "123 Business St", // Seller's address (placeholder)
          city: "Cape Town",
          province: "Western Cape",
          postalCode: "7500",
        },
        to: {
          streetAddress: watchedValues.street_address,
          city: watchedValues.city,
          province: watchedValues.province,
          postalCode: watchedValues.postal_code,
        },
        weight: totalWeight,
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
      };

      try {
        const quotes = await getAllDeliveryQuotes(quoteRequest);

        // Convert to delivery options format with safe fallbacks
        const options: DeliveryOption[] = quotes
          .filter(
            (quote) =>
              quote && typeof quote.cost === "number" && quote.cost > 0,
          )
          .map((quote) => ({
            id: `${quote.provider}_${quote.service_code}`,
            provider: quote.provider as "courier-guy" | "fastway",
            service_name: quote.service_name || "Standard Delivery",
            price: Number(quote.cost) || 99,
            estimated_days: quote.transit_days
              ? `${quote.transit_days} day${quote.transit_days !== 1 ? "s" : ""}`
              : "3-5 days",
            description: Array.isArray(quote.features)
              ? quote.features.join(", ")
              : "Standard delivery service",
          }));

        // Add local delivery option for Western Cape
        if (watchedValues.province === "Western Cape") {
          options.unshift({
            id: "local_delivery",
            provider: "courier-guy",
            service_name: "Local Delivery - Cape Town",
            price: 50,
            estimated_days: "1-2 days",
            description: "Fast local delivery within Cape Town area",
          });
        }

        // If we got valid options, use them
        if (options.length > 0) {
          setDeliveryOptions(options);

          // Auto-select cheapest option
          const cheapest = options.reduce((prev, current) =>
            (prev.price || 99) < (current.price || 99) ? prev : current,
          );
          setSelectedDeliveryOption(cheapest);
          return;
        }
      } catch (quoteError) {
        console.warn(
          "Quote service unavailable, using fallback pricing:",
          quoteError,
        );

        // Use intelligent fallback pricing
        const isLocal = FallbackDeliveryService.isLocalDelivery(
          "Cape Town", // Default sender city
          watchedValues.city,
          "Western Cape", // Default sender province
          watchedValues.province,
        );

        const fallbackQuotes = FallbackDeliveryService.getFallbackQuotes({
          fromProvince: "Western Cape",
          toProvince: watchedValues.province,
          weight: totalWeight,
          isLocal: isLocal,
        });

        // Convert fallback quotes to delivery options
        const fallbackOptions: DeliveryOption[] = fallbackQuotes.map(
          (quote) => ({
            id: quote.id,
            provider: quote.provider,
            service_name: quote.service_name,
            price: quote.price,
            estimated_days: quote.estimated_days,
            description: quote.description,
          }),
        );

        setDeliveryOptions(fallbackOptions);
        setSelectedDeliveryOption(fallbackOptions[0]);
        toast.info(
          "Using standard delivery rates - live quotes temporarily unavailable",
        );
        return;
      }

      // This should not be reached now
      throw new Error("No quotes available");
    } catch (error) {
      console.error("Error getting delivery quotes:", error);

      // Provide comprehensive fallback options based on location
      const fallbackOptions: DeliveryOption[] = [];

      // Add local delivery for Western Cape
      if (watchedValues.province === "Western Cape") {
        fallbackOptions.push({
          id: "local_delivery_fallback",
          provider: "courier-guy",
          service_name: "Local Delivery - Cape Town",
          price: 50,
          estimated_days: "1-2 days",
          description: "Fast local delivery within Cape Town area",
        });
      }

      // Add standard options
      fallbackOptions.push(
        {
          id: "courier_guy_standard",
          provider: "courier-guy",
          service_name: "Courier Guy - Standard",
          price: 89,
          estimated_days: "3-5 days",
          description: "Reliable nationwide delivery",
        },
        {
          id: "fastway_standard",
          provider: "fastway",
          service_name: "Fastway - Express",
          price: 99,
          estimated_days: "2-4 days",
          description: "Fast express delivery",
        },
      );

      setDeliveryOptions(fallbackOptions);
      setSelectedDeliveryOption(fallbackOptions[0]);

      // Show a subtle warning instead of an error
      toast.info(
        "Using standard delivery rates - live quotes temporarily unavailable",
      );
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setSavedAddress(null);
  };

  const handleUseSavedAddress = () => {
    if (savedAddress) {
      setIsEditingAddress(false);
      populateFormWithAddress(savedAddress);
    }
  };

  const onSubmit = async (data: ShippingFormData) => {
    if (!selectedDeliveryOption) {
      toast.error("Please select a delivery option");
      return;
    }

    try {
      setIsLoading(true);

      // Save address for future use
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            shipping_address: {
              name: data.recipient_name,
              phone: data.phone,
              streetAddress: data.street_address,
              apartment: data.apartment,
              city: data.city,
              province: data.province,
              postalCode: data.postal_code,
            },
          })
          .eq("id", user.id);
      }

      onComplete(data, selectedDeliveryOption);
      toast.success("Shipping information saved!");
    } catch (error) {
      console.error("Error processing shipping form:", error);
      toast.error("Failed to process shipping information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Saved Address Section */}
          {savedAddress && !isEditingAddress && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-green-800 mb-2">
                    Using Saved Address
                  </h3>
                  <div className="text-sm text-green-700">
                    <p>{savedAddress.name}</p>
                    <p>{savedAddress.streetAddress}</p>
                    <p>
                      {savedAddress.apartment && `${savedAddress.apartment}, `}
                      {savedAddress.city}, {savedAddress.province}{" "}
                      {savedAddress.postalCode}
                    </p>
                    <p>{savedAddress.phone}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEditAddress}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          )}

          {/* Address Form */}
          {(!savedAddress || isEditingAddress) && (
            <>
              {savedAddress && isEditingAddress && (
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Edit Shipping Address</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseSavedAddress}
                  >
                    Use Saved Address
                  </Button>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Contact Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient_name">Full Name *</Label>
                    <Input
                      id="recipient_name"
                      {...register("recipient_name")}
                      placeholder="Enter recipient's full name"
                    />
                    {errors.recipient_name && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.recipient_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="e.g., 081 234 5678"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Delivery Address</h3>

                <div>
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Input
                    id="street_address"
                    ref={addressInputRef}
                    {...register("street_address")}
                    placeholder="Start typing your address..."
                  />
                  {errors.street_address && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.street_address.message}
                    </p>
                  )}
                  {isLoaded && (
                    <p className="text-xs text-gray-500 mt-1">
                      Powered by Google Maps - Start typing for suggestions
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="apartment">Apartment/Unit (Optional)</Label>
                  <Input
                    id="apartment"
                    {...register("apartment")}
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Select
                      onValueChange={(value) => setValue("province", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOUTH_AFRICAN_PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.province && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.province.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      {...register("postal_code")}
                      placeholder="e.g., 7500"
                    />
                    {errors.postal_code && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.postal_code.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <Label htmlFor="special_instructions">
                  Special Delivery Instructions (Optional)
                </Label>
                <Textarea
                  id="special_instructions"
                  {...register("special_instructions")}
                  placeholder="e.g., Leave with security, ring doorbell twice, call before delivery"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Delivery Options */}
          {deliveryOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Choose Delivery Option
              </h3>

              {isLoadingQuotes && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Getting delivery quotes...</span>
                </div>
              )}

              <div className="space-y-3">
                {deliveryOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedDeliveryOption?.id === option.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDeliveryOption(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedDeliveryOption?.id === option.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedDeliveryOption?.id === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {option.service_name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {option.provider === "courier-guy"
                                ? "🚚 Courier Guy"
                                : "🏃‍♂️ Fastway"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {option.estimated_days}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          R{(option.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <Truck className="w-4 h-4" />
            <AlertDescription>
              We'll find the best delivery options for your location. Delivery
              times may vary based on your area and the courier service.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={isLoading || isLoadingQuotes || !selectedDeliveryOption}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                {selectedDeliveryOption && (
                  <span className="ml-2">
                    (+R{(selectedDeliveryOption.price || 0).toFixed(2)}{" "}
                    shipping)
                  </span>
                )}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedShippingForm;
