import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SimpleEmailTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testEmailFunction = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log("🧪 Testing email edge function...");

      const payload = {
        to: "test@example.com",
        subject: "Test Email from ReBooked Solutions",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1f4e3d;">Email Service Test</h2>
            <p>This is a test email to verify that the email service is working correctly.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p style="color: #666; font-size: 14px;">This email was sent from the ReBooked Solutions testing interface.</p>
          </div>
        `,
        from: {
          name: "ReBooked Solutions",
          email: "noreply@rebooked.co.za",
        },
      };

      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke(
        "send-email-notification",
        {
          body: payload,
        },
      );

      console.log("📡 Response:", { data, error });

      if (error) {
        throw new Error(
          `Edge function error: ${error.message || JSON.stringify(error)}`,
        );
      }

      if (data?.success) {
        setResult({
          success: true,
          message: `Email test successful! ${data.message || "Email sent via edge function"}`,
        });
      } else {
        setResult({
          success: false,
          message: `Email test failed: ${data?.error || data?.message || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("❌ Email test failed:", error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testEmailFunction}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Test Email Service
            </>
          )}
        </Button>

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

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Environment:</strong>
          </p>
          <ul className="text-xs space-y-1 ml-4">
            <li>
              • API Key:{" "}
              {import.meta.env.VITE_SENDER_API ? "✅ Configured" : "❌ Missing"}
            </li>
            <li>
              • Mode: {import.meta.env.PROD ? "Production" : "Development"}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
