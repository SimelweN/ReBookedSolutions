import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TestOrderSystemSimple: React.FC = () => {
  useEffect(() => {
    // Load test utilities into console for immediate use
    import("../utils/testOrderSystem").then((module) => {
      (window as any).testOrderSystem = module.testOrderSystem;
      (window as any).checkDatabaseStatus = module.checkDatabaseStatus;
      console.log("🧪 Order system test utilities loaded!");
      console.log(
        "Run testOrderSystem() or checkDatabaseStatus() in console to test.",
      );
    });
  }, []);

  const runConsoleTest = () => {
    console.log("🧪 Running order system tests...");
    (window as any).testOrderSystem?.();
  };

  const runQuickCheck = () => {
    console.log("🔍 Running quick database check...");
    (window as any).checkDatabaseStatus?.();
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Order System Test Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page loads the order system test utilities into your browser
            console. Open the developer console (F12) to see test results.
          </p>

          <div className="flex gap-4">
            <Button onClick={runQuickCheck} variant="outline">
              Quick Database Check
            </Button>
            <Button onClick={runConsoleTest}>Run Full Tests</Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Console Commands:</h4>
            <code className="text-sm">
              checkDatabaseStatus() - Quick database status
              <br />
              testOrderSystem() - Full test suite
            </code>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>What gets tested:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Database connection</li>
              <li>Enhanced orders table schema</li>
              <li>Notifications and receipts tables</li>
              <li>Database functions (auto-cancel, reminders, etc.)</li>
              <li>Edge function deployment status</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOrderSystemSimple;
