// Absolute minimal Workers-only entry point
// This file contains ZERO browser dependencies

// Workers-safe function that returns static content
export default function WorkersMain() {
  return {
    status: 200,
    headers: { "Content-Type": "text/html" },
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReBooked Solutions</title>
</head>
<body>
  <div style="padding: 40px; font-family: Arial, sans-serif; text-align: center;">
    <h1>ReBooked Solutions</h1>
    <p>Your secure platform for buying and selling used textbooks</p>
    <p style="color: #666; font-size: 14px;">Workers Build Compatible</p>
  </div>
</body>
</html>`,
  };
}

// For module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = WorkersMain;
}
