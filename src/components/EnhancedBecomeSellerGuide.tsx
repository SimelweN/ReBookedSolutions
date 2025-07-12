import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Truck,
  BookOpen,
  User,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  SellerValidationService,
  SellerValidationResult,
} from "@/services/sellerValidationService";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedBecomeSellerGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedBecomeSellerGuide: React.FC<EnhancedBecomeSellerGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationResult, setValidationResult] =
    useState<SellerValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check user's current status when component opens
  useEffect(() => {
    if (isOpen && user?.id) {
      checkUserStatus();
    }
  }, [isOpen, user?.id]);

  const checkUserStatus = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await SellerValidationService.validateSellerRequirements(
        user.id,
      );
      setValidationResult(result);

      // If user is already ready to sell, skip to the final step
      if (result.canSell) {
        setCurrentStep(4); // Jump to "Ready to Start" step
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!validationResult) return 0;
    let completed = 0;
    if (validationResult.hasAddress) completed += 50;
    if (validationResult.hasBankingDetails) completed += 50;
    return completed;
  };

  const steps = [
    {
      title: "Welcome to Selling",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Turn Your Textbooks Into Cash!
            </h3>
            <p className="text-gray-600">
              Join thousands of students earning money from their used
              textbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <CardContent className="pt-0">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Keep 90%</h4>
                <p className="text-sm text-gray-600">Of your sale price</p>
              </CardContent>
            </Card>

            <Card className="text-center p-4">
              <CardContent className="pt-0">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Secure Payments</h4>
                <p className="text-sm text-gray-600">Safe & guaranteed</p>
              </CardContent>
            </Card>

            <Card className="text-center p-4">
              <CardContent className="pt-0">
                <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">No Fees</h4>
                <p className="text-sm text-gray-600">Until you sell</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">
              Why students love selling with ReBooked:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Reach students from all universities in South Africa</li>
              <li>• We handle all payment processing and disputes</li>
              <li>• No upfront costs or monthly fees</li>
              <li>• Professional courier pickup and delivery</li>
              <li>• Get paid within 24 hours of successful delivery</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Your Progress",
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Setup Progress</h3>
            <p className="text-gray-600 mb-4">
              Complete these steps to start selling your textbooks
            </p>

            <div className="mb-6">
              <Progress value={getCompletionPercentage()} className="h-3" />
              <p className="text-sm text-gray-500 mt-2">
                {getCompletionPercentage()}% Complete
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                validationResult?.hasAddress
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  validationResult?.hasAddress
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                <MapPin
                  className={`w-5 h-5 ${validationResult?.hasAddress ? "text-green-600" : "text-yellow-600"}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Pickup Address</p>
                  {validationResult?.hasAddress && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Where couriers will collect your books from
                </p>
                {validationResult?.addressDetails?.pickup_address && (
                  <p className="text-xs text-gray-500 mt-1">
                    {validationResult.addressDetails.pickup_address.city},{" "}
                    {validationResult.addressDetails.pickup_address.province}
                  </p>
                )}
              </div>
              {!validationResult?.hasAddress && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    navigate("/profile?tab=addresses");
                  }}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Setup
                </Button>
              )}
            </div>

            <div
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                validationResult?.hasBankingDetails
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  validationResult?.hasBankingDetails
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                <CreditCard
                  className={`w-5 h-5 ${validationResult?.hasBankingDetails ? "text-green-600" : "text-yellow-600"}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Banking Details</p>
                  {validationResult?.hasBankingDetails && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Where we'll send your payments
                </p>
                {validationResult?.bankingDetails && (
                  <p className="text-xs text-gray-500 mt-1">
                    {validationResult.bankingDetails.bank_name} account added
                  </p>
                )}
              </div>
              {!validationResult?.hasBankingDetails && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    navigate("/profile?tab=banking");
                  }}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Setup
                </Button>
              )}
            </div>
          </div>

          {validationResult?.canSell && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800 mb-1">
                🎉 You're all set to start selling!
              </h4>
              <p className="text-sm text-green-700">
                All requirements completed. You can now list your textbooks.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "48-Hour Commitment Rule",
      icon: Clock,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Critical: 48-Hour Commitment
            </h3>
            <p className="text-gray-600">
              This is the most important rule for sellers
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800 mb-2">
                  The 48-Hour Rule Explained
                </h4>
                <p className="text-sm text-orange-700">
                  When someone buys your book, you have exactly 48 hours to
                  confirm the sale and prepare the book for courier collection.
                  Miss this deadline and you'll forfeit the sale.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Student pays for your book</p>
                <p className="text-sm text-gray-600">
                  Payment is held securely by ReBooked - you're guaranteed to
                  get paid
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">You have 48 hours to commit</p>
                <p className="text-sm text-gray-600">
                  Confirm the sale in your dashboard and prepare the book for
                  pickup
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Courier collects your book</p>
                <p className="text-sm text-gray-600">
                  We arrange pickup from your address - you don't pay courier
                  fees
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-medium">You get paid</p>
                <p className="text-sm text-gray-600">
                  Money transfers to your bank account within 24 hours of
                  successful delivery
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-700 mb-1">
                  What happens if you miss the deadline?
                </h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Student gets an automatic full refund</li>
                  <li>• You forfeit the sale completely</li>
                  <li>• Your seller rating may be affected</li>
                  <li>• The book becomes available for other buyers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Payment & Fees",
      icon: DollarSign,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">How payments work</h3>
            <p className="text-gray-600">
              Transparent pricing with no hidden fees
            </p>
          </div>

          {/* Important Payment & Shipping Terms */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3 text-center">
              🔑 Key Payment & Shipping Terms
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">
                  💰 When You Get Paid
                </h5>
                <p className="text-blue-700">
                  <strong>AFTER DELIVERY ONLY</strong> - You receive payment
                  only when the book is successfully delivered to the buyer.
                  Never before.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">
                  📦 Shipping Costs
                </h5>
                <p className="text-blue-700">
                  <strong>BUYER PAYS ALL SHIPPING</strong> - The buyer covers
                  all courier and delivery costs. You pay nothing for shipping.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-4 text-center">
              Payment Breakdown Example
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Your book sells for:</span>
                <span className="font-medium text-lg">R200.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">ReBooked fee (10%):</span>
                <span className="font-medium text-red-600">-R20.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">
                  Shipping cost (buyer pays):
                </span>
                <span className="font-medium text-green-600">R0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-semibold text-lg">
                <span className="text-blue-800">You receive:</span>
                <span className="text-green-600">R180.00</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  Payment Timeline
                </h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>
                    •{" "}
                    <strong>
                      Payment released ONLY after successful delivery to buyer
                    </strong>
                  </li>
                  <li>
                    • Funds arrive within 1-3 business days after delivery
                  </li>
                  <li>• Direct deposit to your verified bank account</li>
                  <li>• Email confirmation when payment is sent</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Payment Protection
                </h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Money is held securely until successful delivery</li>
                  <li>
                    •{" "}
                    <strong>
                      NO payment until book is confirmed DELIVERED to buyer
                    </strong>
                  </li>
                  <li>• Dispute resolution if issues arise</li>
                  <li>• Your banking details are encrypted</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">
              💡 Pro Tip: Maximize Your Earnings
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Price competitively - check similar books first</li>
              <li>• Take clear, well-lit photos of your books</li>
              <li>• Be honest about condition to avoid returns</li>
              <li>• Respond quickly to buyer messages</li>
              <li>• Keep books in good condition until pickup</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Start!",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              You're Ready to Start Selling!
            </h3>
            <p className="text-gray-600">
              Everything is set up. Time to list your first textbook.
            </p>
          </div>

          {validationResult?.canSell ? (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-medium text-green-800 mb-2">
                🎉 Account fully verified!
              </h4>
              <p className="text-sm text-green-700 mb-4">
                Your pickup address and banking details are all set up. You can
                start listing textbooks immediately.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => {
                    onClose();
                    navigate("/create-listing");
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  List Your First Book
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="font-medium text-yellow-800 mb-2">
                Almost there!
              </h4>
              <p className="text-sm text-yellow-700 mb-4">
                Complete the missing requirements to start selling your
                textbooks.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => {
                    onClose();
                    navigate("/profile");
                  }}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">📚 Listing Best Practices</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Take photos in good lighting</li>
                  <li>• Include the ISBN number</li>
                  <li>• Describe any highlighting or notes</li>
                  <li>• Set a competitive price</li>
                  <li>• Write a clear, honest description</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">🚀 After Listing</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Keep books in a safe place</li>
                  <li>• Check for new orders daily</li>
                  <li>• Respond to the 48-hour commitment</li>
                  <li>• Package books securely for pickup</li>
                  <li>• Track your earnings in your profile</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Checking Seller Status</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Checking your seller status...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, {
              className: "w-5 h-5",
            })}
            {steps[currentStep].title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[500px]">{steps[currentStep].content}</div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Close Guide
                  </Button>
                  {validationResult?.canSell && (
                    <Button
                      onClick={() => {
                        onClose();
                        navigate("/create-listing");
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start Selling
                      <BookOpen className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBecomeSellerGuide;
