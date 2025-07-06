import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailVerificationService } from "@/services/emailVerificationService";
import { toast } from "sonner";

const DebugEmailVerify: React.FC = () => {
  const [testUrl, setTestUrl] = useState("");
  const [debugOutput, setDebugOutput] = useState("");

  const testVerification = async () => {
    setDebugOutput("Testing...\n");

    // Capture console logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    let logs = "";

    console.log = (...args) => {
      logs += `LOG: ${args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(" ")}\n`;
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      logs += `ERROR: ${args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(" ")}\n`;
      originalConsoleError(...args);
    };

    try {
      // Test with a mock failure result
      const mockFailureResult = {
        success: false,
        message: "Test verification failed",
        error: {
          message: "Token expired",
          code: "token_expired",
        },
      };

      logs += `\n=== Testing getFormattedErrorMessage ===\n`;
      const formattedMessage =
        EmailVerificationService.getFormattedErrorMessage?.(mockFailureResult);
      logs += `Formatted message: "${formattedMessage}" (type: ${typeof formattedMessage})\n`;

      // Test with object that might cause [object Object]
      const problematicResult = {
        success: false,
        message: { nested: "object message" },
        error: { deeply: { nested: { error: "deep error" } } },
      };

      logs += `\n=== Testing problematic object ===\n`;
      const problematicFormatted =
        EmailVerificationService.getFormattedErrorMessage?.(problematicResult);
      logs += `Problematic formatted: "${problematicFormatted}" (type: ${typeof problematicFormatted})\n`;

      // Test toast with different message types
      logs += `\n=== Testing toast messages ===\n`;
      toast.error("Test string message");
      logs += `Toast test 1: string message\n`;

      // This might cause the [object Object] issue
      try {
        const objectMessage = { error: "object error" };
        toast.error(String(objectMessage));
        logs += `Toast test 2: converted object - "${String(objectMessage)}"\n`;
      } catch (e) {
        logs += `Toast test 2 failed: ${e}\n`;
      }

      // Test URL parsing if provided
      if (testUrl) {
        logs += `\n=== Testing URL parsing ===\n`;
        const url = new URL(testUrl);
        const searchParams = new URLSearchParams(url.search);
        const params =
          EmailVerificationService.extractParamsFromUrl(searchParams);
        logs += `Extracted params: ${JSON.stringify(params, null, 2)}\n`;

        const result = await EmailVerificationService.verifyEmail(
          params,
          testUrl,
        );
        logs += `Verification result: ${JSON.stringify(result, null, 2)}\n`;
      }
    } catch (error) {
      logs += `\nException occurred: ${error}\n`;
      logs += `Exception type: ${typeof error}\n`;
      if (error instanceof Error) {
        logs += `Exception message: ${error.message}\n`;
      }
    } finally {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setDebugOutput(logs);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🐛 Email Verification Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Test Verification URL (optional):
            </label>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://yourapp.com/verify?token_hash=abc123&type=signup"
            />
          </div>

          <Button onClick={testVerification} className="w-full">
            Run Debug Test
          </Button>

          {debugOutput && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Debug Output:</h4>
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-96">
                {debugOutput}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>This tool tests:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>EmailVerificationService.getFormattedErrorMessage()</li>
              <li>Object to string conversion issues</li>
              <li>Toast message handling</li>
              <li>URL parameter extraction</li>
              <li>Console logging behavior</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugEmailVerify;
