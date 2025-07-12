import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  CreditCard,
  Building2,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { PaystackSubaccountService } from "@/services/paystackSubaccountService";
import { UserAutofillService } from "@/services/userAutofillService";

interface BankInfo {
  name: string;
  branchCode: string;
}

const SOUTH_AFRICAN_BANKS: BankInfo[] = [
  { name: "Absa Bank", branchCode: "632005" },
  { name: "Capitec Bank", branchCode: "470010" },
  { name: "First National Bank (FNB)", branchCode: "250655" },
  { name: "Nedbank", branchCode: "198765" },
  { name: "Standard Bank", branchCode: "051001" },
  { name: "TymeBank", branchCode: "678910" },
  { name: "African Bank", branchCode: "430000" },
  { name: "Bidvest Bank", branchCode: "679000" },
  { name: "Discovery Bank", branchCode: "679000" },
  { name: "Investec Bank", branchCode: "580105" },
  { name: "Mercantile Bank", branchCode: "450905" },
  { name: "Sasfin Bank", branchCode: "683000" },
];

interface BankingDetailsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showAsModal?: boolean;
  editMode?: boolean;
}

const BankingDetailsForm: React.FC<BankingDetailsFormProps> = ({
  onSuccess,
  onCancel,
  showAsModal = false,
  editMode = false,
}) => {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    bankName: "",
    accountNumber: "",
  });

  const [branchCode, setBranchCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(editMode);
  const [existingData, setExistingData] = useState<any>(null);
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [manualEntries, setManualEntries] = useState({
    name: false,
    email: false,
  });

  // Load existing data if in edit mode
  useEffect(() => {
    const loadExistingData = async () => {
      if (!editMode) return;

      try {
        setIsLoading(true);
        const status =
          await PaystackSubaccountService.getUserSubaccountStatus();

        if (status.hasSubaccount) {
          setExistingData(status);
          setFormData({
            businessName: status.businessName || "",
            email: status.email || "",
            bankName: status.bankName || "",
            accountNumber: status.accountNumber || "",
          });

          // Set branch code for the existing bank
          const selectedBank = SOUTH_AFRICAN_BANKS.find(
            (bank) => bank.name === status.bankName,
          );
          setBranchCode(selectedBank?.branchCode || "");
        }
      } catch (error) {
        toast.error("Failed to load existing banking details");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
    if (!editMode) {
      autofillUserInfo();
    }
  }, [editMode]);

  const autofillUserInfo = async () => {
    if (hasAutofilled || editMode) return;

    try {
      const userInfo = await UserAutofillService.getUserInfo();
      if (userInfo) {
        setFormData((prev) => ({
          ...prev,
          businessName: prev.businessName || userInfo.name,
          email: prev.email || userInfo.email,
        }));
        setHasAutofilled(true);
      }
    } catch (error) {
      // Silently fail autofill attempts
    }
  };

  // Prevent editing - redirect to contact support
  if (editMode) {
    return (
      <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Need to Edit Your Banking Details?
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Contact our support team and we'll help you update your information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              For security reasons, banking details must be updated through our
              support team. Please contact us at:{" "}
              <span className="font-semibold">
                contact@rebookedsolutions.co.za
              </span>
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              What to include in your email:
            </p>
            <ul className="text-xs text-gray-500 space-y-1 ml-4">
              <li>• Your account email address</li>
              <li>• What you need to change (bank, account number, etc.)</li>
              <li>• Reason for the change</li>
            </ul>
          </div>
          <div className="pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full h-11"
              >
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleBankChange = (bankName: string) => {
    const selectedBank = SOUTH_AFRICAN_BANKS.find(
      (bank) => bank.name === bankName,
    );
    setFormData((prev) => ({ ...prev, bankName }));
    setBranchCode(selectedBank?.branchCode || "");
  };

  const handleAccountNumberChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, accountNumber: digitsOnly }));
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      toast.error("Business name is required");
      return false;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!formData.bankName) {
      toast.error("Please select a bank");
      return false;
    }

    if (formData.accountNumber.length < 8) {
      toast.error("Account number must be at least 8 digits");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const subaccountDetails = {
        business_name: formData.businessName,
        email: formData.email,
        bank_name: formData.bankName,
        bank_code: branchCode,
        account_number: formData.accountNumber,
      };

      const result = await PaystackSubaccountService.createOrUpdateSubaccount(
        subaccountDetails,
        editMode,
      );

      if (result.success) {
        setIsSuccess(true);
        toast.success(
          `Banking details ${editMode ? "updated" : "added"} successfully!`,
        );

        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        throw new Error(
          result.error ||
            `Failed to ${editMode ? "update" : "create"} subaccount`,
        );
      }
    } catch (error) {
      let errorMessage = "There was an error. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes("non-2xx")) {
          errorMessage =
            "Payment service is temporarily unavailable. Please try again in a few minutes.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Banking Details...
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we load your existing information.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-book-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Banking Details {editMode ? "Updated" : "Submitted"}!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your payment account has been {editMode ? "updated" : "created"}{" "}
            successfully.
            {!editMode && " You can now start listing and selling books."}
          </p>
          <Button
            onClick={onSuccess}
            className="w-full bg-book-600 hover:bg-book-700 text-white"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 bg-book-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          {editMode ? (
            <Edit3 className="w-6 h-6 text-white" />
          ) : (
            <Building2 className="w-6 h-6 text-white" />
          )}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {editMode ? "Edit Banking Details" : "Add Banking Details"}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {editMode
            ? "Update your secure Paystack subaccount information"
            : "Create your secure Paystack subaccount for faster payments"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Security Notice */}
        <div className="bg-book-100 border border-book-200 rounded-lg p-3 mb-4 flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-book-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-book-600">
              Secure & Encrypted
            </p>
            <p className="text-xs text-book-700">
              Your banking information is protected with bank-level security.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label
              htmlFor="businessName"
              className="text-sm font-medium text-gray-700"
            >
              Business Name *{" "}
              {!manualEntries.name && hasAutofilled && !editMode && (
                <span className="text-xs text-blue-600">(from account)</span>
              )}
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="businessName"
                type="text"
                placeholder="Enter your registered business name"
                value={formData.businessName}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }));
                  if (!manualEntries.name) {
                    setManualEntries((prev) => ({ ...prev, name: true }));
                  }
                }}
                className="pl-10 h-11 rounded-lg border-2 focus:border-book-600 focus:ring-book-600"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address *{" "}
              {!manualEntries.email && hasAutofilled && !editMode && (
                <span className="text-xs text-blue-600">(from account)</span>
              )}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  if (!manualEntries.email) {
                    setManualEntries((prev) => ({ ...prev, email: true }));
                  }
                }}
                className="pl-10 h-11 rounded-lg border-2 focus:border-book-600 focus:ring-book-600"
                required
              />
            </div>
          </div>

          {/* Bank Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Select Your Bank *
            </Label>
            <Select onValueChange={handleBankChange} value={formData.bankName}>
              <SelectTrigger className="h-11 rounded-lg border-2 focus:border-book-600">
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {SOUTH_AFRICAN_BANKS.map((bank) => (
                  <SelectItem key={bank.name} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Code (Auto-filled) */}
          {branchCode && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Branch Code (Auto-filled)
              </Label>
              <Input
                value={branchCode}
                readOnly
                className="h-11 rounded-lg border-2 bg-gray-50 text-gray-600"
              />
            </div>
          )}

          {/* Account Number */}
          <div className="space-y-2">
            <Label
              htmlFor="accountNumber"
              className="text-sm font-medium text-gray-700"
            >
              Account Number *
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="accountNumber"
                type="text"
                placeholder="Enter your account number"
                value={formData.accountNumber}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                className="pl-10 h-11 rounded-lg border-2 focus:border-book-600 focus:ring-book-600"
                maxLength={15}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-book-600 hover:bg-book-700 transition-all duration-200 rounded-lg font-medium text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editMode ? "Updating Account..." : "Creating Account..."}
                </>
              ) : editMode ? (
                "Update Payment Account"
              ) : (
                "Create Payment Account"
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full h-11"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="text-center pt-4 text-xs text-gray-500 border-t">
          <p>Powered by Paystack's secure infrastructure</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankingDetailsForm;
