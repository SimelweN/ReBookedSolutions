import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface SellerInfoProps {
  seller: {
    id: string;
    name: string;
    email: string;
    hasAddress?: boolean;
    hasSubaccount?: boolean;
    isReadyForOrders?: boolean;
  };
  onViewProfile: () => void;
}

const SellerInfo = ({ seller, onViewProfile }: SellerInfoProps) => {
  console.log("SellerInfo received seller data:", seller);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-3">About the Seller</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{seller?.name || "Loading..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Member since {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Seller readiness status */}
        {seller?.hasAddress !== undefined &&
          seller?.hasSubaccount !== undefined && (
            <div className="mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {seller.hasAddress ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span
                    className={`text-sm ${seller.hasAddress ? "text-green-700" : "text-amber-700"}`}
                  >
                    {seller.hasAddress
                      ? "Pickup address verified"
                      : "Pickup address needed"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {seller.hasSubaccount ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span
                    className={`text-sm ${seller.hasSubaccount ? "text-green-700" : "text-amber-700"}`}
                  >
                    {seller.hasSubaccount
                      ? "Payment setup complete"
                      : "Payment setup pending"}
                  </span>
                </div>
              </div>
            </div>
          )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Check their profile for more books and seller information
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;
