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
            if (id.includes("react") && !id.includes("react-router") && !id.includes("@tanstack/react-query")) {
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
        "lucide-react"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gU2FmZSBlbnZpcm9ubWVudCBkZXRlY3Rpb25cbmNvbnN0IGlzTm9kZSA9XG4gIHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xuY29uc3QgaXNEZXYgPSBpc05vZGUgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIFByb3h5IEFQSSByZXF1ZXN0cyB0byBWZXJjZWwgZGV2IHNlcnZlciBvciBkZXBsb3llZCBBUElcbiAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICB0YXJnZXQ6XG4gICAgICAgICAgICAoaXNOb2RlICYmIHByb2Nlc3MuZW52LlZJVEVfQVBJX0JBU0VfVVJMKSB8fFxuICAgICAgICAgICAgXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVycjogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm94eSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbihcInByb3h5UmVxXCIsIChwcm94eVJlcTogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgXCJTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICByZXEubWV0aG9kLFxuICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXNcIiwgKHByb3h5UmVzOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBcIlJlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICBwcm94eVJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAganN4UnVudGltZTogXCJhdXRvbWF0aWNcIixcbiAgICAgICAganN4SW1wb3J0U291cmNlOiBcInJlYWN0XCIsXG4gICAgICAgIGZhc3RSZWZyZXNoOiB0cnVlLFxuICAgICAgICAvLyBFbnN1cmUgcHJvcGVyIEpTWCBydW50aW1lIHRyYW5zZm9ybWF0aW9uXG4gICAgICAgIGJhYmVsOiB7XG4gICAgICAgICAgcGx1Z2luczogW10sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgfSxcbiAgICAgIGRlZHVwZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sIC8vIFByZXZlbnQgbXVsdGlwbGUgUmVhY3QgaW5zdGFuY2VzXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgLy8gT3B0aW1pemUgYnVpbGQgb3V0cHV0XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczogKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIC8vIEtlZXAgUmVhY3QgYW5kIFJlYWN0LURPTSB0b2dldGhlciBhbmQgcHJpb3JpdGl6ZSB0aGVtIEZJUlNUXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0L1wiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC1kb20vXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwicmVhY3RcIikgJiZcbiAgICAgICAgICAgICAgIWlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpICYmXG4gICAgICAgICAgICAgICFpZC5pbmNsdWRlcyhcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjAtcmVhY3QtY29yZVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSb3V0ZXIgKHNlcGFyYXRlIGZyb20gY29yZSBSZWFjdClcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJyb3V0ZXJcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVUkgQ29tcG9uZW50cyAoUmFkaXggVUkpXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAcmFkaXgtdWlcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidWktY29tcG9uZW50c1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdXBhYmFzZVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHN1cGFiYXNlXCIpIHx8IGlkLmluY2x1ZGVzKFwic3VwYWJhc2VcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwic3VwYWJhc2VcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUXVlcnkgYW5kIGRhdGFcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJxdWVyeVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGFydHMgYW5kIHZpc3VhbGl6YXRpb25cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlY2hhcnRzXCIpIHx8IGlkLmluY2x1ZGVzKFwiY2hhcnRcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiY2hhcnRzXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvcm0gaGFuZGxpbmdcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LWhvb2stZm9ybVwiKSB8fCBpZC5pbmNsdWRlcyhcImhvb2tmb3JtXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImZvcm1zXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERhdGUgdXRpbGl0aWVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJkYXRlLWZuc1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJkYXRlLXV0aWxzXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEljb25zXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJsdWNpZGUtcmVhY3RcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiaWNvbnNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXRpbGl0aWVzXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiY2xzeFwiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcInRhaWx3aW5kLW1lcmdlXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidXRpbHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGFyZ2UgY29tcG9uZW50cyB0aGF0IHNob3VsZCBiZSBzZXBhcmF0ZSBjaHVua3NcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIi9wYWdlcy9BZG1pblwiKSB8fCBpZC5pbmNsdWRlcyhcIi9hZG1pbi9cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiYWRtaW5cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi9wYWdlcy9Vbml2ZXJzaXR5UHJvZmlsZVwiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi91bml2ZXJzaXR5LWluZm8vXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidW5pdmVyc2l0eVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0Jvb2tMaXN0aW5nXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0Jvb2tEZXRhaWxzXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiYm9va3NcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmYXVsdCB2ZW5kb3IgY2h1bmsgZm9yIG90aGVyIG5vZGVfbW9kdWxlc1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInZlbmRvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gQWRkIGhhc2ggdG8gZmlsZW5hbWVzIGZvciBjYWNoZSBidXN0aW5nXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm86IHsgZmFjYWRlTW9kdWxlSWQ/OiBzdHJpbmcgfCBudWxsIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhY2FkZU1vZHVsZUlkID0gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkXG4gICAgICAgICAgICAgID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkXG4gICAgICAgICAgICAgICAgICAuc3BsaXQoXCIvXCIpXG4gICAgICAgICAgICAgICAgICAucG9wKClcbiAgICAgICAgICAgICAgICAgID8ucmVwbGFjZShcIi50c3hcIiwgXCJcIilcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiLnRzXCIsIFwiXCIpXG4gICAgICAgICAgICAgIDogXCJjaHVua1wiO1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvJHtmYWNhZGVNb2R1bGVJZH0tW2hhc2hdLmpzYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm86IHsgbmFtZT86IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHRUeXBlID0gYXNzZXRJbmZvLm5hbWU/LnNwbGl0KFwiLlwiKS5wb3AoKTtcbiAgICAgICAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlIHx8IFwiXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvd29mZjI/fGVvdHx0dGZ8b3RmL2kudGVzdChleHRUeXBlIHx8IFwiXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ZvbnRzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBPcHRpbWl6ZSBjaHVuayBzaXplIHdhcm5pbmcgbGltaXRcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwLFxuICAgICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmdcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgIC8vIE1pbmlmeSBpbiBwcm9kdWN0aW9uXG4gICAgICBtaW5pZnk6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJlc2J1aWxkXCIgOiBmYWxzZSxcbiAgICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgdGFyZ2V0OiBbXCJlczIwMjBcIiwgXCJlZGdlODhcIiwgXCJmaXJlZm94NzhcIiwgXCJjaHJvbWU4N1wiLCBcInNhZmFyaTEzLjFcIl0sXG4gICAgICAvLyBDU1MgY29kZSBzcGxpdHRpbmdcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICB9LFxuICAgIC8vIE9wdGltaXplIGRlcGVuZGVuY2llcyAtIHByaW9yaXRpemUgUmVhY3QgbG9hZGluZ1xuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1xuICAgICAgICAvLyBSZWFjdCBmaXJzdCAtIENSSVRJQ0FMIGZvciBjcmVhdGVDb250ZXh0IHRvIHdvcmtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgICBcInJlYWN0LWRvbS9jbGllbnRcIixcbiAgICAgICAgXCJyZWFjdC9qc3gtcnVudGltZVwiLFxuICAgICAgICBcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiLFxuICAgICAgICAvLyBUaGVuIG90aGVyIFJlYWN0IGRlcGVuZGVuY2llc1xuICAgICAgICBcInJlYWN0LXJvdXRlci1kb21cIixcbiAgICAgICAgLy8gVGhlbiBvdGhlciBsaWJyYXJpZXNcbiAgICAgICAgXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIixcbiAgICAgICAgXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIixcbiAgICAgICAgXCJsdWNpZGUtcmVhY3RcIixcbiAgICAgIF0sXG4gICAgICBleGNsdWRlOiBbXSxcbiAgICAgIGZvcmNlOiB0cnVlLCAvLyBGb3JjZSByZS1idW5kbGluZyB0byBlbnN1cmUgY29uc2lzdGVuY3lcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcmUtYnVuZGxlZCBiZWZvcmUgYW55dGhpbmcgZWxzZVxuICAgICAgZW50cmllczogW1wic3JjL21haW4udHN4XCJdLFxuICAgICAgLy8gRml4IEVTTSB0cmFuc2Zvcm1hdGlvbiBpc3N1ZXNcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIHRhcmdldDogXCJlc25leHRcIixcbiAgICAgICAgZm9ybWF0OiBcImVzbVwiLFxuICAgICAgICBqc3g6IFwiYXV0b21hdGljXCIsXG4gICAgICAgIGpzeEZhY3Rvcnk6IHVuZGVmaW5lZCxcbiAgICAgICAganN4RnJhZ21lbnQ6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcm9wZXJseSBhdmFpbGFibGUgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBhdmFpbGFibGUgZ2xvYmFsbHkgaWYgbmVlZGVkXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX186IFwidW5kZWZpbmVkXCIsXG4gICAgICAvLyBQcmV2ZW50IFJlYWN0IGNyZWF0ZUNvbnRleHQgZXJyb3JzIGluIHByb2R1Y3Rpb25cbiAgICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJwcm9kdWN0aW9uXCIgOiBcImRldmVsb3BtZW50XCIsXG4gICAgICApLFxuICAgICAgLy8gRW5zdXJlIGdsb2JhbCBSZWFjdCBhdmFpbGFiaWxpdHlcbiAgICAgIGdsb2JhbDogXCJnbG9iYWxUaGlzXCIsXG4gICAgfSxcblxuICAgIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICBlc2J1aWxkOiB7XG4gICAgICAvLyBEcm9wIG9ubHkgZGVidWdnZXIgaW4gcHJvZHVjdGlvbiwga2VlcCBjb25zb2xlLmVycm9yIGZvciBkZWJ1Z2dpbmdcbiAgICAgIGRyb3A6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gW1wiZGVidWdnZXJcIl0gOiB1bmRlZmluZWQsXG4gICAgICAvLyBNaW5pbWl6ZSBkZWFkIGNvZGVcbiAgICAgIHRyZWVTaGFraW5nOiB0cnVlLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFNBQ0osT0FBTyxZQUFZLGVBQWUsUUFBUSxZQUFZLFFBQVEsU0FBUztBQUN6RSxJQUFNLFFBQVEsVUFBVSxRQUFRLElBQUksYUFBYTtBQUdqRCxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQTtBQUFBLFFBRUwsUUFBUTtBQUFBLFVBQ04sUUFDRyxVQUFVLFFBQVEsSUFBSSxxQkFDdkI7QUFBQSxVQUNGLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFdBQVcsQ0FBQyxPQUFZLFlBQWlCO0FBQ3ZDLGtCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQVUsS0FBVSxRQUFhO0FBRWxELHNCQUFRLElBQUksZUFBZSxHQUFHO0FBQUEsWUFDaEMsQ0FBQztBQUNELGtCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQWUsS0FBVSxRQUFhO0FBRTFELHNCQUFRO0FBQUEsZ0JB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QUFFLEVBQ25CLFFBQVEsT0FBTyxFQUFFLElBQ3BCO0FBQ0osbUJBQU8sVUFBVSxjQUFjO0FBQUEsVUFDakM7QUFBQSxVQUNBLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQixDQUFDLGNBQWlDO0FBQ2hELGtCQUFNLFVBQVUsVUFBVSxNQUFNLE1BQU0sR0FBRyxFQUFFLElBQUk7QUFDL0MsZ0JBQUksa0NBQWtDLEtBQUssV0FBVyxFQUFFLEdBQUc7QUFDekQscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksc0JBQXNCLEtBQUssV0FBVyxFQUFFLEdBQUc7QUFDN0MscUJBQU87QUFBQSxZQUNUO0FBQ0EsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsdUJBQXVCO0FBQUE7QUFBQSxNQUV2QixXQUFXO0FBQUE7QUFBQSxNQUVYLFFBQVEsU0FBUyxlQUFlLFlBQVk7QUFBQTtBQUFBLE1BRTVDLFFBQVEsQ0FBQyxVQUFVLFVBQVUsYUFBYSxZQUFZLFlBQVk7QUFBQTtBQUFBLE1BRWxFLGNBQWM7QUFBQSxJQUNoQjtBQUFBO0FBQUEsSUFFQSxjQUFjO0FBQUEsTUFDWixTQUFTO0FBQUE7QUFBQSxRQUVQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFFQTtBQUFBO0FBQUEsUUFFQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUyxDQUFDO0FBQUEsTUFDVixPQUFPO0FBQUE7QUFBQTtBQUFBLE1BRVAsU0FBUyxDQUFDLGNBQWM7QUFBQTtBQUFBLE1BRXhCLGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsS0FBSztBQUFBLFFBQ0wsWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLE1BQ2Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLFFBQVE7QUFBQTtBQUFBLE1BRU4sZ0NBQWdDO0FBQUE7QUFBQSxNQUVoQyx3QkFBd0IsS0FBSztBQUFBLFFBQzNCLFNBQVMsZUFBZSxlQUFlO0FBQUEsTUFDekM7QUFBQTtBQUFBLE1BRUEsUUFBUTtBQUFBLElBQ1Y7QUFBQTtBQUFBLElBR0EsU0FBUztBQUFBO0FBQUEsTUFFUCxNQUFNLFNBQVMsZUFBZSxDQUFDLFVBQVUsSUFBSTtBQUFBO0FBQUEsTUFFN0MsYUFBYTtBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
