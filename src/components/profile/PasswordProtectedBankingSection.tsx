import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import EnhancedBankingDetailsSection from "./EnhancedBankingDetailsSection";

const PasswordProtectedBankingSection: React.FC = () => {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const verifyPassword = async () => {
    if (!user?.email || !password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    if (attempts >= 3) {
      setIsLocked(true);
      toast.error("Too many failed attempts. Please try again later.");
      return;
    }

    setIsVerifying(true);

    try {
      // Attempt to sign in with the provided password to verify it
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        setAttempts((prev) => prev + 1);
        if (attempts >= 2) {
          setIsLocked(true);
          toast.error("Too many failed attempts. Access temporarily locked.");
        } else {
          toast.error(
            `Incorrect password. ${2 - attempts} attempts remaining.`,
          );
        }
        setPassword("");
        return;
      }

      // Password is correct
      setIsUnlocked(true);
      setPassword("");
      setAttempts(0);
      toast.success("Banking details unlocked");
    } catch (error) {
      console.error("Password verification error:", error);
      toast.error("Failed to verify password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      verifyPassword();
    }
  };

  const resetAccess = () => {
    setIsUnlocked(false);
    setPassword("");
    setAttempts(0);
    setIsLocked(false);
  };

  // Show unlocked banking section
  if (isUnlocked) {
    return (
      <div className="space-y-4">
        {/* Security Status Bar */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">Banking details unlocked</span>
              <Button
                onClick={resetAccess}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Lock className="w-3 h-3 mr-1" />
                Lock
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Banking Details Component */}
        <EnhancedBankingDetailsSection />
      </div>
    );
  }

  // Show password protection screen
  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Secure Banking Details</CardTitle>
        <p className="text-gray-600 text-sm">
          Enter your account password to access banking information
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <div className="font-medium">🔒 Enhanced Security</div>
              <div className="text-sm">
                Banking details are protected with your login password for added
                security. This helps keep your financial information safe.
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Password Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Account Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your login password"
                disabled={isVerifying || isLocked}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying || isLocked}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
            {attempts > 0 && !isLocked && (
              <p className="text-sm text-orange-600">
                ⚠️ {3 - attempts} attempts remaining
              </p>
            )}
          </div>

          {isLocked && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <div className="font-medium">Access Temporarily Locked</div>
                  <div className="text-sm">
                    Too many failed password attempts. Please wait a few minutes
                    before trying again, or refresh the page to reset.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={verifyPassword}
            disabled={isVerifying || isLocked || !password.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Unlock Banking Details
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Use the same password you use to log into your account</p>
          {isLocked && (
            <Button
              variant="link"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-blue-600 p-0 h-auto"
            >
              Refresh page to reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordProtectedBankingSection;
