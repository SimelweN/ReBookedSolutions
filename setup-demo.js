#!/usr/bin/env node

/**
 * Demo Environment Setup Script
 * Helps set up demo keys and validate the development environment
 */

const fs = require("fs");
const path = require("path");

const DEMO_ENV_CONTENT = `# Demo Environment Configuration
# These are safe demo/test keys for development and testing

# Paystack Test Keys (Safe to share - they're test keys)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_37c77bb59dc7a6b3a3b836a74ebc3b9f59e25de7
VITE_PAYSTACK_SECRET_KEY=sk_test_37c77bb59dc7a6b3a3b836a74ebc3b9f59e25de7

# Demo API Keys for testing (non-functional but safe)
VITE_GOOGLE_MAPS_API_KEY=demo-google-maps-key
VITE_COURIER_GUY_API_KEY=demo-courier-guy-key
VITE_FASTWAY_API_KEY=demo-fastway-key
VITE_SENDER_API=demo-sender-api-key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_BANKING_VAULT_URL=https://demo-banking-vault.lovable.app

# Add your actual Supabase credentials here:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Node Environment
NODE_ENV=development
`;

function createDemoEnv() {
  const envPath = path.join(process.cwd(), ".env.demo");
  const envLocalPath = path.join(process.cwd(), ".env.local");

  try {
    // Always create .env.demo
    fs.writeFileSync(envPath, DEMO_ENV_CONTENT);
    console.log("✅ Created .env.demo with demo keys");

    // Check if .env.local exists
    if (!fs.existsSync(envLocalPath)) {
      console.log("📝 .env.local not found. Creating with demo keys...");
      fs.writeFileSync(envLocalPath, DEMO_ENV_CONTENT);
      console.log("✅ Created .env.local with demo keys");
      console.log("⚠️  Remember to add your actual Supabase credentials!");
    } else {
      console.log(
        "ℹ️  .env.local already exists. Demo keys saved to .env.demo",
      );
      console.log("💡 You can copy demo keys from .env.demo if needed");
    }

    return true;
  } catch (error) {
    console.error("❌ Error creating demo environment:", error.message);
    return false;
  }
}

function validateExistingEnv() {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envPath = path.join(process.cwd(), ".env");

  let envContent = "";
  let envFile = "";

  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, "utf8");
    envFile = ".env.local";
  } else if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
    envFile = ".env";
  } else {
    console.log("📝 No environment file found");
    return false;
  }

  console.log(`🔍 Validating ${envFile}...`);

  const requiredKeys = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_PAYSTACK_PUBLIC_KEY",
  ];

  const optionalKeys = [
    "VITE_GOOGLE_MAPS_API_KEY",
    "VITE_COURIER_GUY_API_KEY",
    "VITE_FASTWAY_API_KEY",
    "VITE_SENDER_API",
  ];

  let issues = 0;
  let warnings = 0;

  // Check required keys
  requiredKeys.forEach((key) => {
    if (!envContent.includes(key)) {
      console.log(`❌ Missing required key: ${key}`);
      issues++;
    } else {
      console.log(`✅ Found: ${key}`);
    }
  });

  // Check optional keys
  optionalKeys.forEach((key) => {
    if (!envContent.includes(key)) {
      console.log(`⚠️  Optional key missing: ${key}`);
      warnings++;
    } else {
      console.log(`✅ Found: ${key}`);
    }
  });

  // Check for demo keys
  if (envContent.includes("pk_test_37c77bb59dc7a6b3a3b836a74ebc3b9f59e25de7")) {
    console.log("🧪 Using demo Paystack test key (safe for development)");
  }

  if (envContent.includes("demo-")) {
    console.log("🧪 Using demo API keys (safe for development)");
  }

  console.log(`\n📊 Validation Summary:`);
  console.log(
    `   Required keys: ${requiredKeys.length - issues}/${requiredKeys.length} configured`,
  );
  console.log(
    `   Optional keys: ${optionalKeys.length - warnings}/${optionalKeys.length} configured`,
  );

  return issues === 0;
}

function printInstructions() {
  console.log(`
🚀 Demo Environment Setup Complete!

Next steps:
1. Start your development server: npm run dev (or yarn dev)
2. Go to Admin Panel → Utilities → Demo Environment & Testing
3. Click "Run Full Test" to validate everything works
4. Add your Supabase credentials to .env.local for full functionality

Demo features available:
✅ Multi-seller cart with explanations  
✅ Activity tracking with sample data
✅ Order viewing (with Supabase connection)
✅ Commit system testing
✅ Payment system validation

Need help?
- Check MULTI_SELLER_CART_FIXES.md for detailed documentation
- Use the Demo Tester in admin panel for validation
- All demo keys are safe for development and testing
`);
}

function main() {
  console.log("🔧 Setting up demo environment for ReBooked Solutions...\n");

  const envCreated = createDemoEnv();
  console.log("");

  const envValid = validateExistingEnv();
  console.log("");

  if (envCreated || envValid) {
    printInstructions();
  } else {
    console.log(`
❌ Setup encountered issues. Please:
1. Check file permissions in your project directory
2. Manually create .env.local with demo keys from .env.demo
3. Add your Supabase credentials
4. Restart your development server
`);
    process.exit(1);
  }
}

// Run the setup
main();
