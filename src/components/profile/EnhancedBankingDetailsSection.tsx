import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ImprovedBankingService } from "@/services/improvedBankingService";
import { BankingDetails, SOUTH_AFRICAN_BANKS } from "@/types/banking";
import { toast } from "sonner";
import {
  Shield,
  CreditCard,
  CheckCircle,
  Building,
  Save,
  Edit,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const EnhancedBankingDetailsSection: React.FC = () => {
  const { user } = useAuth();
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [formData, setFormData] = useState({
    recipient_type: "",
    full_name: "",
    bank_account_number: "",
    bank_name: "",
    branch_code: "",
    account_type: "savings",
  });

  useEffect(() => {
    loadBankingDetails();
  }, [user]);

  const loadBankingDetails = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const details = await ImprovedBankingService.getBankingDetails(user.id);
      if (details) {
        setBankingDetails(details);
        setFormData({
          recipient_type: details.recipient_type,
          full_name: details.full_name,
          bank_account_number: details.bank_account_number,
          bank_name: details.bank_name,
          branch_code: details.branch_code || "",
          account_type: details.account_type,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error loading banking details: ${errorMessage}`);

      // Show user-friendly error message
      if (
        errorMessage.includes("relation") &&
        errorMessage.includes("does not exist")
      ) {
        toast.error(
          "Banking details feature is not available yet. Please contact support.",
        );
      } else {
        toast.error("Failed to load banking details. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankSelect = (bankName: string) => {
    const selectedBank = SOUTH_AFRICAN_BANKS.find(
      (bank) => bank.name === bankName,
    );
    if (selectedBank) {
      setFormData((prev) => ({
        ...prev,
        bank_name: bankName,
        branch_code: selectedBank.branchCode,
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "recipient_type",
      "full_name",
      "bank_account_number",
      "bank_name",
      "account_type",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData],
    );
    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    try {
      setIsLoading(true);
      const detailsToSave = {
        user_id: user.id,
        recipient_type: formData.recipient_type as "individual" | "business",
        full_name: formData.full_name,
        bank_account_number: formData.bank_account_number,
        bank_name: formData.bank_name,
        branch_code: formData.branch_code,
        account_type: formData.account_type as "savings" | "current",
      };

      const savedDetails = await ImprovedBankingService.saveBankingDetails(
        detailsToSave,
        user.email || "",
      );

      setBankingDetails(savedDetails);
      setIsEditing(false);
      toast.success("Banking details saved successfully!", {
        description:
          "Your payment account is being set up for future transactions.",
      });
    } catch (error) {
      console.error("Error saving banking details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save banking details";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Mask account number for security
  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  if (isLoading && !bankingDetails) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600"></div>
            <span className="ml-2">Loading banking details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Banking Details
          {bankingDetails?.account_verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your banking information is securely stored and encrypted. This is
            required to receive payments from book sales.
          </AlertDescription>
        </Alert>

        {!bankingDetails && !isEditing && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Banking Details
            </h3>
            <p className="text-gray-600 mb-4">
              Add your banking details to receive payments from book sales.
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-book-600 hover:bg-book-700"
            >
              <Building className="h-4 w-4 mr-2" />
              Add Banking Details
            </Button>
          </div>
        )}

        {bankingDetails && !isEditing && (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Banking Details Secured</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your sensitive information is encrypted and protected
              </p>
            </div>

            <div>
              <Label>Account Holder</Label>
              <p className="text-sm text-gray-600">
                {bankingDetails.full_name}
              </p>
            </div>
            <div>
              <Label>Bank</Label>
              <p className="text-sm text-gray-600">
                {bankingDetails.bank_name}
              </p>
            </div>
            <div>
              <Label>Account Number</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  {showFullAccount
                    ? bankingDetails.bank_account_number
                    : maskAccountNumber(bankingDetails.bank_account_number)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullAccount(!showFullAccount)}
                  className="h-6 w-6 p-0"
                >
                  {showFullAccount ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label>Account Type</Label>
              <p className="text-sm text-gray-600 capitalize">
                {bankingDetails.account_type}
              </p>
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    bankingDetails.account_verified ? "secondary" : "outline"
                  }
                >
                  {bankingDetails.account_verified
                    ? "Verified"
                    : bankingDetails.subaccount_status === "pending_setup"
                      ? "Pending Setup"
                      : "Pending Verification"}
                </Badge>
                {bankingDetails.subaccount_status === "pending_setup" && (
                  <span className="text-xs text-blue-600">
                    Payment integration will complete automatically
                  </span>
                )}
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient_type">Account Type</Label>
              <Select
                value={formData.recipient_type}
                onValueChange={(value) =>
                  handleInputChange("recipient_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="full_name">Full Name / Business Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter account holder name"
              />
            </div>

            <div>
              <Label htmlFor="bank_name">Bank</Label>
              <Select
                value={formData.bank_name}
                onValueChange={handleBankSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {SOUTH_AFRICAN_BANKS.map((bank) => (
                    <SelectItem key={bank.name} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.bank_account_number}
                onChange={(e) =>
                  handleInputChange("bank_account_number", e.target.value)
                }
                placeholder="Enter account number"
              />
            </div>

            <div>
              <Label htmlFor="account_type">Account Type</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) =>
                  handleInputChange("account_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your banking details will be encrypted and securely stored.
                Future enhancements will add password-based encryption for
                additional security.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-book-600 hover:bg-book-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Details"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedBankingDetailsSection;
