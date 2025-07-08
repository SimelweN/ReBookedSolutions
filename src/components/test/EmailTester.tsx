import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react";
import EmailService from "@/services/emailService";

export const EmailTester: React.FC = () => {
  const [email, setEmail] = useState("test@example.com");
  const [subject, setSubject] = useState("Test Email from ReBooked Solutions");
  const [message, setMessage] = useState(
    "This is a test email to verify the email service is working correctly.",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSendTestEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const success = await EmailService.sendWelcomeEmail({
        name: "Test User",
        email: email,
      });

      setResult({
        success,
        message: success
          ? "Welcome email sent successfully!"
          : "Email sending failed",
      });
    } catch (error) {
      console.error("Email test error:", error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Create a custom HTML message
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #1f4e3d; margin-bottom: 20px;">Custom Test Email</h2>
            <p style="color: #333; line-height: 1.6;">${message}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
              <p>© 2024 ReBooked Solutions. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      // Use the private sendEmail method via a workaround
      const { supabase } = await import("@/integrations/supabase/client");

      const payload = {
        to: email,
        subject: subject,
        html: htmlContent,
        from: {
          name: "ReBooked Solutions",
          email: "noreply@rebookedsolutions.co.za",
        },
      };

      const { data, error } = await supabase.functions.invoke(
        "send-email-notification",
        {
          body: payload,
        },
      );

      if (error) {
        throw new Error(error.message || "Edge function error");
      }

      setResult({
        success: data?.success || false,
        message: data?.success
          ? "Custom email sent successfully!"
          : `Email sending failed: ${data?.error || data?.message || "Unknown error"}`,
      });
    } catch (error) {
      console.error("Custom email test error:", error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailTypes = [
    {
      name: "Welcome Email",
      description: "Test the welcome email template",
      action: handleSendTestEmail,
    },
    {
      name: "Custom Email",
      description: "Send a custom email with your own content",
      action: handleSendCustomEmail,
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Service Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Test Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to test"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Subject (for custom email)
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Message (for custom email)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email message content"
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-3">
          {testEmailTypes.map((test) => (
            <div
              key={test.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{test.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {test.description}
                </p>
              </div>
              <Button
                onClick={test.action}
                disabled={isLoading || !email}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send Test"
                )}
              </Button>
            </div>
          ))}
        </div>

        {result && (
          <Alert
            className={
              result.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription
                className={result.success ? "text-green-800" : "text-red-800"}
              >
                {result.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Environment Variables Status:</strong>
          </p>
          <ul className="space-y-1 ml-4">
            <li>
              • VITE_SENDER_API:{" "}
              {import.meta.env.VITE_SENDER_API ? "✅ Configured" : "❌ Missing"}
            </li>
            <li>
              • Environment:{" "}
              {import.meta.env.PROD ? "Production" : "Development"}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
