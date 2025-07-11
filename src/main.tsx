// Absolutely minimal - no imports at all
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center; background: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
      <h1 style="color: #1e40af; margin-bottom: 16px;">ReBooked Solutions</h1>
      <p style="color: #374151; margin-bottom: 8px;">Absolute minimal version</p>
      <p style="color: #6b7280; font-size: 14px;">Workers build test</p>
    </div>
  `;
}
