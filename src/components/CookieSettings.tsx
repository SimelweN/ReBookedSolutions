import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Cookie,
  Shield,
  BarChart3,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  CookieManager,
  CookieConsent as CookieConsentType,
} from "@/utils/cookieManager";
import { toast } from "sonner";

const CookieSettings: React.FC = () => {
  const [consent, setConsent] = useState<CookieConsentType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load current consent settings
    const currentConsent = CookieManager.getConsent();
    if (currentConsent) {
      setConsent(currentConsent);
    } else {
      // Default settings if no consent exists
      setConsent({
        required: true,
        functional: false,
        analytics: false,
        timestamp: Date.now(),
      });
    }
  }, []);

  const handleConsentChange = (
    category: "functional" | "analytics",
    value: boolean,
  ) => {
    if (!consent) return;

    const newConsent = { ...consent, [category]: value };
    setConsent(newConsent);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!consent) return;

    setIsLoading(true);
    try {
      // Get current consent to compare
      const currentConsent = CookieManager.getConsent();

      // Save new consent
      CookieManager.setConsent({
        required: consent.required,
        functional: consent.functional,
        analytics: consent.analytics,
      });

      // Handle consent changes
      if (currentConsent) {
        // If analytics was disabled, clear analytics cookies
        if (currentConsent.analytics && !consent.analytics) {
          CookieManager.clearCookiesByCategory("analytics");
          toast.info("Analytics cookies have been cleared");
        }

        // If functional was disabled, clear functional cookies
        if (currentConsent.functional && !consent.functional) {
          CookieManager.clearCookiesByCategory("functional");
          toast.info("Functional cookies have been cleared");
        }
      }

      // Initialize analytics if enabled
      if (consent.analytics) {
        CookieManager.initializeAnalytics();
      }

      setHasChanges(false);
      toast.success("Cookie preferences saved successfully");
    } catch (error) {
      console.error("Failed to save cookie preferences:", error);
      toast.error("Failed to save cookie preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const currentConsent = CookieManager.getConsent();
    if (currentConsent) {
      setConsent(currentConsent);
      setHasChanges(false);
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear all optional cookies? This action cannot be undone.",
      )
    ) {
      CookieManager.clearCookiesByCategory("functional");
      CookieManager.clearCookiesByCategory("analytics");

      const minimalConsent = {
        required: true,
        functional: false,
        analytics: false,
        timestamp: Date.now(),
      };

      CookieManager.setConsent({
        required: minimalConsent.required,
        functional: minimalConsent.functional,
        analytics: minimalConsent.analytics,
      });

      setConsent(minimalConsent);
      setHasChanges(false);
      toast.success("All optional cookies cleared");
    }
  };

  if (!consent) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-book-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading cookie settings...</p>
        </CardContent>
      </Card>
    );
  }

  const consentDate = new Date(consent.timestamp).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Cookie className="w-6 h-6 text-book-600" />
          Cookie Settings
        </h1>
        <p className="text-gray-600">
          Manage your cookie preferences and data privacy settings. Changes take
          effect immediately.
        </p>
      </div>

      {/* Current status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Last updated: {consentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Required cookies: Active</span>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges ? (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm">
                {hasChanges ? "Unsaved changes" : "Settings saved"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookie categories */}
      <div className="space-y-4">
        {/* Required Cookies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Required Cookies
                  <Badge variant="secondary" className="text-xs">
                    Always Active
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Essential for the website to function properly. These cannot
                  be disabled.
                </CardDescription>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>Authentication:</strong> session_token, csrf_token
              </div>
              <div>
                <strong>Preferences:</strong> cookie_consent, locale
              </div>
              <div>
                <strong>Payment:</strong> subaccount_code
              </div>
              <div>
                <strong>Security:</strong> HTTPS, SameSite protection
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Functional Cookies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Functional Cookies
                </CardTitle>
                <CardDescription className="mt-1">
                  Enhance your experience with features like persistent login
                  and saved cart items.
                </CardDescription>
              </div>
              <Switch
                checked={consent.functional}
                onCheckedChange={(checked) =>
                  handleConsentChange("functional", checked)
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>Remember me:</strong> Extended login sessions (30 days)
              </div>
              <div>
                <strong>Shopping cart:</strong> Temporary storage of cart items
              </div>
              <div>
                <strong>Navigation:</strong> Last visited page for better UX
              </div>
              <div>
                <strong>Duration:</strong> 1-30 days depending on feature
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cookies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Analytics & Marketing
                </CardTitle>
                <CardDescription className="mt-1">
                  Help us improve the website and show you relevant content
                  through usage analytics.
                </CardDescription>
              </div>
              <Switch
                checked={consent.analytics}
                onCheckedChange={(checked) =>
                  handleConsentChange("analytics", checked)
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>Google Analytics:</strong> Page views, user behavior
              </div>
              <div>
                <strong>Performance:</strong> Site speed and error tracking
              </div>
              <div>
                <strong>Marketing:</strong> Facebook Pixel for ad optimization
              </div>
              <div>
                <strong>Duration:</strong> 2 years (Google), 7 days (Facebook)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="bg-book-600 hover:bg-book-700"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>

          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>

        <Button
          variant="destructive"
          onClick={handleClearAll}
          className="sm:w-auto"
        >
          Clear All Optional Cookies
        </Button>
      </div>

      {/* Privacy notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Privacy Notice:</strong> We are committed to protecting
              your privacy and complying with POPIA and GDPR regulations. Your
              data is never sold to third parties, and you can request data
              deletion at any time by contacting support.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieSettings;
