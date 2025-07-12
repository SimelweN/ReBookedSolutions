import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Users,
  Truck,
  CreditCard,
  Info,
  Package,
  DollarSign,
} from "lucide-react";

interface MultiSellerCartExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

const MultiSellerCartExplainer: React.FC<MultiSellerCartExplainerProps> = ({
  isOpen,
  onClose,
  trigger,
}) => {
  const content = (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Why Do I Have Multiple Carts?
        </DialogTitle>
        <DialogDescription className="text-left">
          Understanding how our multi-seller marketplace works
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Main Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            📚 How Our Marketplace Works
          </h3>
          <p className="text-sm text-blue-700">
            ReBooked Solutions is a <strong>multi-seller marketplace</strong>{" "}
            where students sell directly to other students. Each book you add to
            your cart comes from a different seller, so we create separate carts
            to keep everything organized.
          </p>
        </div>

        {/* Step by Step */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">
            Here's why we do this:
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-200 p-2 rounded-full">
                <Users className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <h4 className="font-medium text-green-800">
                  1. Different Sellers
                </h4>
                <p className="text-sm text-green-700">
                  Books come from individual student sellers, each with their
                  own banking details and pickup locations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-200 p-2 rounded-full">
                <CreditCard className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">
                  2. Separate Payments
                </h4>
                <p className="text-sm text-blue-700">
                  Each seller receives payment directly to their bank account,
                  so we process payments separately for each seller.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="bg-orange-200 p-2 rounded-full">
                <Truck className="h-4 w-4 text-orange-700" />
              </div>
              <div>
                <h4 className="font-medium text-orange-800">
                  3. Individual Shipping
                </h4>
                <p className="text-sm text-orange-700">
                  Books are shipped from different locations, so combining them
                  would increase courier costs and complicate logistics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-200 p-2 rounded-full">
                <Package className="h-4 w-4 text-purple-700" />
              </div>
              <div>
                <h4 className="font-medium text-purple-800">
                  4. Better Tracking
                </h4>
                <p className="text-sm text-purple-700">
                  Separate carts mean separate tracking numbers and delivery
                  schedules, making it easier to track your books.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Benefits for You
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-green-100">
                Lower Costs
              </Badge>
              <span>Optimized shipping from each seller's location</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-100">
                Faster Delivery
              </Badge>
              <span>Books ship immediately when sellers commit</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-purple-100">
                Clear Tracking
              </Badge>
              <span>Individual tracking for each seller's books</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-orange-100">
                Fair Pricing
              </Badge>
              <span>Each seller sets their own competitive prices</span>
            </li>
          </ul>
        </div>

        {/* What to Expect */}
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            💡 What to Expect
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              • <strong>Separate checkout:</strong> You'll pay each seller
              individually
            </p>
            <p>
              • <strong>Different delivery times:</strong> Books may arrive on
              different days
            </p>
            <p>
              • <strong>Individual receipts:</strong> You'll get a receipt for
              each purchase
            </p>
            <p>
              • <strong>Seller commitments:</strong> Each seller has 48 hours to
              confirm your order
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-book-600 hover:bg-book-700">
            Got it, thanks!
          </Button>
        </div>
      </div>
    </>
  );

  if (trigger) {
    return (
      <>
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {content}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default MultiSellerCartExplainer;
