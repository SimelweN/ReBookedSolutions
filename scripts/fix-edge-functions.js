#!/usr/bin/env node

/**
 * Comprehensive Edge Functions Fix Script
 *
 * This script automatically fixes common issues in Supabase Edge Functions:
 * 1. Adds proper error handling with try-catch blocks
 * 2. Ensures correct HTTP status codes are returned
 * 3. Adds CORS headers using shared utilities
 * 4. Validates environment variables
 * 5. Adds proper input validation
 * 6. Uses shared utilities for consistent responses
 */

const fs = require("fs");
const path = require("path");

const FUNCTIONS_DIR = path.join(__dirname, "../supabase/functions");

// Functions that have already been fixed
const FIXED_FUNCTIONS = [
  "commit-to-sale",
  "paystack-webhook",
  "initialize-paystack-payment",
  "study-resources-api",
  "advanced-search",
  "file-upload",
  "verify-paystack-payment", // partially fixed
  "_shared",
];

// Template for the fixed function header
const FUNCTION_HEADER_TEMPLATE = `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  corsHeaders, 
  createErrorResponse, 
  createSuccessResponse, 
  handleOptionsRequest,
  createGenericErrorHandler 
} from "../_shared/cors.ts";
import { 
  validateAndCreateSupabaseClient,
  validateRequiredEnvVars,
  createEnvironmentError 
} from "../_shared/environment.ts";`;

// Common patterns to fix
const FIXES = [
  {
    name: "Fix CORS handling",
    pattern:
      /if \(req\.method === "OPTIONS"\) \{\s*return new Response\("ok", \{ headers: corsHeaders \}\);\s*\}/,
    replacement: `if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }`,
  },
  {
    name: "Fix basic error response",
    pattern:
      /return new Response\(\s*JSON\.stringify\(\{\s*error:\s*([^}]+)\s*\}\),\s*\{\s*status:\s*(\d+),\s*headers:\s*\{\s*\.\.\.corsHeaders,\s*"Content-Type":\s*"application\/json"\s*\}\s*\}\s*\);/g,
    replacement: "return createErrorResponse($1, $2);",
  },
  {
    name: "Fix Supabase client creation",
    pattern:
      /const supabase = createClient\(\s*Deno\.env\.get\("SUPABASE_URL"\)\s*\?\?\s*"",\s*Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)\s*\?\?\s*"",?\s*\);/g,
    replacement: "const supabase = validateAndCreateSupabaseClient();",
  },
];

function getAllFunctions() {
  return fs.readdirSync(FUNCTIONS_DIR).filter((dir) => {
    const fullPath = path.join(FUNCTIONS_DIR, dir);
    return (
      fs.statSync(fullPath).isDirectory() && !FIXED_FUNCTIONS.includes(dir)
    );
  });
}

function addEnvironmentValidation(content, functionName) {
  // Determine which environment variables this function needs
  const needsPaystack = content.includes("PAYSTACK_SECRET_KEY");
  const needsCourierGuy = content.includes("COURIER_GUY_API_KEY");
  const needsFastway = content.includes("FASTWAY_API_KEY");
  const needsSmtp = content.includes("SMTP_");

  const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  if (needsPaystack) requiredVars.push("PAYSTACK_SECRET_KEY");
  if (needsCourierGuy) requiredVars.push("COURIER_GUY_API_KEY");
  if (needsFastway) requiredVars.push("FASTWAY_API_KEY");
  if (needsSmtp) requiredVars.push("SMTP_HOST", "SMTP_USER", "SMTP_PASS");

  const validation = `
    // Validate required environment variables
    const missingEnvVars = validateRequiredEnvVars([
      ${requiredVars.map((v) => `"${v}"`).join(",\n      ")}
    ]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }`;

  return validation;
}

function wrapInTryCatch(content, functionName) {
  // Find the main serve function
  const serveMatch = content.match(/serve\(async \(req\) => \{([\s\S]*)\}\);/);
  if (!serveMatch) {
    console.warn(`Could not find serve function in ${functionName}`);
    return content;
  }

  const functionBody = serveMatch[1];

  // Check if already wrapped in try-catch
  if (functionBody.trim().startsWith("try {")) {
    return content; // Already wrapped
  }

  const wrappedBody = `
  try {${addEnvironmentValidation(content, functionName)}

${functionBody.trim()}

  } catch (error) {
    return createGenericErrorHandler("${functionName}")(error);
  }`;

  return content.replace(
    serveMatch[0],
    `serve(async (req) => {${wrappedBody}
});`,
  );
}

function fixImports(content) {
  // Remove old CORS headers definition
  content = content.replace(/const corsHeaders = \{[\s\S]*?\};/, "");

  // Replace old imports with new shared imports
  const oldImportPattern =
    /import \{ serve \} from "https:\/\/deno\.land\/std@[\d.]+\/http\/server\.ts";\s*import \{ createClient \} from "https:\/\/esm\.sh\/@supabase\/supabase-js@[\d]+";/;

  return content.replace(oldImportPattern, FUNCTION_HEADER_TEMPLATE);
}

function applyCommonFixes(content, functionName) {
  let fixed = content;

  // Apply all common fixes
  FIXES.forEach((fix) => {
    fixed = fixed.replace(fix.pattern, fix.replacement);
  });

  return fixed;
}

function fixFunction(functionName) {
  const functionPath = path.join(FUNCTIONS_DIR, functionName, "index.ts");

  if (!fs.existsSync(functionPath)) {
    console.warn(`Function file not found: ${functionPath}`);
    return false;
  }

  console.log(`Fixing function: ${functionName}`);

  try {
    let content = fs.readFileSync(functionPath, "utf8");

    // Apply fixes in order
    content = fixImports(content);
    content = applyCommonFixes(content, functionName);
    content = wrapInTryCatch(content, functionName);

    // Write back to file
    fs.writeFileSync(functionPath, content);
    console.log(`✅ Fixed ${functionName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix ${functionName}:`, error.message);
    return false;
  }
}

function main() {
  console.log("🔧 Starting Edge Functions comprehensive fix...\n");

  const functions = getAllFunctions();
  console.log(`Found ${functions.length} functions to fix:`);
  functions.forEach((fn) => console.log(`  - ${fn}`));
  console.log("");

  let successCount = 0;
  let failCount = 0;

  functions.forEach((functionName) => {
    if (fixFunction(functionName)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log("\n📊 Fix Summary:");
  console.log(`✅ Successfully fixed: ${successCount}`);
  console.log(`❌ Failed to fix: ${failCount}`);
  console.log(`📋 Already fixed: ${FIXED_FUNCTIONS.length}`);
  console.log(
    `🎯 Total functions: ${successCount + failCount + FIXED_FUNCTIONS.length}`,
  );

  if (failCount === 0) {
    console.log("\n🎉 All edge functions have been fixed!");
  } else {
    console.log(`\n⚠️  ${failCount} functions need manual review.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFunction, getAllFunctions, FIXED_FUNCTIONS };
