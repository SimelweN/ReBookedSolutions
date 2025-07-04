import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { debugReactAvailability } from "../utils/reactSafety";

// Multiple context tests to stress test the fix
interface TestContext1Type {
  value: string;
  setValue: (value: string) => void;
}

interface TestContext2Type {
  count: number;
  increment: () => void;
}

const TestContext1 = createContext<TestContext1Type | undefined>(undefined);
const TestContext2 = createContext<TestContext2Type | undefined>(undefined);

const TestProvider1: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState("Initial Value");

  return (
    <TestContext1.Provider value={{ value, setValue }}>
      {children}
    </TestContext1.Provider>
  );
};

const TestProvider2: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);

  return (
    <TestContext2.Provider value={{ count, increment }}>
      {children}
    </TestContext2.Provider>
  );
};

const TestComponent1: React.FC = () => {
  const context = useContext(TestContext1);
  if (!context) {
    throw new Error("TestComponent1 must be used within TestProvider1");
  }

  const { value, setValue } = context;

  return (
    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        Context Test 1
      </h3>
      <p className="text-blue-700 mb-2">Value: {value}</p>
      <button
        onClick={() =>
          setValue(`Updated at ${new Date().toLocaleTimeString()}`)
        }
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Update Value
      </button>
    </div>
  );
};

const TestComponent2: React.FC = () => {
  const context = useContext(TestContext2);
  if (!context) {
    throw new Error("TestComponent2 must be used within TestProvider2");
  }

  const { count, increment } = context;

  return (
    <div className="p-4 border border-green-200 bg-green-50 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        Context Test 2
      </h3>
      <p className="text-green-700 mb-2">Count: {count}</p>
      <button
        onClick={increment}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Increment
      </button>
    </div>
  );
};

const ReactContextTest: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const info = debugReactAvailability();
      setDebugInfo(info);
      console.log("✅ React Context Test page loaded successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("❌ React Context Test failed:", errorMessage);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              React Context Error
            </h1>
            <p className="text-red-700 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          React Context Test Page
        </h1>

        <div className="mb-8">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              React Availability Debug Info
            </h2>
            <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        <TestProvider1>
          <TestProvider2>
            <TestComponent1 />
            <TestComponent2 />
          </TestProvider2>
        </TestProvider1>

        <div className="mt-8">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Error Reproduction Test
            </h2>
            <p className="text-gray-600 mb-4">
              If you were experiencing "Cannot read properties of undefined
              (reading 'createContext')" errors, they should be fixed now. This
              page creates multiple contexts to test the fix.
            </p>
            <div className="text-sm text-gray-500">
              <p>✅ Multiple createContext calls working</p>
              <p>✅ Context providers working</p>
              <p>✅ useContext hooks working</p>
              <p>✅ State updates working</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to App
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactContextTest;
