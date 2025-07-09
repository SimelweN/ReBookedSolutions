#!/usr/bin/env node

/**
 * Environment Setup Script for ReBooked Solutions
 * This script helps configure the application with proper credentials
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log("\n🚀 ReBooked Solutions Environment Setup\n");
  console.log(
    "This script will help you configure the application with proper credentials.\n",
  );

  const config = {};

  // Supabase Configuration
  console.log("📊 SUPABASE DATABASE CONFIGURATION");
  console.log("Visit: https://supabase.com/dashboard");
  console.log("Create a new project or use existing one\n");

  config.VITE_SUPABASE_URL = await question("Enter your Supabase URL: ");
  config.VITE_SUPABASE_ANON_KEY = await question(
    "Enter your Supabase Anon Key: ",
  );

  // Paystack Configuration
  console.log("\n💳 PAYSTACK PAYMENT CONFIGURATION");
  console.log("Visit: https://dashboard.paystack.com/#/settings/developer");

  const useTestKeys = await question("Use test keys? (y/n): ");
  if (useTestKeys.toLowerCase() === "y") {
    config.VITE_PAYSTACK_PUBLIC_KEY = await question(
      "Enter Paystack Test Public Key: ",
    );
    config.VITE_PAYSTACK_SECRET_KEY = await question(
      "Enter Paystack Test Secret Key: ",
    );
  } else {
    config.VITE_PAYSTACK_PUBLIC_KEY = await question(
      "Enter Paystack Live Public Key: ",
    );
    config.VITE_PAYSTACK_SECRET_KEY = await question(
      "Enter Paystack Live Secret Key: ",
    );
  }

  // Google Maps
  console.log("\n🗺️ GOOGLE MAPS CONFIGURATION");
  console.log("Visit: https://console.developers.google.com/");
  console.log("Enable: Places API, Geocoding API, Maps JavaScript API\n");

  config.VITE_GOOGLE_MAPS_API_KEY = await question(
    "Enter Google Maps API Key: ",
  );

  // Email Service
  console.log("\n📧 EMAIL SERVICE CONFIGURATION");
  console.log("Choose email provider:");
  console.log("1. Sender.net");
  console.log("2. Resend");
  console.log("3. Other\n");

  const emailProvider = await question("Enter choice (1-3): ");
  config.VITE_SENDER_API = await question("Enter Email API Key: ");
  config.FROM_EMAIL = await question("Enter FROM email address: ");

  // Shipping Services (Optional)
  console.log("\n🚚 SHIPPING SERVICES (Optional)");
  const setupShipping = await question("Configure shipping services? (y/n): ");

  if (setupShipping.toLowerCase() === "y") {
    config.VITE_COURIER_GUY_API_KEY =
      (await question("Enter Courier Guy API Key (optional): ")) || "";
    config.VITE_FASTWAY_API_KEY =
      (await question("Enter Fastway API Key (optional): ")) || "";
  } else {
    config.VITE_COURIER_GUY_API_KEY = "";
    config.VITE_FASTWAY_API_KEY = "";
  }

  // App Configuration
  config.VITE_APP_URL =
    (await question("Enter App URL (https://yourdomain.com): ")) ||
    "http://localhost:5173";
  config.NODE_ENV = "production";

  // Create .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(".env", envContent);

  console.log("\n✅ Environment configuration saved to .env file");
  console.log("\n🔄 Next steps:");
  console.log("1. Run: npm install");
  console.log("2. Set up Supabase database tables");
  console.log("3. Test the application: npm run dev");

  rl.close();
}

if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = { setupEnvironment };
