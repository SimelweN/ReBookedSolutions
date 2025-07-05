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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Cookie,
  Shield,
  BarChart3,
  Settings,
  Check,
  X,
  Info,
  Lock,
  Eye,
  ShoppingCart,
} from "lucide-react";
import {
  CookieManager,
  CookieConsent as CookieConsentType,
} from "@/utils/cookieManager";

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsentType) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsentChange }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if we should show the consent popup
    if (CookieManager.shouldShowConsentPopup()) {
      setShowPopup(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      required: true,
      functional: true,
      analytics: true,
    };

    CookieManager.setConsent(fullConsent);
    setShowPopup(false);
    onConsentChange?.(fullConsent);

    // Initialize analytics if consent given
    CookieManager.initializeAnalytics();
  };

  const handleAcceptSelected = () => {
    const selectedConsent = {
      required: true,
      functional: consent.functional,
      analytics: consent.analytics,
    };

    CookieManager.setConsent(selectedConsent);
    setShowPopup(false);
    onConsentChange?.(selectedConsent);

    // Initialize analytics if consent given
    if (selectedConsent.analytics) {
      CookieManager.initializeAnalytics();
    }
  };

  const handleRejectOptional = () => {
    const minimalConsent = {
      required: true,
      functional: false,
      analytics: false,
    };

    CookieManager.setConsent(minimalConsent);
    setShowPopup(false);
    onConsentChange?.(minimalConsent);
  };

  const cookieCategories = [
    {
      id: "required",
      title: "Required Cookies",
      description: "Essential for the website to function properly",
      icon: <Lock className="w-4 h-4" />,
      required: true,
      cookies: [
        { name: "session_token", purpose: "Keeps you logged in securely" },
        { name: "csrf_token", purpose: "Protects against security attacks" },
        { name: "cookie_consent", purpose: "Records your cookie preferences" },
        { name: "subaccount_code", purpose: "Links to your payout account" },
        { name: "locale", purpose: "Remembers your language preference" },
      ],
    },
    {
      id: "functional",
      title: "Functional Cookies",
      description: "Enhance your experience with helpful features",
      icon: <Settings className="w-4 h-4" />,
      required: false,
      cookies: [
        {
          name: "remember_me",
          purpose: "Keeps you logged in longer (30 days)",
        },
        { name: "cart_items", purpose: "Saves items in your shopping cart" },
        {
          name: "last_page_visited",
          purpose: "Improves navigation after login",
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Marketing",
      description: "Help us improve the website and show relevant content",
      icon: <BarChart3 className="w-4 h-4" />,
      required: false,
      cookies: [
        {
          name: "_ga, _gid",
          purpose: "Google Analytics - tracks usage patterns",
        },
        { name: "_fbp", purpose: "Facebook Pixel - tracks ad effectiveness" },
      ],
    },
  ];

  if (!showPopup) return null;

  return (
    <>
      {/* Main consent popup - Clean Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-book-100 p-2 rounded-full flex-shrink-0">
                <Cookie className="w-4 h-4 text-book-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  We use cookies to improve your experience, analyze usage, and
                  assist with marketing.
                  <span className="font-medium">
                    {" "}
                    Essential cookies are always active.
                  </span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-shrink-0">
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                size="sm"
                className="text-sm border-gray-300 hover:bg-gray-50"
              >
                Settings
              </Button>
              <Button
                onClick={handleAcceptAll}
                size="sm"
                className="bg-book-600 hover:bg-book-700 text-sm px-6"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-book-600" />
              Cookie Settings
            </DialogTitle>
            <DialogDescription>
              Choose which cookies you'd like to accept. Essential cookies are
              required for the site to function.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-1.5 rounded-full">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Essential Cookies</div>
                  <div className="text-xs text-gray-600">
                    Required for site functionality
                  </div>
                </div>
              </div>
              <div className="bg-green-500 p-1 rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Functional Cookies</div>
                  <div className="text-xs text-gray-600">
                    Remember login, cart items
                  </div>
                </div>
              </div>
              <Switch
                checked={consent.functional}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({ ...prev, functional: checked }))
                }
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-1.5 rounded-full">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    Analytics & Marketing
                  </div>
                  <div className="text-xs text-gray-600">
                    Help improve our site
                  </div>
                </div>
              </div>
              <Switch
                checked={consent.analytics}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({ ...prev, analytics: checked }))
                }
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleAcceptSelected}
              className="flex-1"
            >
              Save Preferences
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-book-600 hover:bg-book-700"
            >
              Accept All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
