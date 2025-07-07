import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDatabaseTests = async () => {
    setIsRunning(true);
    const results: string[] = [];

    try {
      // Test 1: Basic connection
      results.push("Testing database connection...");
      const { data: connectionTest, error: connectionError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (connectionError) {
        results.push(`❌ Connection failed: ${connectionError.message}`);
      } else {
        results.push("✅ Database connection successful");
      }

      // Test 2: Profiles table
      results.push("Testing profiles table...");
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email, created_at")
        .limit(5);

      if (profilesError) {
        results.push(`❌ Profiles query failed: ${profilesError.message}`);
      } else {
        results.push(
          `✅ Profiles table accessible (${profilesData?.length || 0} records)`,
        );
      }

      // Test 3: Books table
      results.push("Testing books table...");
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("id, title, author, price, created_at")
        .limit(5);

      if (booksError) {
        results.push(`❌ Books query failed: ${booksError.message}`);
      } else {
        results.push(
          `✅ Books table accessible (${booksData?.length || 0} records)`,
        );
      }

      // Test 4: Orders table
      results.push("Testing orders table...");
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, amount, status, created_at")
        .limit(5);

      if (ordersError) {
        results.push(`❌ Orders query failed: ${ordersError.message}`);
      } else {
        results.push(
          `✅ Orders table accessible (${ordersData?.length || 0} records)`,
        );
      }
    } catch (error) {
      results.push(
        `❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    setTestResults(results);
    setIsRunning(false);
    toast.success("Database tests completed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDatabaseTests} disabled={isRunning}>
          {isRunning ? "Running Tests..." : "Run Database Tests"}
        </Button>

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
