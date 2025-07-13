// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/app/code";
var isNode = typeof process !== "undefined" && process.versions && process.versions.node;
var isDev = isNode && process.env.NODE_ENV !== "production";
var vite_config_default = defineConfig(({ command, mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy API requests to Vercel dev server or deployed API
        "/api": {
          target: isNode && process.env.VITE_API_BASE_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on("error", (err, req, res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, res) => {
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url
              );
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url
              );
            });
          }
        }
      }
    },
    plugins: [
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react",
        fastRefresh: true,
        // Ensure proper JSX runtime transformation
        babel: {
          plugins: []
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      },
      dedupe: ["react", "react-dom"]
      // Prevent multiple React instances
    },
    build: {
      // Optimize build output
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
              return "0-react-core";
            }
            if (id.includes("react-dom")) {
              return "0-react-core";
            }
            if (id.includes("react") && !id.includes("react-router") && !id.includes("@react-google-maps") && !id.includes("@tanstack/react-query")) {
              return "0-react-core";
            }
            if (id.includes("react-router")) {
              return "router";
            }
            if (id.includes("@radix-ui")) {
              return "ui-components";
            }
            if (id.includes("@supabase") || id.includes("supabase")) {
              return "supabase";
            }
            if (id.includes("@react-google-maps/api") || id.includes("google-maps") || id.includes("maps")) {
              return "google-maps";
            }
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
            if (id.includes("recharts") || id.includes("chart")) {
              return "charts";
            }
            if (id.includes("react-hook-form") || id.includes("hookform")) {
              return "forms";
            }
            if (id.includes("date-fns")) {
              return "date-utils";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("clsx") || id.includes("tailwind-merge") || id.includes("class-variance-authority")) {
              return "utils";
            }
            if (id.includes("/pages/Admin") || id.includes("/admin/")) {
              return "admin";
            }
            if (id.includes("/pages/UniversityProfile") || id.includes("/university-info/")) {
              return "university";
            }
            if (id.includes("/pages/BookListing") || id.includes("/pages/BookDetails")) {
              return "books";
            }
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          // Add hash to filenames for cache busting
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split("/").pop()?.replace(".tsx", "").replace(".ts", "") : "chunk";
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
          }
        }
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
      cssCodeSplit: true
    },
    // Optimize dependencies - prioritize React loading
    optimizeDeps: {
      include: [
        // React first - CRITICAL for createContext to work
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        // Then other React dependencies
        "react-router-dom",
        // Then other libraries
        "@supabase/supabase-js",
        "@tanstack/react-query",
        "lucide-react",
        "@react-google-maps/api"
        // Force optimization to fix temporal dead zone
      ],
      exclude: [],
      force: true,
      // Force re-bundling to ensure consistency
      // Ensure React is pre-bundled before anything else
      entries: ["src/main.tsx"],
      // Fix ESM transformation issues
      esbuildOptions: {
        target: "esnext",
        format: "esm",
        jsx: "automatic",
        jsxFactory: void 0,
        jsxFragment: void 0
      }
    },
    // Ensure React is properly available in production builds
    define: {
      // Ensure React is available globally if needed
      __REACT_DEVTOOLS_GLOBAL_HOOK__: "undefined",
      // Prevent React createContext errors in production
      "process.env.NODE_ENV": JSON.stringify(
        mode === "production" ? "production" : "development"
      ),
      // Ensure global React availability
      global: "globalThis"
    },
    // Performance optimizations
    esbuild: {
      // Drop only debugger in production, keep console.error for debugging
      drop: mode === "production" ? ["debugger"] : void 0,
      // Minimize dead code
      treeShaking: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gU2FmZSBlbnZpcm9ubWVudCBkZXRlY3Rpb25cbmNvbnN0IGlzTm9kZSA9XG4gIHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xuY29uc3QgaXNEZXYgPSBpc05vZGUgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIFByb3h5IEFQSSByZXF1ZXN0cyB0byBWZXJjZWwgZGV2IHNlcnZlciBvciBkZXBsb3llZCBBUElcbiAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICB0YXJnZXQ6XG4gICAgICAgICAgICAoaXNOb2RlICYmIHByb2Nlc3MuZW52LlZJVEVfQVBJX0JBU0VfVVJMKSB8fFxuICAgICAgICAgICAgXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVycjogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm94eSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbihcInByb3h5UmVxXCIsIChwcm94eVJlcTogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgXCJTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICByZXEubWV0aG9kLFxuICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXNcIiwgKHByb3h5UmVzOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBcIlJlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICBwcm94eVJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAganN4UnVudGltZTogXCJhdXRvbWF0aWNcIixcbiAgICAgICAganN4SW1wb3J0U291cmNlOiBcInJlYWN0XCIsXG4gICAgICAgIGZhc3RSZWZyZXNoOiB0cnVlLFxuICAgICAgICAvLyBFbnN1cmUgcHJvcGVyIEpTWCBydW50aW1lIHRyYW5zZm9ybWF0aW9uXG4gICAgICAgIGJhYmVsOiB7XG4gICAgICAgICAgcGx1Z2luczogW10sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgfSxcbiAgICAgIGRlZHVwZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sIC8vIFByZXZlbnQgbXVsdGlwbGUgUmVhY3QgaW5zdGFuY2VzXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgLy8gT3B0aW1pemUgYnVpbGQgb3V0cHV0XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczogKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIC8vIEtlZXAgUmVhY3QgYW5kIFJlYWN0LURPTSB0b2dldGhlciBhbmQgcHJpb3JpdGl6ZSB0aGVtIEZJUlNUXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0L1wiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC1kb20vXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwicmVhY3RcIikgJiZcbiAgICAgICAgICAgICAgIWlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpICYmXG4gICAgICAgICAgICAgICFpZC5pbmNsdWRlcyhcIkByZWFjdC1nb29nbGUtbWFwc1wiKSAmJlxuICAgICAgICAgICAgICAhaWQuaW5jbHVkZXMoXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCIwLXJlYWN0LWNvcmVcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUm91dGVyIChzZXBhcmF0ZSBmcm9tIGNvcmUgUmVhY3QpXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1yb3V0ZXJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwicm91dGVyXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVJIENvbXBvbmVudHMgKFJhZGl4IFVJKVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHJhZGl4LXVpXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInVpLWNvbXBvbmVudHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3VwYWJhc2VcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkBzdXBhYmFzZVwiKSB8fCBpZC5pbmNsdWRlcyhcInN1cGFiYXNlXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInN1cGFiYXNlXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1hcHMgLSBGb3JjZSBHb29nbGUgTWFwcyBBUEkgaW50byBzZXBhcmF0ZSBjaHVua1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIkByZWFjdC1nb29nbGUtbWFwcy9hcGlcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJnb29nbGUtbWFwc1wiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm1hcHNcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJnb29nbGUtbWFwc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBRdWVyeSBhbmQgZGF0YVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInF1ZXJ5XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoYXJ0cyBhbmQgdmlzdWFsaXphdGlvblxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVjaGFydHNcIikgfHwgaWQuaW5jbHVkZXMoXCJjaGFydFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJjaGFydHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9ybSBoYW5kbGluZ1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3QtaG9vay1mb3JtXCIpIHx8IGlkLmluY2x1ZGVzKFwiaG9va2Zvcm1cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiZm9ybXNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGF0ZSB1dGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImRhdGUtZm5zXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImRhdGUtdXRpbHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWNvbnNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImx1Y2lkZS1yZWFjdFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJpY29uc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVdGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbHN4XCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwidGFpbHdpbmQtbWVyZ2VcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1dGlsc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMYXJnZSBjb21wb25lbnRzIHRoYXQgc2hvdWxkIGJlIHNlcGFyYXRlIGNodW5rc1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0FkbWluXCIpIHx8IGlkLmluY2x1ZGVzKFwiL2FkbWluL1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJhZG1pblwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL1VuaXZlcnNpdHlQcm9maWxlXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3VuaXZlcnNpdHktaW5mby9cIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1bml2ZXJzaXR5XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0xpc3RpbmdcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0RldGFpbHNcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJib29rc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWZhdWx0IHZlbmRvciBjaHVuayBmb3Igb3RoZXIgbm9kZV9tb2R1bGVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBBZGQgaGFzaCB0byBmaWxlbmFtZXMgZm9yIGNhY2hlIGJ1c3RpbmdcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbzogeyBmYWNhZGVNb2R1bGVJZD86IHN0cmluZyB8IG51bGwgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFjYWRlTW9kdWxlSWQgPSBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgPyBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgICAgIC5zcGxpdChcIi9cIilcbiAgICAgICAgICAgICAgICAgIC5wb3AoKVxuICAgICAgICAgICAgICAgICAgPy5yZXBsYWNlKFwiLnRzeFwiLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoXCIudHNcIiwgXCJcIilcbiAgICAgICAgICAgICAgOiBcImNodW5rXCI7XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy8ke2ZhY2FkZU1vZHVsZUlkfS1baGFzaF0uanNgO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogeyBuYW1lPzogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBhc3NldEluZm8ubmFtZT8uc3BsaXQoXCIuXCIpLnBvcCgpO1xuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dFR5cGUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvaW1hZ2VzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC93b2ZmMj98ZW90fHR0ZnxvdGYvaS50ZXN0KGV4dFR5cGUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvZm9udHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIE9wdGltaXplIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXG4gICAgICAvLyBFbmFibGUgc291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZ1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgLy8gTWluaWZ5IGluIHByb2R1Y3Rpb25cbiAgICAgIG1pbmlmeTogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcImVzYnVpbGRcIiA6IGZhbHNlLFxuICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICB0YXJnZXQ6IFtcImVzMjAyMFwiLCBcImVkZ2U4OFwiLCBcImZpcmVmb3g3OFwiLCBcImNocm9tZTg3XCIsIFwic2FmYXJpMTMuMVwiXSxcbiAgICAgIC8vIENTUyBjb2RlIHNwbGl0dGluZ1xuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIH0sXG4gICAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzIC0gcHJpb3JpdGl6ZSBSZWFjdCBsb2FkaW5nXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC8vIFJlYWN0IGZpcnN0IC0gQ1JJVElDQUwgZm9yIGNyZWF0ZUNvbnRleHQgdG8gd29ya1xuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICAgIFwicmVhY3QtZG9tL2NsaWVudFwiLFxuICAgICAgICBcInJlYWN0L2pzeC1ydW50aW1lXCIsXG4gICAgICAgIFwicmVhY3QvanN4LWRldi1ydW50aW1lXCIsXG4gICAgICAgIC8vIFRoZW4gb3RoZXIgUmVhY3QgZGVwZW5kZW5jaWVzXG4gICAgICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgICAvLyBUaGVuIG90aGVyIGxpYnJhcmllc1xuICAgICAgICBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiLFxuICAgICAgICBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiLFxuICAgICAgICBcImx1Y2lkZS1yZWFjdFwiLFxuICAgICAgICBcIkByZWFjdC1nb29nbGUtbWFwcy9hcGlcIiwgLy8gRm9yY2Ugb3B0aW1pemF0aW9uIHRvIGZpeCB0ZW1wb3JhbCBkZWFkIHpvbmVcbiAgICAgIF0sXG4gICAgICBleGNsdWRlOiBbXSxcbiAgICAgIGZvcmNlOiB0cnVlLCAvLyBGb3JjZSByZS1idW5kbGluZyB0byBlbnN1cmUgY29uc2lzdGVuY3lcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcmUtYnVuZGxlZCBiZWZvcmUgYW55dGhpbmcgZWxzZVxuICAgICAgZW50cmllczogW1wic3JjL21haW4udHN4XCJdLFxuICAgICAgLy8gRml4IEVTTSB0cmFuc2Zvcm1hdGlvbiBpc3N1ZXNcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIHRhcmdldDogXCJlc25leHRcIixcbiAgICAgICAgZm9ybWF0OiBcImVzbVwiLFxuICAgICAgICBqc3g6IFwiYXV0b21hdGljXCIsXG4gICAgICAgIGpzeEZhY3Rvcnk6IHVuZGVmaW5lZCxcbiAgICAgICAganN4RnJhZ21lbnQ6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcm9wZXJseSBhdmFpbGFibGUgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBhdmFpbGFibGUgZ2xvYmFsbHkgaWYgbmVlZGVkXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX186IFwidW5kZWZpbmVkXCIsXG4gICAgICAvLyBQcmV2ZW50IFJlYWN0IGNyZWF0ZUNvbnRleHQgZXJyb3JzIGluIHByb2R1Y3Rpb25cbiAgICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJwcm9kdWN0aW9uXCIgOiBcImRldmVsb3BtZW50XCIsXG4gICAgICApLFxuICAgICAgLy8gRW5zdXJlIGdsb2JhbCBSZWFjdCBhdmFpbGFiaWxpdHlcbiAgICAgIGdsb2JhbDogXCJnbG9iYWxUaGlzXCIsXG4gICAgfSxcblxuICAgIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICBlc2J1aWxkOiB7XG4gICAgICAvLyBEcm9wIG9ubHkgZGVidWdnZXIgaW4gcHJvZHVjdGlvbiwga2VlcCBjb25zb2xlLmVycm9yIGZvciBkZWJ1Z2dpbmdcbiAgICAgIGRyb3A6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gW1wiZGVidWdnZXJcIl0gOiB1bmRlZmluZWQsXG4gICAgICAvLyBNaW5pbWl6ZSBkZWFkIGNvZGVcbiAgICAgIHRyZWVTaGFraW5nOiB0cnVlLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFNBQ0osT0FBTyxZQUFZLGVBQWUs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
