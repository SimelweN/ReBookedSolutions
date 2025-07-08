#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const functionsDir = path.join(__dirname, "..", "supabase", "functions");

// Get list of all function directories
const functionDirs = fs
  .readdirSync(functionsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory() && dirent.name !== "_shared")
  .map((dirent) => dirent.name);

console.log("🔍 Analyzing Edge Functions for common issues...\n");

let issuesFound = 0;

functionDirs.forEach((funcName) => {
  const indexPath = path.join(functionsDir, funcName, "index.ts");

  if (!fs.existsSync(indexPath)) {
    console.log(`❌ ${funcName}: Missing index.ts file`);
    issuesFound++;
    return;
  }

  const content = fs.readFileSync(indexPath, "utf-8");
  const issues = [];

  // Check for old Deno standard library versions
  if (content.includes("deno.land/std@0.168")) {
    issues.push("Using old Deno std library version (0.168.0)");
  }

  // Check for node:crypto imports
  if (content.includes("node:crypto")) {
    issues.push("Using Node.js crypto (not compatible with Deno)");
  }

  // Check for missing CORS import on environment errors
  if (
    content.includes("createEnvironmentError") &&
    !content.includes("corsHeaders")
  ) {
    issues.push("Missing CORS headers in environment error responses");
  }

  // Check for undefined API key variables
  if (
    content.includes("COURIER_GUY_API_KEY") &&
    !content.includes('Deno.env.get("COURIER_GUY_API_KEY")')
  ) {
    issues.push("COURIER_GUY_API_KEY used but not defined");
  }

  if (
    content.includes("FASTWAY_API_KEY") &&
    !content.includes('Deno.env.get("FASTWAY_API_KEY")')
  ) {
    issues.push("FASTWAY_API_KEY used but not defined");
  }

  // Check for proper error handling
  if (!content.includes("try {") || !content.includes("catch")) {
    issues.push("Missing proper error handling");
  }

  if (issues.length > 0) {
    console.log(`⚠️  ${funcName}:`);
    issues.forEach((issue) => console.log(`   - ${issue}`));
    console.log("");
    issuesFound += issues.length;
  } else {
    console.log(`✅ ${funcName}: No issues found`);
  }
});

console.log(
  `\n📊 Summary: ${issuesFound} issues found across ${functionDirs.length} functions`,
);

if (issuesFound > 0) {
  console.log("\n🔧 Common fixes needed:");
  console.log("   1. Update Deno std library to @0.190.0");
  console.log("   2. Replace node:crypto with Web Crypto API");
  console.log("   3. Ensure all API keys are properly defined");
  console.log("   4. Add CORS headers to all responses");
  console.log("   5. Implement proper error handling");
}
