import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface CheckoutShippingFormProps {
  onComplete: (shippingData: ShippingFormData, deliveryQuotes: any[]) => void;
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

const CheckoutShippingForm: React.FC<CheckoutShippingFormProps> = ({
  onComplete,
  cartItems,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryQuotes, setDeliveryQuotes] = useState<any[]>([]);

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

  const province = watch("province");

  // Load user's saved addresses if available
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // First try to get address from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Then try to get from addresses/banking_details table
        const { data: savedAddress } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .single();

        const addressData = savedAddress || profile;

        if (addressData) {
          // Pre-fill with saved data
          setValue(
            "recipient_name",
            addressData.recipient_name || addressData.name || "",
          );
          setValue("phone", addressData.phone || "");
          setValue(
            "street_address",
            addressData.street_address || addressData.address_line_1 || "",
          );
          setValue(
            "apartment",
            addressData.apartment || addressData.address_line_2 || "",
          );
          setValue("city", addressData.city || "");
          setValue("province", addressData.province || "");
          setValue("postal_code", addressData.postal_code || "");

          toast.success("Loaded your saved address");
        }
      } catch (error) {
        console.error("Error loading saved address:", error);
        // Don't show error to user, just let them fill manually
      }
    };

    loadSavedAddress();
  }, [setValue]);

  const getDeliveryQuotes = async (shippingData: ShippingFormData) => {
    try {
      setIsLoading(true);

      // Get delivery quotes from multiple services
      const quotePromises = [];

      // Calculate total weight and dimensions (estimate for books)
      const totalWeight = cartItems.length * 0.5; // Assume 500g per book
      const dimensions = {
        length: 25,
        width: 20,
        height: cartItems.length * 2, // Stack height
      };

      // Fastway Couriers
      quotePromises.push(
        supabase.functions.invoke("fastway-quote", {
          body: {
            pickup_address: {
              city: "Cape Town",
              province: "Western Cape",
              postal_code: "7500",
            },
            delivery_address: {
              city: shippingData.city,
              province: shippingData.province,
              postal_code: shippingData.postal_code,
            },
            parcel_details: {
              weight: totalWeight,
              length: dimensions.length,
              width: dimensions.width,
              height: dimensions.height,
            },
          },
        }),
      );

      // The Courier Guy
      quotePromises.push(
        supabase.functions.invoke("courier-guy-quote", {
          body: {
            pickup_address: {
              city: "Cape Town",
              province: "Western Cape",
              postal_code: "7500",
            },
            delivery_address: {
              city: shippingData.city,
              province: shippingData.province,
              postal_code: shippingData.postal_code,
            },
            parcel_details: {
              weight: totalWeight,
              length: dimensions.length,
              width: dimensions.width,
              height: dimensions.height,
            },
          },
        }),
      );

      const results = await Promise.allSettled(quotePromises);
      const quotes: any[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.data) {
          const serviceNames = ["RAM Couriers", "Fastway"];
          const data = result.value.data;

          if (data.success && data.quotes) {
            data.quotes.forEach((quote: any) => {
              quotes.push({
                id: `${serviceNames[index]}_${quote.service_type || index}`,
                service_name: `${serviceNames[index]} - ${quote.service_type || "Standard"}`,
                price: quote.price || quote.cost || 0,
                estimated_days: quote.estimated_days || "3-5",
                description: quote.description,
                service_code: quote.service_code,
                provider: serviceNames[index].toLowerCase().replace(" ", "_"),
              });
            });
          }
        }
      });

      // Add fallback local delivery option
      if (shippingData.province === "Western Cape") {
        quotes.unshift({
          id: "local_delivery",
          service_name: "Local Delivery - Cape Town",
          price: 50,
          estimated_days: "1-2",
          description: "Fast local delivery within Cape Town area",
          service_code: "LOCAL",
          provider: "local",
        });
      }

      // Add standard delivery as fallback
      if (quotes.length === 0) {
        quotes.push({
          id: "standard_delivery",
          service_name: "Standard Delivery",
          price: 99,
          estimated_days: "5-7",
          description: "Standard courier delivery nationwide",
          service_code: "STANDARD",
          provider: "standard",
        });
      }

      return quotes;
    } catch (error) {
      console.error("Error getting delivery quotes:", error);
      toast.error("Failed to get delivery quotes");

      // Return fallback options
      return [
        {
          id: "standard_delivery",
          service_name: "Standard Delivery",
          price: 99,
          estimated_days: "5-7",
          description: "Standard courier delivery",
          service_code: "STANDARD",
          provider: "standard",
        },
      ];
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ShippingFormData) => {
    try {
      setIsLoading(true);

      // Get delivery quotes
      const quotes = await getDeliveryQuotes(data);
      setDeliveryQuotes(quotes);

      // Proceed to next step
      onComplete(data, quotes);

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
                <Select onValueChange={(value) => setValue("province", value)}>
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
            <Input
              id="special_instructions"
              {...register("special_instructions")}
              placeholder="e.g., Leave with security, ring doorbell twice"
            />
          </div>

          <Alert>
            <Truck className="w-4 h-4" />
            <AlertDescription>
              We'll find the best delivery options for your location. Most
              deliveries take 3-7 business days depending on your area.
            </AlertDescription>
          </Alert>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Delivery Options...
              </>
            ) : (
              "Continue to Delivery Options"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutShippingForm;
