import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BecomeSellerGuideProps {
  isOpen: boolean;
  onClose: () => void;
  userHasAddress?: boolean;
  userHasBanking?: boolean;
}

const BecomeSellerGuide: React.FC<BecomeSellerGuideProps> = ({
  isOpen,
  onClose,
  userHasAddress = false,
  userHasBanking = false,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Selling",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Start earning from your textbooks!
          </h3>
          <p className="text-gray-600">
            Turn your used textbooks into cash by selling them to other
            students. Here's everything you need to know to get started.
          </p>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">
              Why sell with ReBooked?
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Keep 90% of your sale price</li>
              <li>• Secure payment processing</li>
              <li>• No upfront fees or listing costs</li>
              <li>• We handle payment collection and disputes</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Setup Requirements",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Before you can sell, you need:
          </h3>

          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                userHasAddress
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <MapPin
                className={`w-5 h-5 ${userHasAddress ? "text-green-600" : "text-yellow-600"}`}
              />
              <div className="flex-1">
                <p className="font-medium">Pickup Address</p>
                <p className="text-sm text-gray-600">
                  Where couriers will collect your books from
                </p>
              </div>
              {userHasAddress ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/profile?tab=address")}
                >
                  Setup
                </Button>
              )}
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                userHasBanking
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <CreditCard
                className={`w-5 h-5 ${userHasBanking ? "text-green-600" : "text-yellow-600"}`}
              />
              <div className="flex-1">
                <p className="font-medium">Banking Details</p>
                <p className="text-sm text-gray-600">
                  Where we'll send your payments
                </p>
              </div>
              {userHasBanking ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/profile?tab=banking")}
                >
                  Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "48-Hour Commitment Rule",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Important: 48-Hour Commitment
          </h3>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">
                  Critical Timeline
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  When a buyer purchases your book, you have exactly 48 hours to
                  confirm the sale and prepare the book for courier collection.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Buyer pays for your book</p>
                <p className="text-sm text-gray-600">
                  Payment is held securely by ReBooked
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">You have 48 hours to commit</p>
                <p className="text-sm text-gray-600">
                  Confirm the sale and prepare book for pickup
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Courier collects your book</p>
                <p className="text-sm text-gray-600">
                  You receive payment after successful collection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ⚠
              </div>
              <div>
                <p className="font-medium text-red-700">
                  If you miss the 48-hour deadline
                </p>
                <p className="text-sm text-red-600">
                  Buyer gets automatic refund, you forfeit the sale
                </p>
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How payments work</h3>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">
              Payment Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">
                  Your book price (example):
                </span>
                <span className="font-medium">R200.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">ReBooked fee (10%):</span>
                <span className="font-medium">-R20.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span className="text-blue-800">You receive:</span>
                <span className="text-green-600">R180.00</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Payment Timeline:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-600" />
                <span>Payment released after courier collects your book</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span>Funds typically arrive within 1-3 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span>Direct deposit to your verified bank account</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Start?",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            You're all set to start selling!
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Quick Tips</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Take clear photos of your books</li>
                  <li>• Be honest about condition</li>
                  <li>• Price competitively</li>
                  <li>• Respond to buyers quickly</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Best Practices</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Check for any highlighting/notes</li>
                  <li>• Include ISBN for easy finding</li>
                  <li>• Package books securely</li>
                  <li>• Keep books in safe place</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <h4 className="font-medium text-green-800 mb-2">
              Ready to list your first book?
            </h4>
            <p className="text-sm text-green-700 mb-3">
              Complete the setup requirements above, then start earning from
              your textbooks!
            </p>
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

  const canStartSelling = userHasAddress && userHasBanking;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
          <div className="min-h-[400px]">{steps[currentStep].content}</div>

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
                  {canStartSelling ? (
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
                  ) : (
                    <Button
                      onClick={() => navigate("/profile")}
                      variant="outline"
                    >
                      Complete Setup
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

export default BecomeSellerGuide;
