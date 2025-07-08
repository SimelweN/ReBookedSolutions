#!/usr/bin/env node

/**
 * Automated Environment Setup for ReBooked Solutions
 * Detects missing configuration and guides through setup
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function detectEnvironmentIssues() {
  const issues = [];
  const warnings = [];

  // Check if .env exists
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    issues.push({
      type: "error",
      service: "Environment File",
      issue: ".env file not found",
      solution: "Create .env file with required variables",
    });
    return { issues, warnings };
  }

  // Read .env file
  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  // Check required variables
  const required = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_PAYSTACK_PUBLIC_KEY",
  ];

  required.forEach((key) => {
    const value = envVars[key];
    if (!value || value === "") {
      issues.push({
        type: "error",
        service: getServiceName(key),
        issue: `${key} is missing`,
        solution: getSetupInstructions(key),
      });
    } else if (
      value.includes("demo-") ||
      value.includes("your-") ||
      value.includes("placeholder")
    ) {
      issues.push({
        type: "error",
        service: getServiceName(key),
        issue: `${key} contains placeholder value`,
        solution: getSetupInstructions(key),
      });
    }
  });

  // Check optional but important variables
  const optional = [
    "VITE_GOOGLE_MAPS_API_KEY",
    "VITE_SENDER_API",
    "VITE_COURIER_GUY_API_KEY",
  ];

  optional.forEach((key) => {
    const value = envVars[key];
    if (!value || value === "" || value.includes("demo-")) {
      warnings.push({
        type: "warning",
        service: getServiceName(key),
        issue: `${key} not configured`,
        solution: `Optional: ${getSetupInstructions(key)}`,
      });
    }
  });

  return { issues, warnings };
}

function getServiceName(key) {
  const mapping = {
    VITE_SUPABASE_URL: "Supabase Database",
    VITE_SUPABASE_ANON_KEY: "Supabase Database",
    VITE_PAYSTACK_PUBLIC_KEY: "Paystack Payments",
    VITE_GOOGLE_MAPS_API_KEY: "Google Maps",
    VITE_SENDER_API: "Email Service",
    VITE_COURIER_GUY_API_KEY: "Shipping Service",
  };
  return mapping[key] || key;
}

function getSetupInstructions(key) {
  const instructions = {
    VITE_SUPABASE_URL:
      "Create Supabase project at https://supabase.com/dashboard",
    VITE_SUPABASE_ANON_KEY: "Get anon key from Supabase project settings",
    VITE_PAYSTACK_PUBLIC_KEY:
      "Get public key from https://dashboard.paystack.com",
    VITE_GOOGLE_MAPS_API_KEY:
      "Create API key at https://console.cloud.google.com",
    VITE_SENDER_API: "Get API key from email service provider",
    VITE_COURIER_GUY_API_KEY: "Get API key from Courier Guy",
  };
  return instructions[key] || "Configure this service";
}

function generateSetupReport() {
  const { issues, warnings } = detectEnvironmentIssues();

  console.log("\n🔍 REBOOKED SOLUTIONS - SYSTEM ANALYSIS\n");

  if (issues.length === 0 && warnings.length === 0) {
    console.log("✅ System appears to be properly configured!");
    console.log("🚀 You can start the application with: npm run dev");
    return;
  }

  if (issues.length > 0) {
    console.log("🚨 CRITICAL ISSUES (Must be fixed):");
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.service}`);
      console.log(`   Problem: ${issue.issue}`);
      console.log(`   Solution: ${issue.solution}`);
    });
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  OPTIONAL IMPROVEMENTS (Can be done later):");
    warnings.forEach((warning, index) => {
      console.log(`\n${index + 1}. ${warning.service}`);
      console.log(`   Issue: ${warning.issue}`);
      console.log(`   Solution: ${warning.solution}`);
    });
  }

  console.log("\n📋 NEXT STEPS:");
  if (issues.length > 0) {
    console.log("1. Fix the critical issues above");
    console.log("2. Run this script again to verify: npm run check-setup");
    console.log("3. Start the application: npm run dev");
  } else {
    console.log("1. Optional: Configure the services listed in warnings");
    console.log("2. Start the application: npm run dev");
  }

  console.log("\n💡 QUICK SETUP:");
  console.log("- Run interactive setup: npm run setup");
  console.log("- View documentation: Check SETUP.md");
}

function createSampleEnv() {
  const sampleEnv = `# ReBooked Solutions Environment Configuration
# Copy this file to .env and fill in your actual values

# Database & Authentication (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Payment Processing (REQUIRED)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key

# Google Maps (Optional - for address autocomplete)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Service (Optional - for notifications)
VITE_SENDER_API=your-email-service-api-key

# Shipping Services (Optional - for delivery quotes)
VITE_COURIER_GUY_API_KEY=your-courier-guy-api-key
VITE_FASTWAY_API_KEY=your-fastway-api-key

# App Configuration
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
`;

  fs.writeFileSync(".env.example", sampleEnv);
  console.log("✅ Created .env.example file for reference");
}

function main() {
  console.log("ReBooked Solutions - Automated Setup Check\n");

  // Create sample env if it doesn't exist
  if (!fs.existsSync(".env.example")) {
    createSampleEnv();
  }

  // Generate setup report
  generateSetupReport();
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { detectEnvironmentIssues, generateSetupReport };
