import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const NetworkTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testBasicFetch = async () => {
    try {
      addResult("Testing basic fetch...");
      const response = await fetch("/api/health");
      if (response.ok) {
        addResult("✅ Basic fetch successful");
      } else {
        addResult(`❌ Basic fetch failed: ${response.status}`);
      }
    } catch (error) {
      addResult(
        `❌ Basic fetch error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const testSupabaseConnection = async () => {
    try {
      addResult("Testing Supabase connection...");
      const { supabase } = await import("../../integrations/supabase/client");
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addResult(`❌ Supabase error: ${error.message}`);
      } else {
        addResult("✅ Supabase connection successful");
      }
    } catch (error) {
      addResult(
        `❌ Supabase test error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    await testBasicFetch();
    await testSupabaseConnection();

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Network Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isLoading}>
            {isLoading ? "Running Tests..." : "Run Network Tests"}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="space-y-1 font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
