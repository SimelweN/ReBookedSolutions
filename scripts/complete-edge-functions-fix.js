#!/usr/bin/env node
/**
 * Complete Edge Functions Fix Script
 * Applies the standardized error handling pattern to all remaining functions
 */

const fs = require("fs");
const path = require("path");

const FUNCTIONS_DIR = "supabase/functions";

// List of all functions that need fixing
const FUNCTIONS_TO_FIX = [
  "analytics-reporting",
  "check-expired-orders",
  "dispute-resolution",
  "realtime-notifications",
  "send-email-notification",
  "courier-guy-shipment",
  "courier-guy-track",
  "fastway-shipment",
  "fastway-track",
];

// Import patterns to fix
const OLD_IMPORT_PATTERNS = [
  /import { serve } from "https:\/\/deno\.land\/std@0\.168\.0\/http\/server\.ts";/g,
  /import { createClient } from "https:\/\/esm\.sh\/@supabase\/supabase-js@2\.50\.0";/g,
  /import { createClient } from "https:\/\/esm\.sh\/@supabase\/supabase-js@2";/g,
];

const NEW_IMPORT_BASE = `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import { getEnvironmentConfig, validateRequiredEnvVars, createEnvironmentError } from "../_shared/environment.ts";`;

// Environment validation pattern
const ENV_VALIDATION = `
// Validate required environment variables
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = validateRequiredEnvVars(requiredVars);`;

function fixFunction(functionName) {
  const functionPath = path.join(FUNCTIONS_DIR, functionName, "index.ts");

  if (!fs.existsSync(functionPath)) {
    console.log(`⚠️  ${functionPath} not found, skipping...`);
    return false;
  }

  console.log(`🔧 Fixing ${functionName}...`);

  try {
    let content = fs.readFileSync(functionPath, "utf8");

    // Create backup
    fs.writeFileSync(`${functionPath}.backup`, content);

    // Fix imports
    content = content.replace(
      /import { serve } from "https:\/\/deno\.land\/std@0\.168\.0\/http\/server\.ts";/,
      'import { serve } from "https://deno.land/std@0.190.0/http/server.ts";',
    );

    content = content.replace(
      /import { createClient } from "https:\/\/esm\.sh\/@supabase\/supabase-js@2\.50\.0";/,
      'import { createClient } from "https://esm.sh/@supabase/supabase-js@2";',
    );

    // Add new imports if not already present
    if (!content.includes("createErrorResponse")) {
      content = content.replace(
        /import { corsHeaders } from "\.\.\/\_shared\/cors\.ts";/,
        'import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";',
      );
    }

    if (!content.includes("getEnvironmentConfig")) {
      const importIndex = content.indexOf("import { corsHeaders");
      if (importIndex !== -1) {
        const endOfImports = content.indexOf("\n", importIndex) + 1;
        content =
          content.slice(0, endOfImports) +
          'import { getEnvironmentConfig, validateRequiredEnvVars, createEnvironmentError } from "../_shared/environment.ts";\n' +
          content.slice(endOfImports);
      }
    }

    // Add environment validation if not present
    if (!content.includes("validateRequiredEnvVars")) {
      const serveIndex = content.indexOf("serve(async (req)");
      if (serveIndex !== -1) {
        content =
          content.slice(0, serveIndex) +
          ENV_VALIDATION +
          "\n\n" +
          content.slice(serveIndex);
      }
    }

    // Fix old environment variable usage
    content = content.replace(
      /Deno\.env\.get\("SUPABASE_URL"\)!/g,
      "config.supabaseUrl",
    );
    content = content.replace(
      /Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)!/g,
      "config.supabaseServiceKey",
    );

    // Fix CORS headers definition if inline
    content = content.replace(/const corsHeaders = \{[\s\S]*?\};/, "");

    fs.writeFileSync(functionPath, content);
    console.log(`✅ Fixed ${functionName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error fixing ${functionName}:`, error.message);
    return false;
  }
}

function main() {
  console.log("🚀 Starting comprehensive Edge Functions fix...\n");

  let fixedCount = 0;
  let errorCount = 0;

  for (const functionName of FUNCTIONS_TO_FIX) {
    if (fixFunction(functionName)) {
      fixedCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`\n📊 Fix Summary:`);
  console.log(`✅ Successfully fixed: ${fixedCount} functions`);
  console.log(`❌ Errors: ${errorCount} functions`);
  console.log(`\n🎉 Edge Functions fix completed!`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. Review the changes`);
  console.log(`2. Deploy functions: supabase functions deploy`);
  console.log(`3. Test each function individually`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFunction, FUNCTIONS_TO_FIX };
