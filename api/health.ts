import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restrict to specific domains
  const allowedOrigins = [
    "https://rebookedsolutions.co.za",
    "https://www.rebookedsolutions.co.za",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use GET.",
    });
  }

  try {
    // Basic health check
    const health = {
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      runtime: "nodejs18.x",
      environment: process.env.NODE_ENV || "unknown",
      version: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    return res.status(200).json(health);
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(500).json({
      success: false,
      error: "Health check failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
