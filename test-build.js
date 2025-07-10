// Simple test to check if our new university fix file can be imported
try {
  // Try to import the new file
  const {
    UFH_FACULTIES,
  } = require("./src/constants/universities/missing-universities-fix.ts");
  console.log("✅ Import successful");
  console.log("UFH faculties count:", UFH_FACULTIES?.length || 0);
} catch (error) {
  console.error("❌ Import failed:", error.message);
  process.exit(1);
}
