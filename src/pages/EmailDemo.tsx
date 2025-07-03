import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  CreditCard,
  User,
  Package,
  Truck,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailAutomation } from "@/hooks/useEmailAutomation";
import { toast } from "sonner";

const EmailDemo: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const emailTriggers = useEmailAutomation();
  const [loading, setLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState(user?.email || "");
  const [testName, setTestName] = useState("Test User");

  // Only require authentication
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600">
              Please log in to access the email testing demo.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleEmailTest = async (
    emailType: string,
    triggerFn: () => Promise<void>,
  ) => {
    setLoading(emailType);
    try {
      await triggerFn();
      toast.success(`${emailType} email sent successfully!`);
    } catch (error) {
      toast.error(`Failed to send ${emailType} email`);
      console.error(`Email test error (${emailType}):`, error);
    } finally {
      setLoading(null);
    }
  };

  const emailTests = [
    {
      id: "welcome",
      title: "Welcome Email",
      description: "Sent when user registers",
      icon: <User className="h-5 w-5" />,
      trigger: () =>
        emailTriggers.onUserRegistered({ name: testName, email: testEmail }),
    },
    {
      id: "password",
      title: "Password Reset",
      description: "Sent when user requests password reset",
      icon: <Mail className="h-5 w-5" />,
      trigger: () =>
        emailTriggers.onPasswordReset(
          { name: testName, email: testEmail },
          "https://rebookedsolutions.co.za/reset-password?token=test123",
        ),
    },
    {
      id: "verification",
      title: "Email Verification",
      description: "Sent to verify email address",
      icon: <CheckCircle className="h-5 w-5" />,
      trigger: () =>
        emailTriggers.onEmailVerification(
          { name: testName, email: testEmail },
          "https://rebookedsolutions.co.za/verify?token=test123",
        ),
    },
    {
      id: "payment",
      title: "Payment Confirmation",
      description: "Sent after successful payment",
      icon: <CreditCard className="h-5 w-5" />,
      trigger: () =>
        emailTriggers.onPaymentSuccessful({
          orderId: "demo-order-123",
          paymentReference: "demo-ref-456",
          buyerId: user?.id || "demo-buyer",
          sellerId: "demo-seller",
          bookId: "demo-book",
          totalAmount: 27500, // R275.00 in kobo
          bookPrice: 25000, // R250.00 in kobo
          deliveryFee: 2500, // R25.00 in kobo
        }),
    },
    {
      id: "courier",
      title: "Courier Pickup",
      description: "Sent when courier collects book",
      icon: <Truck className="h-5 w-5" />,
      trigger: () =>
        emailTriggers.onCourierPickup(
          "demo-order-123",
          "TRK123456789",
          "Courier Guy",
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 3 days from now
        ),
    },
    {
      id: "delivery",
      title: "Delivery Complete",
      description: "Sent when book is delivered",
      icon: <Package className="h-5 w-5" />,
      trigger: () => emailTriggers.onDeliveryComplete("demo-order-123"),
    },
    {
      id: "banking",
      title: "Bank Details Added",
      description: "Sent when seller adds banking info",
      icon: <DollarSign className="h-5 w-5" />,
      trigger: () => emailTriggers.onBankDetailsAdded(user?.id || "demo-user"),
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Automation Demo
          </h1>
          <p className="text-gray-600">
            Test automated email functionality using Sender.net API
          </p>

          {!import.meta.env.VITE_SENDER_API && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">
                  <strong>VITE_SENDER_API</strong> not configured. Add your
                  Sender.net API key to test emails.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Test Email Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="test-name">Test User Name</Label>
                <Input
                  id="test-name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {test.icon}
                  <span>{test.title}</span>
                </CardTitle>
                <p className="text-sm text-gray-600">{test.description}</p>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleEmailTest(test.title, test.trigger)}
                  disabled={loading === test.title || !testEmail}
                  className="w-full"
                >
                  {loading === test.title ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Sender.net API Key</span>
                <Badge
                  variant={
                    import.meta.env.VITE_SENDER_API ? "default" : "destructive"
                  }
                >
                  {import.meta.env.VITE_SENDER_API ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Environment</span>
                <Badge variant="secondary">
                  {import.meta.env.DEV ? "Development" : "Production"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User Role</span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "Regular User"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <h4>To enable email automation:</h4>
              <ol>
                <li>
                  Sign up for a{" "}
                  <a
                    href="https://sender.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Sender.net
                  </a>{" "}
                  account
                </li>
                <li>Get your API key from the Sender.net dashboard</li>
                <li>
                  Add{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    VITE_SENDER_API=your_api_key
                  </code>{" "}
                  to your .env file
                </li>
                <li>Restart your development server</li>
                <li>Test emails using this demo page</li>
              </ol>

              <h4 className="mt-6">Email Types Automated:</h4>
              <ul>
                <li>
                  <strong>Welcome:</strong> Sent when user registers
                </li>
                <li>
                  <strong>Password Reset:</strong> Sent for password recovery
                </li>
                <li>
                  <strong>Email Verification:</strong> Sent to verify email
                  addresses
                </li>
                <li>
                  <strong>Payment Confirmation:</strong> Sent after successful
                  purchases
                </li>
                <li>
                  <strong>Purchase Alert:</strong> Sent to sellers when books
                  are bought
                </li>
                <li>
                  <strong>Courier Pickup:</strong> Sent when courier collects
                  books
                </li>
                <li>
                  <strong>Delivery Complete:</strong> Sent when books are
                  delivered
                </li>
                <li>
                  <strong>Banking Confirmation:</strong> Sent when sellers add
                  bank details
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmailDemo;
