import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  CreditCard,
  Building2,
  Users,
  ArrowRight,
  Calculator,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PaystackSubaccountService } from "@/services/paystackSubaccountService";
import BankingSystemStatus from "@/components/banking/BankingSystemStatus";
import BankingDetailsForm from "@/components/BankingDetailsForm";
import { toast } from "sonner";

const SubaccountSystemDemo: React.FC = () => {
  const { user } = useAuth();
  const [demoStep, setDemoStep] = useState<
    "status" | "setup" | "edit" | "calculate" | "test"
  >("status");
  const [isLoading, setIsLoading] = useState(false);
  const [calculations, setCalculations] = useState<any>(null);

  // Demo book data
  const demoBook = {
    id: "demo-book-123",
    title: "Advanced Mathematics Textbook",
    price: 250.0,
    sellerId: user?.id || "demo-seller",
  };

  const demoDelivery = {
    fee: 65.0,
    provider: "Courier Guy",
  };

  const handleActionRequired = (action: string) => {
    switch (action) {
      case "setup_banking":
        setDemoStep("setup");
        break;
      case "edit_banking":
        setDemoStep("edit");
        break;
      default:
        break;
    }
  };

  const handleBankingSuccess = () => {
    toast.success("Banking details updated successfully!");
    setDemoStep("status");
  };

  const handleBankingCancel = () => {
    setDemoStep("status");
  };

  const calculatePaymentSplit = async () => {
    setIsLoading(true);
    try {
      const split = PaystackSubaccountService.calculatePaymentSplit(
        demoBook.price,
        demoDelivery.fee,
        10, // 10% platform commission
      );
      setCalculations(split);
      setDemoStep("calculate");
      toast.success("Payment split calculated!");
    } catch (error) {
      toast.error("Failed to calculate payment split");
    } finally {
      setIsLoading(false);
    }
  };

  const testSubaccountValidation = async () => {
    if (!user?.id) {
      toast.error("Please log in to test subaccount validation");
      return;
    }

    setIsLoading(true);
    try {
      const validation = await PaystackSubaccountService.validateSubaccount(
        user.id,
      );

      if (validation.isValid) {
        toast.success(
          "✅ Subaccount validation passed! Ready for transactions.",
        );
      } else {
        toast.warning(`❌ Subaccount validation failed: ${validation.message}`);
      }
    } catch (error) {
      toast.error("Failed to validate subaccount");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Login Required</h3>
          <p className="text-gray-600">
            Please log in to view the subaccount system demo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-book-600" />
            <span>Subaccount & Payment Split System Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This demo shows the complete subaccount creation, linking, and
            payment split functionality.
          </p>

          {/* Demo Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={demoStep === "status" ? "default" : "outline"}
              size="sm"
              onClick={() => setDemoStep("status")}
            >
              Banking Status
            </Button>
            <Button
              variant={demoStep === "calculate" ? "default" : "outline"}
              size="sm"
              onClick={calculatePaymentSplit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Calculator className="w-4 h-4 mr-1" />
              )}
              Calculate Split
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testSubaccountValidation}
              disabled={isLoading}
            >
              Test Validation
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Content based on demo step */}
          {demoStep === "status" && (
            <BankingSystemStatus
              userId={user.id}
              onActionRequired={handleActionRequired}
            />
          )}

          {(demoStep === "setup" || demoStep === "edit") && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <ArrowRight className="w-4 h-4 text-book-600" />
                <h3 className="font-semibold">
                  {demoStep === "setup"
                    ? "Setup Banking Details"
                    : "Edit Banking Details"}
                </h3>
              </div>
              <BankingDetailsForm
                onSuccess={handleBankingSuccess}
                onCancel={handleBankingCancel}
                editMode={demoStep === "edit"}
              />
            </div>
          )}

          {demoStep === "calculate" && calculations && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="w-5 h-5 text-book-600" />
                <h3 className="font-semibold">Payment Split Calculation</h3>
              </div>

              {/* Demo Book */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{demoBook.title}</h4>
                      <p className="text-sm text-gray-600">
                        Demo book for calculation
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Book Price:</span>
                      <p className="font-semibold">
                        R{demoBook.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery Fee:</span>
                      <p className="font-semibold">
                        R{demoDelivery.fee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Split Breakdown */}
              <Card className="border-book-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Payment Split Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          Seller Receives (90%)
                        </span>
                      </div>
                      <span className="font-bold text-green-800">
                        R{calculations.sellerAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Platform Fee (10%)
                        </span>
                      </div>
                      <span className="font-bold text-blue-800">
                        R{calculations.platformAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">
                          Delivery Fee
                        </span>
                      </div>
                      <span className="font-bold text-gray-800">
                        R{calculations.deliveryAmount.toFixed(2)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center p-3 bg-book-50 rounded-lg border border-book-200">
                      <span className="font-bold text-book-800">
                        Total Amount
                      </span>
                      <span className="font-bold text-book-800 text-lg">
                        R{calculations.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-center text-sm text-gray-600 mt-4">
                      <Badge variant="outline" className="text-xs">
                        Seller Share: {calculations.sellerPercentage}% of total
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Flow Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    How Payment Splits Work
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Buyer pays the total amount (book + delivery)</li>
                    <li>
                      • Paystack automatically splits the payment using
                      subaccounts
                    </li>
                    <li>
                      • Seller receives 90% of book price in their bank account
                    </li>
                    <li>• Platform keeps 10% commission for book sales</li>
                    <li>
                      • Delivery fee goes to the courier (when applicable)
                    </li>
                    <li>• All splits happen instantly and automatically</li>
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={() => setDemoStep("status")}
                variant="outline"
                className="w-full"
              >
                Back to Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubaccountSystemDemo;
