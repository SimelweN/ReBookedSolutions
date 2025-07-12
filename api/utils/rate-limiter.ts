import type { VercelRequest, VercelResponse } from "@vercel/node";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (production should use Redis)
const requestCounts = new Map<string, RateLimitData>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export function rateLimit(options: RateLimitOptions) {
  return (
    req: VercelRequest,
    res: VercelResponse,
    next?: Function,
  ): boolean => {
    const {
      windowMs,
      maxRequests,
      message = "Too many requests, please try again later.",
      skipSuccessfulRequests = false,
    } = options;

    // Generate key based on IP address and endpoint
    const clientIP = getClientIP(req);
    const endpoint = req.url?.split("?")[0] || "";
    const key = `${clientIP}:${endpoint}`;

    const now = Date.now();
    const resetTime = now + windowMs;

    // Get current count for this key
    let requestData = requestCounts.get(key);

    // Reset if window has expired
    if (!requestData || now > requestData.resetTime) {
      requestData = { count: 0, resetTime };
      requestCounts.set(key, requestData);
    }

    // Increment count
    requestData.count++;

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - requestData.count);
    const resetInSeconds = Math.ceil((requestData.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetInSeconds.toString());

    // Check if limit exceeded
    if (requestData.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: resetInSeconds,
      });
      return false;
    }

    // Success callback for tracking
    const originalSend = res.send;
    res.send = function (body) {
      const statusCode = res.statusCode;

      // If we should skip successful requests, decrement count
      if (skipSuccessfulRequests && statusCode >= 200 && statusCode < 400) {
        const currentData = requestCounts.get(key);
        if (currentData) {
          currentData.count = Math.max(0, currentData.count - 1);
        }
      }

      return originalSend.call(this, body);
    };

    return true;
  };
}

function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];
  const cfConnectingIP = req.headers["cf-connecting-ip"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  if (typeof realIP === "string") {
    return realIP;
  }

  if (typeof cfConnectingIP === "string") {
    return cfConnectingIP;
  }

  return req.socket?.remoteAddress || "unknown";
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Very strict for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per window
    message:
      "Too many authentication attempts. Please try again in 15 minutes.",
  },

  // Moderate for payment endpoints
  payment: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message:
      "Too many payment requests. Please wait a moment before trying again.",
  },

  // Standard for general API endpoints
  general: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: "Too many requests. Please wait a moment before trying again.",
  },

  // Relaxed for read-only endpoints
  readOnly: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: "Too many requests. Please wait a moment before trying again.",
  },

  // Strict for file uploads
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5, // 5 uploads per 5 minutes
    message: "Too many file uploads. Please wait before uploading again.",
  },
};

export default rateLimit;
