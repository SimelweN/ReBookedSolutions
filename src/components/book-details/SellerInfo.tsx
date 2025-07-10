import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            💡 Visit {seller?.name || "this seller"}'s ReBooked Mini marketplace
            for more books and seller information
          </p>
          <button
            onClick={() => navigate(`/seller/${seller?.id}`)}
            className="bg-book-600 hover:bg-book-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-2 w-full justify-center"
          >
            <Store className="h-4 w-4" />
            Visit {seller?.name || "Seller"}'s ReBooked Mini
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;
