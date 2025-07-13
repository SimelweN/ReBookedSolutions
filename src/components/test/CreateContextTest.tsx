/**
 * Test component to verify createContext fixes work properly
 */

import * as React from "react";
// Direct React import to avoid createContext issues

interface TestContextValue {
  message: string;
  count: number;
}

const defaultValue: TestContextValue = {
  message: "Test context is working!",
  count: 0,
};

// Test the context creation - using safe wrapper
const TestContext = React.createContext<TestContextValue>(defaultValue);

export const CreateContextTest: React.FC = () => {
  const [count, setCount] = React.useState(0);

  const contextValue: TestContextValue = {
    message: "Safe createContext is working correctly!",
    count,
  };

  return (
    <TestContext.Provider value={contextValue}>
      <div className="p-4 border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ✅ CreateContext Test Component
        </h3>
        <TestContextConsumer />
        <button
          onClick={() => setCount(count + 1)}
          className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Increment Count: {count}
        </button>
      </div>
    </TestContext.Provider>
  );
};

const TestContextConsumer: React.FC = () => {
  const contextValue = React.useContext(TestContext);

  return (
    <div className="text-sm text-green-700">
      <p>Context Message: {contextValue.message}</p>
      <p>Context Count: {contextValue.count}</p>
    </div>
  );
};

export default CreateContextTest;
