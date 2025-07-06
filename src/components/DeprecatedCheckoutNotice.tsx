import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ArrowRight, ShoppingCart } from "lucide-react";

const DeprecatedCheckoutNotice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-900">
              Checkout System Updated
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                We've upgraded our checkout system for a better purchasing
                experience! The old checkout flow has been replaced with a new,
                streamlined process.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">What's New:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Direct book purchase flow (no cart required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>48-hour seller commitment system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Improved receipt generation and download</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Better notification system for order updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Enhanced duplicate payment prevention</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                How to Purchase Books:
              </h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Browse books in our catalog</li>
                <li>2. Click "Buy Now" on any book</li>
                <li>3. Complete the streamlined purchase flow</li>
                <li>4. Receive instant receipt and confirmation</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate("/books")} className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Books
              </Button>

              <Button
                onClick={() => navigate("/my-orders")}
                variant="outline"
                className="flex-1"
              >
                View My Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>
                If you experience any issues with the new checkout system,
                please contact support at{" "}
                <a
                  href="mailto:support@rebookedsolutions.co.za"
                  className="text-blue-600 hover:underline"
                >
                  support@rebookedsolutions.co.za
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeprecatedCheckoutNotice;
