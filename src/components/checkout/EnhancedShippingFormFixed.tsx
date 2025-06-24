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
import RealCourierPricing from "@/services/realCourierPricing";

// Simplified validation schema
const shippingSchema = z.object({
  recipient_name: z.string().min(1, "Name is required"),
  phone: z.string().min(8, "Phone number required"),
  street_address: z.string().min(3, "Address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().min(3, "Postal code required"),
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

interface EnhancedShippingFormFixedProps {
  onComplete: (
    shippingData: ShippingFormData,
    deliveryOptions: DeliveryOption[],
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

const EnhancedShippingFormFixed: React.FC<EnhancedShippingFormFixedProps> = ({
  onComplete,
  cartItems,
}) => {
  const { isLoaded } = useGoogleMaps();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    mode: "onChange",
  });

  const watchedValues = watch();

  // Auto-get delivery quotes when address is complete
  useEffect(() => {
    if (
      watchedValues.city &&
      watchedValues.province &&
      watchedValues.postal_code
    ) {
      getDeliveryQuotes();
    }
  }, [watchedValues.city, watchedValues.province, watchedValues.postal_code]);

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
      const totalWeight = cartItems.length * 0.6;
      const estimatedValue = cartItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );

      const quoteRequest = {
        from: {
          city: "Cape Town",
          province: "Western Cape",
          postal_code: "7500",
        },
        to: {
          city: watchedValues.city,
          province: watchedValues.province,
          postal_code: watchedValues.postal_code,
        },
        parcel: {
          weight: totalWeight,
          length: 25,
          width: 20,
          height: cartItems.length * 2,
          value: estimatedValue,
        },
      };

      const courierQuotes = await RealCourierPricing.getAllQuotes(quoteRequest);

      // Add Cape Town local delivery if applicable
      const isCapeTownLocal =
        watchedValues.province === "Western Cape" &&
        (watchedValues.city.toLowerCase().includes("cape town") ||
          watchedValues.city.toLowerCase().includes("stellenbosch") ||
          watchedValues.city.toLowerCase().includes("paarl"));

      let allQuotes = [...courierQuotes];
      if (isCapeTownLocal) {
        const localQuotes = RealCourierPricing.getCapeTownLocalRates();
        allQuotes.unshift(...localQuotes);
      }

      const options: DeliveryOption[] = allQuotes.map((quote) => ({
        id: quote.id,
        provider: quote.provider,
        service_name: quote.service_name,
        price: quote.price,
        estimated_days: quote.estimated_days,
        description: quote.description,
      }));

      setDeliveryOptions(options);
      toast.success(
        `${options.length} delivery option${options.length !== 1 ? "s" : ""} found`,
      );
    } catch (error) {
      console.error("Error getting delivery quotes:", error);

      // Provide fallback options
      const fallbackOptions: DeliveryOption[] = [
        {
          id: "courier_guy_standard",
          provider: "courier-guy",
          service_name: "Courier Guy - Standard",
          price: 89,
          estimated_days: "3-5 days",
          description: "Reliable nationwide delivery",
        },
        {
          id: "fastway_express",
          provider: "fastway",
          service_name: "Fastway - Express",
          price: 99,
          estimated_days: "2-4 days",
          description: "Fast express delivery",
        },
      ];

      setDeliveryOptions(fallbackOptions);
      toast.success(`${fallbackOptions.length} delivery options loaded`);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const onSubmit = async (data: ShippingFormData) => {
    try {
      setIsLoading(true);

      // Ensure we have delivery options
      if (deliveryOptions.length === 0) {
        await getDeliveryQuotes();

        // If still no options, create emergency fallback
        if (deliveryOptions.length === 0) {
          const emergencyOptions: DeliveryOption[] = [
            {
              id: "emergency_standard",
              provider: "courier-guy",
              service_name: "Standard Delivery",
              price: 99,
              estimated_days: "3-5 days",
              description: "Standard nationwide delivery",
            },
          ];
          setDeliveryOptions(emergencyOptions);
        }
      }

      // Save address to profile
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

      // Always ensure we have delivery options to pass
      const optionsToPass =
        deliveryOptions.length > 0
          ? deliveryOptions
          : [
              {
                id: "default_standard",
                provider: "courier-guy" as const,
                service_name: "Standard Delivery",
                price: 99,
                estimated_days: "3-5 days",
                description: "Standard nationwide delivery",
              },
            ];

      onComplete(data, optionsToPass);
      toast.success("Proceeding to delivery selection");
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
                {...register("street_address")}
                placeholder="Enter street address"
              />
              {errors.street_address && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.street_address.message}
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
                  value={watchedValues.province || ""}
                  onValueChange={(value) => {
                    setValue("province", value, { shouldValidate: true });
                  }}
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
              placeholder="e.g., Leave with security, ring doorbell twice"
              rows={3}
            />
          </div>

          {/* Delivery Options Preview */}
          {deliveryOptions.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">
                ✓ {deliveryOptions.length} delivery option
                {deliveryOptions.length !== 1 ? "s" : ""} available
              </h4>
              <p className="text-sm text-green-700">
                From R{Math.min(...deliveryOptions.map((o) => o.price))} - R
                {Math.max(...deliveryOptions.map((o) => o.price))}
              </p>
            </div>
          )}

          {isLoadingQuotes && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Getting delivery quotes...</span>
            </div>
          )}

          <Alert>
            <Truck className="w-4 h-4" />
            <AlertDescription>
              We'll find the best delivery options for your location. You'll be
              able to choose your preferred courier on the next step.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={isLoading || isLoadingQuotes}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isLoadingQuotes ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Delivery Options...
              </>
            ) : (
              <>
                Continue to Delivery Selection
                {deliveryOptions.length > 0 && (
                  <span className="ml-2">
                    ({deliveryOptions.length} option
                    {deliveryOptions.length !== 1 ? "s" : ""})
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

export default EnhancedShippingFormFixed;
