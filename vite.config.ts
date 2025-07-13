import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Safe environment detection
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;
const isDev = isNode && process.env.NODE_ENV !== "production";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy API requests to Vercel dev server or deployed API
        "/api": {
          target:
            (isNode && process.env.VITE_API_BASE_URL) ||
            "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          configure: (proxy: any, options: any) => {
            proxy.on("error", (err: any, req: any, res: any) => {
              // eslint-disable-next-line no-console
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq: any, req: any, res: any) => {
              // eslint-disable-next-line no-console
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url,
              );
            });
            proxy.on("proxyRes", (proxyRes: any, req: any, res: any) => {
              // eslint-disable-next-line no-console
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
              );
            });
          },
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"], // Prevent multiple React instances
    },
    build: {
      // Optimize build output
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Keep React and React-DOM together and prioritize them FIRST
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/")
            ) {
              return "0-react-core";
            }
            if (id.includes("react-dom")) {
              return "0-react-core";
            }
            if (
              id.includes("react") &&
              !id.includes("react-router") &&
              !id.includes("@react-google-maps") &&
              !id.includes("@tanstack/react-query")
            ) {
              return "0-react-core";
            }

            // Router (separate from core React)
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
              id.includes("/pages/UniversityProfile") ||
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
          chunkFileNames: (chunkInfo: { facadeModuleId?: string | null }) => {
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
          assetFileNames: (assetInfo: { name?: string }) => {
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
      // Enable source maps for debugging
      sourcemap: true,
      // Minify in production
      minify: mode === "production" ? "esbuild" : false,
      // Target modern browsers for better performance
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari13.1"],
      // CSS code splitting
      cssCodeSplit: true,
    },
    // Optimize dependencies - prioritize React loading
    optimizeDeps: {
      include: [
        // React first - CRITICAL for createContext to work
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        // Then other React dependencies
        "react-router-dom",
        // Then other libraries
        "@supabase/supabase-js",
        "@tanstack/react-query",
        "lucide-react",
        "@react-google-maps/api", // Force optimization to fix temporal dead zone
      ],
      exclude: [],
      force: true, // Force re-bundling to ensure consistency
      // Ensure React is pre-bundled before anything else
      entries: ["src/main.tsx"],
      // Fix ESM transformation issues
      esbuildOptions: {
        target: "esnext",
        format: "esm",
      },
    },

    // Ensure React is properly available in production builds
    define: {
      // Ensure React is available globally if needed
      __REACT_DEVTOOLS_GLOBAL_HOOK__: "undefined",
      // Prevent React createContext errors in production
      "process.env.NODE_ENV": JSON.stringify(
        mode === "production" ? "production" : "development",
      ),
      // Ensure global React availability
      global: "globalThis",
    },

    // Performance optimizations
    esbuild: {
      // Drop only debugger in production, keep console.error for debugging
      drop: mode === "production" ? ["debugger"] : undefined,
      // Minimize dead code
      treeShaking: true,
    },
  };
});
