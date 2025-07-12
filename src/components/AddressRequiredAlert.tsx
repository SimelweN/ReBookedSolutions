import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Plus } from "lucide-react";

interface AddressRequiredAlertProps {
  type: "pickup" | "shipping" | "both";
  context: "listing" | "checkout" | "profile";
  onAddAddress?: () => void;
  className?: string;
}

const AddressRequiredAlert: React.FC<AddressRequiredAlertProps> = ({
  type,
  context,
  onAddAddress,
  className = "",
}) => {
  const getTitle = () => {
    switch (type) {
      case "pickup":
        return "📍 Pickup Address Required";
      case "shipping":
        return "🚚 Shipping Address Required";
      case "both":
        return "📍 Addresses Required";
      default:
        return "📍 Address Required";
    }
  };

  const getMessage = () => {
    switch (context) {
      case "listing":
        return "You need a pickup address before you can list books. Buyers need to know where to collect from you.";
      case "checkout":
        if (type === "shipping") {
          return "We need your delivery address to calculate shipping costs and process your order.";
        }
        return "We need both pickup and delivery addresses to calculate accurate shipping costs.";
      case "profile":
        return "Add your addresses to start selling books and receive deliveries.";
      default:
        return "Please add your address to continue.";
    }
  };

  const getActionText = () => {
    switch (type) {
      case "pickup":
        return "Add Pickup Address";
      case "shipping":
        return "Add Delivery Address";
      case "both":
        return "Add Addresses";
      default:
        return "Add Address";
    }
  };

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-3">
          <div>
            <div className="font-medium">{getTitle()}</div>
            <p className="text-sm mt-1">{getMessage()}</p>
          </div>

          {onAddAddress && (
            <Button
              onClick={onAddAddress}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {getActionText()}
            </Button>
          )}

          {context === "checkout" && (
            <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
              💡 <strong>Tip:</strong> Save your address in your profile to skip
              this step next time!
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AddressRequiredAlert;
