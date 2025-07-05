import React, { useState } from "react";
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
  User,
  Hash,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// South African bank codes (major banks)
const SOUTH_AFRICAN_BANKS = [
  { code: "632005", name: "ABSA Bank" },
  { code: "250655", name: "FNB (First National Bank)" },
  { code: "051001", name: "Standard Bank" },
  { code: "470010", name: "Nedbank" },
  { code: "580105", name: "Investec Bank" },
  { code: "678910", name: "Capitec Bank" },
  { code: "462005", name: "Discovery Bank" },
  { code: "430000", name: "Bidvest Bank" },
  { code: "220026", name: "Sasfin Bank" },
  { code: "588757", name: "African Bank" },
];

interface BankingDetailsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showAsModal?: boolean;
}

const BankingDetailsForm: React.FC<BankingDetailsFormProps> = ({
  onSuccess,
  onCancel,
  showAsModal = false,
}) => {
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    bank_name: "",
    bank_code: "",
    account_number: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.bank_code) {
      newErrors.bank_code = "Please select a bank";
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = "Account number is required";
    } else if (!/^\d{8,11}$/.test(formData.account_number.replace(/\s/g, ""))) {
      newErrors.account_number = "Account number must be 8-11 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get current session for authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please log in to add banking details");
      }

      // Call the Supabase function
      const { data, error } = await supabase.functions.invoke(
        "create-paystack-subaccount",
        {
          body: {
            business_name: formData.business_name.trim(),
            email: formData.email.trim(),
            bank_name: formData.bank_name,
            bank_code: formData.bank_code,
            account_number: formData.account_number.replace(/\s/g, ""), // Remove spaces
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to create banking details");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to create banking details");
      }

      console.log("Banking details created successfully:", data);

      setIsSuccess(true);
      toast.success(
        "Banking details added successfully! You can now start selling.",
      );

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error("Error submitting banking details:", error);

      let errorMessage = "Failed to add banking details. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (errorMessage.includes("account number")) {
        setErrors({
          account_number: "Invalid account number. Please check and try again.",
        });
      } else if (errorMessage.includes("bank")) {
        setErrors({
          bank_code: "Bank validation failed. Please try a different bank.",
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankSelect = (bankCode: string) => {
    const selectedBank = SOUTH_AFRICAN_BANKS.find(
      (bank) => bank.code === bankCode,
    );
    setFormData((prev) => ({
      ...prev,
      bank_code: bankCode,
      bank_name: selectedBank?.name || "",
    }));

    // Clear bank-related errors
    if (errors.bank_code) {
      setErrors((prev) => ({ ...prev, bank_code: "" }));
    }
  };

  const formatAccountNumber = (value: string) => {
    // Remove all non-digits and limit to 11 characters
    const digits = value.replace(/\D/g, "").slice(0, 11);
    // Add spaces every 4 digits for better readability
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formatted = formatAccountNumber(e.target.value);
    setFormData((prev) => ({ ...prev, account_number: formatted }));

    // Clear error when user starts typing
    if (errors.account_number) {
      setErrors((prev) => ({ ...prev, account_number: "" }));
    }
  };

  if (isSuccess) {
    return (
      <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Banking Details Added Successfully!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your payment account has been set up. You can now start listing and
            selling books.
          </p>
          <Button
            onClick={onSuccess}
            className="w-full bg-book-600 hover:bg-book-700"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-book-600" />
          Add Banking Details
        </CardTitle>
        <CardDescription>
          Secure banking information for receiving payments from book sales.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Business/Account Holder Name
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  business_name: e.target.value,
                }));
                if (errors.business_name)
                  setErrors((prev) => ({ ...prev, business_name: "" }));
              }}
              placeholder="Enter account holder name"
              className={errors.business_name ? "border-red-500" : ""}
            />
            {errors.business_name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.business_name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Bank Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Bank
            </Label>
            <Select value={formData.bank_code} onValueChange={handleBankSelect}>
              <SelectTrigger
                className={errors.bank_code ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {SOUTH_AFRICAN_BANKS.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bank_code && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.bank_code}
              </p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Account Number
            </Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={handleAccountNumberChange}
              placeholder="Enter account number"
              className={errors.account_number ? "border-red-500" : ""}
              maxLength={13} // 11 digits + 2 spaces
            />
            {errors.account_number && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.account_number}
              </p>
            )}
          </div>

          {/* Security Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Your banking details are encrypted and securely managed by
              Paystack. We never store your full account details.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-book-600 hover:bg-book-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Banking Details
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankingDetailsForm;
