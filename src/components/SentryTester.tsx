import React from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bug, Activity } from "lucide-react";

const SentryTester: React.FC = () => {
  const triggerError = () => {
    try {
      throw new Error("Test error triggered manually from Sentry Test page");
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error sent to Sentry:", error);
    }
  };

  const triggerWarning = () => {
    Sentry.captureMessage(
      "Test warning message from Sentry Test page",
      "warning",
    );
  };

  const triggerInfo = () => {
    Sentry.captureMessage("Test info message from Sentry Test page", "info");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            Error Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={triggerError}
            variant="destructive"
            className="w-full"
          >
            <Bug className="mr-2 h-4 w-4" />
            Trigger Test Error
          </Button>

          <Button onClick={triggerWarning} variant="outline" className="w-full">
            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
            Trigger Test Warning
          </Button>

          <Button onClick={triggerInfo} variant="outline" className="w-full">
            <Activity className="mr-2 h-4 w-4 text-blue-500" />
            Trigger Test Info
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Click the buttons above to send test events to Sentry. Check your
            Sentry dashboard to verify that errors and messages are being
            captured correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentryTester;
