import React from "react";

const UniversityInfoTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">University Info Test</h1>
        <p className="text-gray-600">
          This is a test page to check if the basic routing and rendering works.
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <ul className="space-y-1 text-sm">
            <li>✅ React rendering works</li>
            <li>✅ Tailwind CSS works</li>
            <li>✅ Component export works</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UniversityInfoTest;
