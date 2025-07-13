import React from "react";
import Layout from "@/components/Layout";
import SentryTester from "@/components/test/SentryTester";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, Shield } from "lucide-react";

const SentryTestPage: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Sentry Error Monitoring Test"
        description="Test Sentry error monitoring and reporting functionality"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Sentry Error Monitoring Test
            </h1>
            <p className="text-lg text-gray-600">
              Test error tracking and performance monitoring with Sentry
            </p>
          </div>

          <Alert className="mb-6">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Only:</strong> This page is for testing Sentry
              integration. Errors and events sent from here will appear in your
              Sentry dashboard.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Sentry Integration Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SentryTester />
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Check your{" "}
              <a
                href="https://sentry.io/organizations/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Sentry Dashboard
              </a>{" "}
              to see the test events appear in real-time.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SentryTestPage;
