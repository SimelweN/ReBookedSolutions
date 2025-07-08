import React from "react";
import { SimpleEmailTest } from "@/components/test/SimpleEmailTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Settings, CheckCircle, XCircle } from "lucide-react";

const EmailTest = () => {
  const isConfigured = Boolean(
    import.meta.env.VITE_SENDER_API &&
      import.meta.env.VITE_SENDER_API !== "demo-sender-api-key",
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Mail className="w-8 h-8" />
            Email Service Test
          </h1>
          <p className="text-muted-foreground">
            Test the email functionality of ReBooked Solutions
          </p>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-medium">VITE_SENDER_API:</span>
                <span
                  className={
                    isConfigured ? "text-green-600" : "text-yellow-600"
                  }
                >
                  {isConfigured ? "Configured" : "Demo Mode"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">FROM_EMAIL:</span>
                <span className="text-green-600">
                  noreply@rebookedsolutions.co.za
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Environment:</span>
                <span className="text-blue-600">
                  {import.meta.env.PROD ? "Production" : "Development"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Edge Functions:</span>
                <span className="text-blue-600">Ready</span>
              </div>
            </div>

            {!isConfigured && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Demo Mode:</strong> Email sending will be simulated.
                  To send real emails, configure your Sender.net API key in the
                  environment variables.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Interface */}
        <div className="flex justify-center">
          <SimpleEmailTest />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Configure Real Email Sending</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Get Sender.net API Key</h4>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>
                  • Go to{" "}
                  <a
                    href="https://www.sender.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    sender.net
                  </a>
                </li>
                <li>• Sign up or log in</li>
                <li>• Navigate to Settings → API</li>
                <li>• Create a new API key</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">2. Add Environment Variables</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                <div>VITE_SENDER_API=your_actual_api_key_here</div>
                <div>FROM_EMAIL=noreply@rebookedsolutions.co.za</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">3. For Production (Supabase)</h4>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• Add SENDER_API_KEY to Supabase environment variables</li>
                <li>• Add FROM_EMAIL to Supabase environment variables</li>
                <li>• Redeploy edge functions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTest;
