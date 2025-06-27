import React, { useState, useEffect } from "react";

const SupabaseConnectivityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    basicFetch: string;
    supabaseTest: string;
    directTest: string;
  }>({
    basicFetch: "Testing...",
    supabaseTest: "Testing...",
    directTest: "Testing...",
  });

  useEffect(() => {
    const runTests = async () => {
      // Test 1: Basic fetch to a known endpoint
      try {
        const response = await fetch("https://httpbin.org/get");
        const data = await response.json();
        setTestResults((prev) => ({
          ...prev,
          basicFetch: `✅ Basic fetch works: ${response.status}`,
        }));
      } catch (error) {
        setTestResults((prev) => ({
          ...prev,
          basicFetch: `❌ Basic fetch failed: ${error}`,
        }));
      }

      // Test 2: Direct Supabase URL test
      try {
        const supabaseUrl = "https://kbpjqzaqbqukutflwixf.supabase.co/rest/v1/";
        const response = await fetch(supabaseUrl, {
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticGpxemFxYnF1a3V0Zmx3aXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjMzNzcsImV4cCI6MjA2MzEzOTM3N30.3EdAkGlyFv1JRaRw9OFMyA5AkkKoXp0hdX1bFWpLVMc",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticGpxemFxYnF1a3V0Zmx3aXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjMzNzcsImV4cCI6MjA2MzEzOTM3N30.3EdAkGlyFv1JRaRw9OFMyA5AkkKoXp0hdX1bFWpLVMc",
          },
        });
        setTestResults((prev) => ({
          ...prev,
          directTest: `✅ Direct Supabase test works: ${response.status}`,
        }));
      } catch (error) {
        setTestResults((prev) => ({
          ...prev,
          directTest: `❌ Direct Supabase test failed: ${error}`,
        }));
      }

      // Test 3: Supabase client test
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("profiles")
          .select("count")
          .limit(1);
        if (error) {
          setTestResults((prev) => ({
            ...prev,
            supabaseTest: `❌ Supabase client error: ${error.message}`,
          }));
        } else {
          setTestResults((prev) => ({
            ...prev,
            supabaseTest: `✅ Supabase client works`,
          }));
        }
      } catch (error) {
        setTestResults((prev) => ({
          ...prev,
          supabaseTest: `❌ Supabase client failed: ${error}`,
        }));
      }
    };

    runTests();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "white",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        maxWidth: "300px",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h4>🔍 Connectivity Tests</h4>
      <div>
        <strong>Basic Fetch:</strong> {testResults.basicFetch}
      </div>
      <div>
        <strong>Direct Supabase:</strong> {testResults.directTest}
      </div>
      <div>
        <strong>Supabase Client:</strong> {testResults.supabaseTest}
      </div>
    </div>
  );
};

export default SupabaseConnectivityTest;
