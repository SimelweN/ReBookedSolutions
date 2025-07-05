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

      {/* Detailed cookie information dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Information
            </DialogTitle>
            <DialogDescription>
              Detailed information about all cookies used on this website and
              their purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {cookieCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <h3 className="font-semibold">{category.title}</h3>
                  {category.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>

                <div className="space-y-2">
                  {category.cookies.map((cookie, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-sm">{cookie.name}</div>
                      <div className="text-xs text-gray-600">
                        {cookie.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security & Privacy
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  • All cookies are secured with industry-standard encryption
                </p>
                <p>• We use HttpOnly and Secure flags where appropriate</p>
                <p>• SameSite protection prevents cross-site attacks</p>
                <p>• You can change your preferences anytime in settings</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
