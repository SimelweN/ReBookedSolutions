// Ultra-minimal entry point with ZERO dependencies
// This file must work in any environment without any imports

console.log("ReBooked Solutions - Minimal entry point loaded");

// Export a simple function for Workers compatibility
export default function minimal() {
  return "ReBooked Solutions - Minimal Build";
}
