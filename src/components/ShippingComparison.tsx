import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const ShippingComparison = () => {
  const [quotes, setQuotes] = useState<
    Array<{
      name: string;
      cost: number;
      time: string;
      reliability: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [fromAddress, setFromAddress] = useState({
    streetAddress: "",
    suburb: "",
    city: "",
    postalCode: "",
    province: "",
  });
  const [toAddress, setToAddress] = useState({
    streetAddress: "",
    suburb: "",
    city: "",
    postalCode: "",
    province: "",
  });
  const [parcelDetails, setParcelDetails] = useState({
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  // Move handleGetQuotes function declaration before useEffect
  const handleGetQuotes = useCallback(async () => {
    if (!fromAddress.city || !toAddress.city || !parcelDetails.weight) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/delivery-quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          parcelDetails: {
            ...parcelDetails,
            weight: parseFloat(parcelDetails.weight),
            length: parseFloat(parcelDetails.length),
            width: parseFloat(parcelDetails.width),
            height: parseFloat(parcelDetails.height),
          },
        }),
      });

      if (!response.ok) {
        // Fallback: provide default shipping options
        console.warn("API failed, using fallback shipping options");
        setQuotes([
          {
            provider: "Standard Delivery",
            price: 50,
            estimatedDays: "5-7 business days",
            description: "Standard postal service (fallback option)",
          },
          {
            provider: "Express Delivery",
            price: 100,
            estimatedDays: "2-3 business days",
            description: "Express postal service (fallback option)",
          },
        ]);
        toast.warning(
          "Using estimated shipping options - please contact us for accurate quotes",
        );
        return;
      }

      const data = await response.json();
      setQuotes(data.quotes || []);
      toast.success("Quotes retrieved successfully!");
    } catch (error) {
      console.error("Error getting quotes:", error);

      // Network error fallback - provide manual contact option
      setQuotes([
        {
          provider: "Contact for Quote",
          price: 0,
          estimatedDays: "TBD",
          description:
            "Please contact us directly for shipping quote due to technical issues",
        },
      ]);

      const isOffline = !navigator.onLine;
      if (isOffline) {
        toast.error(
          "You're offline. Please check your connection and try again.",
        );
      } else {
        toast.error(
          "Unable to get shipping quotes. Please contact us directly or try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [fromAddress, toAddress, parcelDetails]);

  useEffect(() => {
    // Auto-fetch quotes when all required fields are filled
    if (fromAddress.city && toAddress.city && parcelDetails.weight) {
      const timeoutId = setTimeout(() => {
        handleGetQuotes();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [handleGetQuotes, fromAddress.city, toAddress.city, parcelDetails.weight]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shipping Comparison</h1>

      {/* From Address */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>From Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="fromStreetAddress">Street Address</Label>
            <Input
              type="text"
              id="fromStreetAddress"
              value={fromAddress.streetAddress}
              onChange={(e) =>
                setFromAddress({
                  ...fromAddress,
                  streetAddress: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="fromSuburb">Suburb</Label>
            <Input
              type="text"
              id="fromSuburb"
              value={fromAddress.suburb}
              onChange={(e) =>
                setFromAddress({ ...fromAddress, suburb: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromCity">City</Label>
              <Input
                type="text"
                id="fromCity"
                value={fromAddress.city}
                onChange={(e) =>
                  setFromAddress({ ...fromAddress, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fromPostalCode">Postal Code</Label>
              <Input
                type="text"
                id="fromPostalCode"
                value={fromAddress.postalCode}
                onChange={(e) =>
                  setFromAddress({ ...fromAddress, postalCode: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="fromProvince">Province</Label>
            <Select
              onValueChange={(value) =>
                setFromAddress({ ...fromAddress, province: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gauteng">Gauteng</SelectItem>
                <SelectItem value="Western Cape">Western Cape</SelectItem>
                <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                <SelectItem value="Limpopo">Limpopo</SelectItem>
                <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                <SelectItem value="North West">North West</SelectItem>
                <SelectItem value="Free State">Free State</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* To Address */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>To Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="toStreetAddress">Street Address</Label>
            <Input
              type="text"
              id="toStreetAddress"
              value={toAddress.streetAddress}
              onChange={(e) =>
                setToAddress({ ...toAddress, streetAddress: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="toSuburb">Suburb</Label>
            <Input
              type="text"
              id="toSuburb"
              value={toAddress.suburb}
              onChange={(e) =>
                setToAddress({ ...toAddress, suburb: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="toCity">City</Label>
              <Input
                type="text"
                id="toCity"
                value={toAddress.city}
                onChange={(e) =>
                  setToAddress({ ...toAddress, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="toPostalCode">Postal Code</Label>
              <Input
                type="text"
                id="toPostalCode"
                value={toAddress.postalCode}
                onChange={(e) =>
                  setToAddress({ ...toAddress, postalCode: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="toProvince">Province</Label>
            <Select
              onValueChange={(value) =>
                setToAddress({ ...toAddress, province: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gauteng">Gauteng</SelectItem>
                <SelectItem value="Western Cape">Western Cape</SelectItem>
                <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                <SelectItem value="Limpopo">Limpopo</SelectItem>
                <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                <SelectItem value="North West">North West</SelectItem>
                <SelectItem value="Free State">Free State</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parcel Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Parcel Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                type="number"
                id="weight"
                value={parcelDetails.weight}
                onChange={(e) =>
                  setParcelDetails({ ...parcelDetails, weight: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                type="number"
                id="length"
                value={parcelDetails.length}
                onChange={(e) =>
                  setParcelDetails({ ...parcelDetails, length: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                type="number"
                id="width"
                value={parcelDetails.width}
                onChange={(e) =>
                  setParcelDetails({ ...parcelDetails, width: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                type="number"
                id="height"
                value={parcelDetails.height}
                onChange={(e) =>
                  setParcelDetails({ ...parcelDetails, height: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Get Quotes Button */}
      <Button onClick={handleGetQuotes} disabled={loading}>
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Getting Quotes...
          </>
        ) : (
          "Get Delivery Quotes"
        )}
      </Button>

      {/* Display Quotes */}
      {quotes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Delivery Quotes:</h2>
          <ul>
            {quotes.map((quote, index) => (
              <li key={index} className="mb-2">
                {quote.carrier}: R{quote.price} - ETA: {quote.eta}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShippingComparison;
