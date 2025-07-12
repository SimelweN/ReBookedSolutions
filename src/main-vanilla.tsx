// Absolute minimal vanilla approach for Workers compatibility test
import "./index.css";

// Create the minimal content
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
      <h1 style="color: #2563eb;">ReBooked Solutions</h1>
      <p>Vanilla JS version for Workers build compatibility</p>
      <p style="color: #6b7280; font-size: 14px;">Build test: ${new Date().toISOString()}</p>
    </div>
  `;
}
