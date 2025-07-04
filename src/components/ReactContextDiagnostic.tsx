import * as React from "react";
import { createContext, useContext, useState } from "react";

// Test context to verify createContext is working
interface TestContextType {
  testValue: string;
  setTestValue: (value: string) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

const useTestContext = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTestContext must be used within TestProvider");
  }
  return context;
};

const TestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [testValue, setTestValue] = useState("React Context Working ✅");

  return (
    <TestContext.Provider value={{ testValue, setTestValue }}>
      {children}
    </TestContext.Provider>
  );
};

const TestConsumer: React.FC = () => {
  const { testValue, setTestValue } = useTestContext();

  return (
    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
      <h3 className="text-sm font-medium text-green-800 mb-2">
        React Context Diagnostic
      </h3>
      <p className="text-sm text-green-700 mb-2">Status: {testValue}</p>
      <button
        onClick={() =>
          setTestValue(`Updated at ${new Date().toLocaleTimeString()}`)
        }
        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
      >
        Test Update
      </button>
    </div>
  );
};

// Main diagnostic component
const ReactContextDiagnostic: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  // Test React availability
  React.useEffect(() => {
    try {
      // Test if createContext is available
      if (!React.createContext) {
        throw new Error("React.createContext is not available");
      }

      // Test if hooks are available
      if (!React.useState || !React.useEffect || !React.useContext) {
        throw new Error("React hooks are not available");
      }

      console.log("✅ React Context Diagnostic: All checks passed");
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ React Context Diagnostic failed:", errorMessage);
      setError(errorMessage);
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-sm font-medium text-red-800 mb-2">
          React Context Error Detected
        </h3>
        <p className="text-sm text-red-700 mb-2">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <TestProvider>
      <TestConsumer />
    </TestProvider>
  );
};

export default ReactContextDiagnostic;
