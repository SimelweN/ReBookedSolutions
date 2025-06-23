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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BankingDetailsService } from "@/services/bankingDetailsService";
import { BankingDetails, SOUTH_AFRICAN_BANKS, BankInfo } from "@/types/banking";
import { toast } from "sonner";
import {
  Shield,
  Eye,
  EyeOff,
  CreditCard,
  Lock,
  AlertTriangle,
  Save,
  Edit,
  Trash2,
  CheckCircle,
  Building,
} from "lucide-react";

const BankingDetailsSection: React.FC = () => {
  const { user } = useAuth();
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVerifying, setIsPasswordVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState<Partial<BankingDetails>>({
    recipient_type: "",
    full_name: "",
    bank_account_number: "",
    bank_name: "",
    branch_code: "",
    account_type: "savings",
  });

  // Check if user is recently verified on component mount
  useEffect(() => {
    if (BankingDetailsService.isRecentlyVerified()) {
      setIsVerified(true);
      loadBankingDetails();
    }
  }, []);

  const loadBankingDetails = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const details = await BankingDetailsService.getBankingDetails(user.id);
      setBankingDetails(details);
      if (details) {
        setFormData(details);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error loading banking details:", errorMessage);

      // Don't show error toast for missing table or database setup issues
      if (
        !errorMessage.includes("relation") &&
        !errorMessage.includes("not available yet") &&
        !errorMessage.includes("Migration may need")
      ) {
        toast.error("Failed to load banking details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordVerification = async () => {
    if (!user?.email || !password.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    setIsPasswordVerifying(true);
    setPasswordError("");

    try {
      const isValid = await BankingDetailsService.verifyPassword(
        user.email,
        password,
      );

      if (isValid) {
        setIsVerified(true);
        setShowPasswordDialog(false);
        setPassword("");
        toast.success("Access granted to banking details");
        await loadBankingDetails();
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (error) {
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setIsPasswordVerifying(false);
    }
  };

  const handleBankSelection = (bankName: string) => {
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

  const handleInputChange = (field: keyof BankingDetails, value: string) => {
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
      (field) => !formData[field as keyof BankingDetails],
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    // Validate account number (should be numeric)
    if (
      formData.bank_account_number &&
      !/^\d+$/.test(formData.bank_account_number)
    ) {
      toast.error("Bank account number should contain only numbers");
      return;
    }

    try {
      setIsLoading(true);
      const detailsToSave = {
        user_id: user.id,
        recipient_type: formData.recipient_type!,
        full_name: formData.full_name!,
        bank_account_number: formData.bank_account_number!,
        bank_name: formData.bank_name!,
        branch_code: formData.branch_code!,
        account_type: formData.account_type! as "savings" | "current",
      };

      const savedDetails =
        await BankingDetailsService.saveBankingDetails(detailsToSave);
      setBankingDetails(savedDetails);
      setIsEditing(false);
      toast.success("Banking details saved securely");
    } catch (error) {
      console.error("Error saving banking details:", error);
      // Error toast is handled in the service
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (bankingDetails) {
      setFormData(bankingDetails);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (bankingDetails) {
      setFormData(bankingDetails);
    } else {
      setFormData({
        recipient_type: "",
        full_name: "",
        bank_account_number: "",
        bank_name: "",
        branch_code: "",
        account_type: "savings",
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your banking details? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await BankingDetailsService.deleteBankingDetails(user.id);
      setBankingDetails(null);
      setFormData({
        recipient_type: "",
        full_name: "",
        bank_account_number: "",
        bank_name: "",
        branch_code: "",
        account_type: "savings",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting banking details:", error);
      // Error toast is handled in the service
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockAccess = () => {
    BankingDetailsService.clearVerification();
    setIsVerified(false);
    setBankingDetails(null);
    setIsEditing(false);
    toast.info("Banking details access locked");
  };

  // Show password verification dialog if not verified
  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-orange-600" />
            Banking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <div className="font-medium">🔒 Secure Access Required</div>
                <p className="text-sm">
                  Your banking details are protected with additional security.
                  Please verify your password to access this section.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-center py-8">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Secure Banking Information
            </h3>
            <p className="text-gray-600 mb-6">
              Add your banking details to receive payments securely. All
              information is encrypted and password-protected.
            </p>
            <Button
              onClick={() => setShowPasswordDialog(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access Banking Details
            </Button>
          </div>

          <Dialog
            open={showPasswordDialog}
            onOpenChange={setShowPasswordDialog}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-orange-600" />
                  Verify Your Password
                </DialogTitle>
                <DialogDescription>
                  Please enter your account password to access your banking
                  details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="verify-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pr-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handlePasswordVerification();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordVerification}
                  disabled={isPasswordVerifying || !password.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isPasswordVerifying ? "Verifying..." : "Verify"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-green-600" />
            Banking Details
            {bankingDetails && (
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLockAccess}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock Access
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading banking details...</p>
          </div>
        ) : (
          <>
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-1">
                  <div className="font-medium">🔒 Secure & Encrypted</div>
                  <p className="text-sm">
                    Your banking information is encrypted and secured. Only you
                    can access this data with your password.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="recipient-type">Recipient Type *</Label>
                {isEditing ? (
                  <Input
                    id="recipient-type"
                    value={formData.recipient_type || ""}
                    onChange={(e) =>
                      handleInputChange("recipient_type", e.target.value)
                    }
                    placeholder="e.g., Individual, Business"
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {bankingDetails?.recipient_type || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name *</Label>
                {isEditing ? (
                  <Input
                    id="full-name"
                    value={formData.full_name || ""}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    placeholder="Account holder's full name"
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {bankingDetails?.full_name || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">Bank Account Number *</Label>
                {isEditing ? (
                  <Input
                    id="account-number"
                    type="number"
                    value={formData.bank_account_number || ""}
                    onChange={(e) =>
                      handleInputChange("bank_account_number", e.target.value)
                    }
                    placeholder="Account number (numbers only)"
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded font-mono">
                    {bankingDetails?.bank_account_number
                      ? `****${bankingDetails.bank_account_number.slice(-4)}`
                      : "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name *</Label>
                {isEditing ? (
                  <Select
                    value={formData.bank_name || ""}
                    onValueChange={handleBankSelection}
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
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {bankingDetails?.bank_name || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch-code">Branch Code</Label>
                <Input
                  id="branch-code"
                  value={formData.branch_code || ""}
                  readOnly
                  className="bg-gray-100"
                  placeholder="Auto-populated based on bank"
                />
                <p className="text-xs text-gray-500">
                  Automatically filled when you select your bank
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type *</Label>
                {isEditing ? (
                  <Select
                    value={formData.account_type || "savings"}
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
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded capitalize">
                    {bankingDetails?.account_type || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Banking Details"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    {bankingDetails ? "Edit Details" : "Add Banking Details"}
                  </Button>
                  {bankingDetails && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Details
                    </Button>
                  )}
                </>
              )}
            </div>

            {bankingDetails && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  ℹ️ Important Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Banking details are used for secure payment processing
                  </li>
                  <li>• All information is encrypted and stored securely</li>
                  <li>
                    • Only you can access this information with your password
                  </li>
                  <li>• You can update or delete these details at any time</li>
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BankingDetailsSection;
