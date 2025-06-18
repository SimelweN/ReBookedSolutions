import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Package,
  Truck,
  Bell,
  ArrowRight,
  Mail,
  Phone,
  DollarSign,
} from "lucide-react";
import { addNotification } from "@/services/notificationService";
import BuyerContactService from "@/services/buyerContactService";
import SellerPayoutService from "@/services/sellerPayoutService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SaleSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookPrice: number;
  buyerName?: string;
  buyerEmail?: string;
  saleId?: string;
}

const SaleSuccessPopup = ({
  isOpen,
  onClose,
  bookTitle,
  bookPrice,
  buyerName,
  saleId,
}: SaleSuccessPopupProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isAddingNotification, setIsAddingNotification] = useState(false);

  const steps = [
    {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      title: "🎉 Congratulations! Your book has been sold!",
      description: `"${bookTitle}" sold for R${bookPrice}`,
    },
    {
      icon: <Package className="h-12 w-12 text-blue-500" />,
      title: "📦 Next Steps",
      description: "Here's what you need to do to complete the sale",
    },
  ];

  const nextSteps = [
    {
      icon: "📦",
      title: "Prepare Your Book",
      description:
        "Ensure the book is in the condition described and package it securely",
      action: "Clean and package the book",
    },
    {
      icon: "📱",
      title: "Contact the Buyer",
      description: `Reach out to ${buyerName || "the buyer"} to arrange delivery`,
      action: "Send message to buyer",
    },
    {
      icon: "🚚",
      title: "Arrange Delivery",
      description: "Use our integrated shipping partners or arrange pickup",
      action: "Set up delivery",
    },
    {
      icon: "📍",
      title: "Track Progress",
      description: "Monitor the delivery status and confirm receipt",
      action: "Track shipment",
    },
  ];

  useEffect(() => {
    if (isOpen && user) {
      // Add immediate notification to user's notification history
      saveNotificationToHistory();
    }
  }, [isOpen, user]);

  const saveNotificationToHistory = async () => {
    if (!user || isAddingNotification) return;

    setIsAddingNotification(true);
    try {
      await addNotification({
        userId: user.id,
        title: "🎉 Book Sold Successfully!",
        message: `Your book "${bookTitle}" has been sold for R${bookPrice}. Next steps: prepare the book for delivery, contact the buyer, and arrange shipping.`,
        type: "success",
        read: false,
      });
    } catch (error) {
      console.error("Error saving sale notification:", error);
      // Don't show error to user as this is background operation
    } finally {
      setIsAddingNotification(false);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleClose = () => {
    setStep(0);
    onClose();
    toast.success("Sale notification saved to your notifications!");
  };

  const handleViewNotifications = () => {
    handleClose();
    window.location.href = "/notifications";
  };

  const handleViewSale = () => {
    handleClose();
    if (saleId) {
      window.location.href = `/activity`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{steps[step].title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">{steps[step].icon}</div>

            {step === 0 && (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-900">
                  {steps[step].description}
                </p>
                {buyerName && (
                  <Badge variant="outline" className="text-sm">
                    Buyer: {buyerName}
                  </Badge>
                )}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    💰 <strong>R{bookPrice}</strong> will be transferred to your
                    account once delivery is confirmed
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  {steps[step].description}
                </p>

                <div className="space-y-3">
                  {nextSteps.map((nextStep, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                    >
                      <span className="text-lg">{nextStep.icon}</span>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-sm">
                          {nextStep.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {nextStep.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      This notification has been saved to your notification
                      history
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {step === 0 && (
              <>
                <Button onClick={handleNext} className="flex-1">
                  See Next Steps
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleViewNotifications}
                  className="flex-1"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  View Notifications
                </Button>
                <Button onClick={handleViewSale} className="flex-1">
                  View Sale Details
                </Button>
              </>
            )}
          </div>

          {step === 1 && (
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-sm"
            >
              I'll handle this later
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaleSuccessPopup;
