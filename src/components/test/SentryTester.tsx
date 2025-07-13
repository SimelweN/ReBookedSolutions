import React from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bug, Info, Zap } from "lucide-react";
import { toast } from "sonner";

const SentryTester: React.FC = () => {
  const testBasicError = () => {
    try {
      throw new Error("This is your first error!");
    } catch (error) {
      Sentry.captureException(error);
      toast.error("Test error thrown and sent to Sentry!");
    }
  };

  const testCustomMessage = () => {
    Sentry.captureMessage("Custom test message from DevDashboard", "info");
    toast.success("Custom message sent to Sentry!");
  };

  const testPerformanceTransaction = () => {
    // Use the current Sentry API for performance monitoring
    Sentry.startSpan(
      {
        name: "Test Performance Transaction",
        op: "custom",
      },
      (span) => {
        // Simulate some work
        setTimeout(() => {
          span?.setStatus({ code: 2, message: "ok" });
          toast.success("Performance span completed and sent to Sentry!");
        }, 1000);
      },
    );
  };

  const testUserContext = () => {
    Sentry.setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "test-user",
    });

    Sentry.setTag("test-environment", "dev-dashboard");
    Sentry.setContext("test-context", {
      component: "SentryTester",
      timestamp: new Date().toISOString(),
    });

    Sentry.captureMessage(
      "Test message with user context and custom tags",
      "info",
    );
    toast.success("Message with user context sent to Sentry!");
  };

  const testBreadcrumbs = () => {
    Sentry.addBreadcrumb({
      message: "User clicked test button",
      category: "ui",
      level: "info",
    });

    Sentry.addBreadcrumb({
      message: "Preparing to send test error",
      category: "test",
      level: "debug",
    });

    try {
      throw new Error("Test error with breadcrumbs!");
    } catch (error) {
      Sentry.captureException(error);
      toast.error("Test error with breadcrumbs sent to Sentry!");
    }
  };

  const testSentryScope = () => {
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "test");
      scope.setLevel("warning");
      scope.setContext("additional-context", {
        testData: "This is test data",
        component: "SentryTester",
      });

      Sentry.captureMessage("Test message with custom scope", "warning");
    });

    toast.success("Message with custom scope sent to Sentry!");
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These buttons will send test events to Sentry to verify your
          integration is working. Check your Sentry dashboard to see the events
          appear.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="h-5 w-5 text-red-500" />
              <span>Basic Error Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={testBasicError}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Throw Test Error
            </Button>

            <Button
              onClick={testCustomMessage}
              variant="outline"
              className="w-full"
            >
              <Info className="h-4 w-4 mr-2" />
              Send Custom Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span>Advanced Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={testPerformanceTransaction}
              variant="outline"
              className="w-full"
            >
              Test Performance Transaction
            </Button>

            <Button
              onClick={testUserContext}
              variant="outline"
              className="w-full"
            >
              Test User Context
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breadcrumbs & Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={testBreadcrumbs}
              variant="outline"
              className="w-full"
            >
              Test with Breadcrumbs
            </Button>

            <Button
              onClick={testSentryScope}
              variant="outline"
              className="w-full"
            >
              Test Custom Scope
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentry Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>
                <strong>DSN:</strong> Configured ✓
              </div>
              <div>
                <strong>Environment:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Tracing:</strong> 100% sample rate
              </div>
              <div>
                <strong>Session Replay:</strong> 10% sample rate
              </div>
              <div>
                <strong>Error Replay:</strong> 100% sample rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SentryTester;
