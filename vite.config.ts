import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and React-DOM
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-vendor";
          }

          // Router
          if (id.includes("react-router")) {
            return "router";
          }

          // UI Components (Radix UI)
          if (id.includes("@radix-ui")) {
            return "ui-components";
          }

          // Supabase
          if (id.includes("@supabase") || id.includes("supabase")) {
            return "supabase";
          }

          // Maps
          if (id.includes("google-maps") || id.includes("maps")) {
            return "maps";
          }

          // Query and data
          if (id.includes("@tanstack/react-query")) {
            return "query";
          }

          // Charts and visualization
          if (id.includes("recharts") || id.includes("chart")) {
            return "charts";
          }

          // Form handling
          if (id.includes("react-hook-form") || id.includes("hookform")) {
            return "forms";
          }

          // Date utilities
          if (id.includes("date-fns")) {
            return "date-utils";
          }

          // Icons
          if (id.includes("lucide-react")) {
            return "icons";
          }

          // Utilities
          if (
            id.includes("clsx") ||
            id.includes("tailwind-merge") ||
            id.includes("class-variance-authority")
          ) {
            return "utils";
          }

          // Large components that should be separate chunks
          if (id.includes("/pages/Admin") || id.includes("/admin/")) {
            return "admin";
          }

          if (
            id.includes("/pages/EnhancedUniversityProfile") ||
            id.includes("/university-info/")
          ) {
            return "university";
          }

          if (
            id.includes("/pages/BookListing") ||
            id.includes("/pages/BookDetails")
          ) {
            return "books";
          }

          // Default vendor chunk for other node_modules
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        // Add hash to filenames for cache busting
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                ?.replace(".tsx", "")
                .replace(".ts", "")
            : "chunk";
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || "")) {
            return `assets/images/[name]-[hash].[ext]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType || "")) {
            return `assets/fonts/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
      },
    },
    // Optimize chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging in dev
    sourcemap: mode === "development",
    // Minify in production
    minify: mode === "production" ? "esbuild" : false,
    // Target modern browsers for better performance
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari13.1"],
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "lucide-react",
    ],
    exclude: [
      // Exclude heavy optional dependencies
      "@react-google-maps/api",
    ],
  },
  // Performance optimizations
  esbuild: {
    // Drop console logs and debugger statements in production
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
