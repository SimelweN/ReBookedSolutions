// Simple JS test without React
console.log("🚀 JavaScript is executing...");

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log("Root element found:", rootElement);

// Test basic DOM manipulation
rootElement.innerHTML = `
  <div style="padding: 20px; font-family: Arial, sans-serif; background: #f0f0f0; border: 2px solid #333;">
    <h1 style="color: green;">✅ JavaScript is Working!</h1>
    <p>This is a test to verify basic JavaScript execution.</p>
    <p>Current time: ${new Date().toLocaleString()}</p>
    <button onclick="alert('Button clicked!')">Test Button</button>
  </div>
`;

console.log("✅ DOM manipulation successful");
