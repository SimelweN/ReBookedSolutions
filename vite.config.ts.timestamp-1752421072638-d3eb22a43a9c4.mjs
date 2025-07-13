// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/app/code";
var isNode = typeof process !== "undefined" && process.versions && process.versions.node;
var isDev = isNode && process.env.NODE_ENV !== "production";
var vite_config_default = defineConfig(({ command, mode }) => {
  const isProduction = mode === "production";
  return {
    server: !isProduction ? {
      host: "::",
      port: 8081,
      hmr: {
        port: 8081,
        host: "localhost"
      },
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
    } : void 0,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gU2FmZSBlbnZpcm9ubWVudCBkZXRlY3Rpb25cbmNvbnN0IGlzTm9kZSA9XG4gIHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xuY29uc3QgaXNEZXYgPSBpc05vZGUgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcblxuICByZXR1cm4ge1xuICAgIHNlcnZlcjogIWlzUHJvZHVjdGlvblxuICAgICAgPyB7XG4gICAgICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgICAgIHBvcnQ6IDgwODEsXG4gICAgICAgICAgaG1yOiB7XG4gICAgICAgICAgICBwb3J0OiA4MDgxLFxuICAgICAgICAgICAgaG9zdDogXCJsb2NhbGhvc3RcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAvLyBQcm94eSBBUEkgcmVxdWVzdHMgdG8gVmVyY2VsIGRldiBzZXJ2ZXIgb3IgZGVwbG95ZWQgQVBJXG4gICAgICAgICAgICBcIi9hcGlcIjoge1xuICAgICAgICAgICAgICB0YXJnZXQ6XG4gICAgICAgICAgICAgICAgKGlzTm9kZSAmJiBwcm9jZXNzLmVudi5WSVRFX0FQSV9CQVNFX1VSTCkgfHxcbiAgICAgICAgICAgICAgICBcImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MFwiLFxuICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVycjogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInByb3h5IGVycm9yXCIsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcHJveHkub24oXCJwcm94eVJlcVwiLCAocHJveHlSZXE6IGFueSwgcmVxOiBhbnksIHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgICAgIFwiU2VuZGluZyBSZXF1ZXN0IHRvIHRoZSBUYXJnZXQ6XCIsXG4gICAgICAgICAgICAgICAgICAgIHJlcS5tZXRob2QsXG4gICAgICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXNcIiwgKHByb3h5UmVzOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBcIlJlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICAgICAgcHJveHlSZXMuc3RhdHVzQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgcmVxLnVybCxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIDogdW5kZWZpbmVkLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAganN4UnVudGltZTogXCJhdXRvbWF0aWNcIixcbiAgICAgICAganN4SW1wb3J0U291cmNlOiBcInJlYWN0XCIsXG4gICAgICAgIGZhc3RSZWZyZXNoOiB0cnVlLFxuICAgICAgICAvLyBFbnN1cmUgcHJvcGVyIEpTWCBydW50aW1lIHRyYW5zZm9ybWF0aW9uXG4gICAgICAgIGJhYmVsOiB7XG4gICAgICAgICAgcGx1Z2luczogW10sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgfSxcbiAgICAgIGRlZHVwZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sIC8vIFByZXZlbnQgbXVsdGlwbGUgUmVhY3QgaW5zdGFuY2VzXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgLy8gT3B0aW1pemUgYnVpbGQgb3V0cHV0XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczogKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIC8vIEtlZXAgUmVhY3QgYW5kIFJlYWN0LURPTSB0b2dldGhlciBhbmQgcHJpb3JpdGl6ZSB0aGVtIEZJUlNUXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0L1wiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC1kb20vXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwicmVhY3RcIikgJiZcbiAgICAgICAgICAgICAgIWlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpICYmXG4gICAgICAgICAgICAgICFpZC5pbmNsdWRlcyhcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjAtcmVhY3QtY29yZVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSb3V0ZXIgKHNlcGFyYXRlIGZyb20gY29yZSBSZWFjdClcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJyb3V0ZXJcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVUkgQ29tcG9uZW50cyAoUmFkaXggVUkpXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAcmFkaXgtdWlcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidWktY29tcG9uZW50c1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdXBhYmFzZVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHN1cGFiYXNlXCIpIHx8IGlkLmluY2x1ZGVzKFwic3VwYWJhc2VcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwic3VwYWJhc2VcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUXVlcnkgYW5kIGRhdGFcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJxdWVyeVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGFydHMgYW5kIHZpc3VhbGl6YXRpb25cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlY2hhcnRzXCIpIHx8IGlkLmluY2x1ZGVzKFwiY2hhcnRcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiY2hhcnRzXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvcm0gaGFuZGxpbmdcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LWhvb2stZm9ybVwiKSB8fCBpZC5pbmNsdWRlcyhcImhvb2tmb3JtXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImZvcm1zXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERhdGUgdXRpbGl0aWVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJkYXRlLWZuc1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJkYXRlLXV0aWxzXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEljb25zXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJsdWNpZGUtcmVhY3RcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiaWNvbnNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXRpbGl0aWVzXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiY2xzeFwiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcInRhaWx3aW5kLW1lcmdlXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidXRpbHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGFyZ2UgY29tcG9uZW50cyB0aGF0IHNob3VsZCBiZSBzZXBhcmF0ZSBjaHVua3NcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIi9wYWdlcy9BZG1pblwiKSB8fCBpZC5pbmNsdWRlcyhcIi9hZG1pbi9cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiYWRtaW5cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi9wYWdlcy9Vbml2ZXJzaXR5UHJvZmlsZVwiKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi91bml2ZXJzaXR5LWluZm8vXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidW5pdmVyc2l0eVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0Jvb2tMaXN0aW5nXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0Jvb2tEZXRhaWxzXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiYm9va3NcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmYXVsdCB2ZW5kb3IgY2h1bmsgZm9yIG90aGVyIG5vZGVfbW9kdWxlc1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInZlbmRvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gQWRkIGhhc2ggdG8gZmlsZW5hbWVzIGZvciBjYWNoZSBidXN0aW5nXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm86IHsgZmFjYWRlTW9kdWxlSWQ/OiBzdHJpbmcgfCBudWxsIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhY2FkZU1vZHVsZUlkID0gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkXG4gICAgICAgICAgICAgID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkXG4gICAgICAgICAgICAgICAgICAuc3BsaXQoXCIvXCIpXG4gICAgICAgICAgICAgICAgICAucG9wKClcbiAgICAgICAgICAgICAgICAgID8ucmVwbGFjZShcIi50c3hcIiwgXCJcIilcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiLnRzXCIsIFwiXCIpXG4gICAgICAgICAgICAgIDogXCJjaHVua1wiO1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvJHtmYWNhZGVNb2R1bGVJZH0tW2hhc2hdLmpzYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm86IHsgbmFtZT86IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHRUeXBlID0gYXNzZXRJbmZvLm5hbWU/LnNwbGl0KFwiLlwiKS5wb3AoKTtcbiAgICAgICAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlIHx8IFwiXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvd29mZjI/fGVvdHx0dGZ8b3RmL2kudGVzdChleHRUeXBlIHx8IFwiXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ZvbnRzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBPcHRpbWl6ZSBjaHVuayBzaXplIHdhcm5pbmcgbGltaXRcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwLFxuICAgICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmdcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgIC8vIE1pbmlmeSBpbiBwcm9kdWN0aW9uXG4gICAgICBtaW5pZnk6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJlc2J1aWxkXCIgOiBmYWxzZSxcbiAgICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgICAgdGFyZ2V0OiBbXCJlczIwMjBcIiwgXCJlZGdlODhcIiwgXCJmaXJlZm94NzhcIiwgXCJjaHJvbWU4N1wiLCBcInNhZmFyaTEzLjFcIl0sXG4gICAgICAvLyBDU1MgY29kZSBzcGxpdHRpbmdcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICB9LFxuICAgIC8vIE9wdGltaXplIGRlcGVuZGVuY2llcyAtIHByaW9yaXRpemUgUmVhY3QgbG9hZGluZ1xuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1xuICAgICAgICAvLyBSZWFjdCBmaXJzdCAtIENSSVRJQ0FMIGZvciBjcmVhdGVDb250ZXh0IHRvIHdvcmtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgICBcInJlYWN0LWRvbS9jbGllbnRcIixcbiAgICAgICAgXCJyZWFjdC9qc3gtcnVudGltZVwiLFxuICAgICAgICBcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiLFxuICAgICAgICAvLyBUaGVuIG90aGVyIFJlYWN0IGRlcGVuZGVuY2llc1xuICAgICAgICBcInJlYWN0LXJvdXRlci1kb21cIixcbiAgICAgICAgLy8gVGhlbiBvdGhlciBsaWJyYXJpZXNcbiAgICAgICAgXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIixcbiAgICAgICAgXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIixcbiAgICAgICAgXCJsdWNpZGUtcmVhY3RcIixcbiAgICAgIF0sXG4gICAgICBleGNsdWRlOiBbXSxcbiAgICAgIGZvcmNlOiB0cnVlLCAvLyBGb3JjZSByZS1idW5kbGluZyB0byBlbnN1cmUgY29uc2lzdGVuY3lcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcmUtYnVuZGxlZCBiZWZvcmUgYW55dGhpbmcgZWxzZVxuICAgICAgZW50cmllczogW1wic3JjL21haW4udHN4XCJdLFxuICAgICAgLy8gRml4IEVTTSB0cmFuc2Zvcm1hdGlvbiBpc3N1ZXNcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIHRhcmdldDogXCJlc25leHRcIixcbiAgICAgICAgZm9ybWF0OiBcImVzbVwiLFxuICAgICAgICBqc3g6IFwiYXV0b21hdGljXCIsXG4gICAgICAgIGpzeEZhY3Rvcnk6IHVuZGVmaW5lZCxcbiAgICAgICAganN4RnJhZ21lbnQ6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcm9wZXJseSBhdmFpbGFibGUgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBhdmFpbGFibGUgZ2xvYmFsbHkgaWYgbmVlZGVkXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX186IFwidW5kZWZpbmVkXCIsXG4gICAgICAvLyBQcmV2ZW50IFJlYWN0IGNyZWF0ZUNvbnRleHQgZXJyb3JzIGluIHByb2R1Y3Rpb25cbiAgICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJwcm9kdWN0aW9uXCIgOiBcImRldmVsb3BtZW50XCIsXG4gICAgICApLFxuICAgICAgLy8gRW5zdXJlIGdsb2JhbCBSZWFjdCBhdmFpbGFiaWxpdHlcbiAgICAgIGdsb2JhbDogXCJnbG9iYWxUaGlzXCIsXG4gICAgfSxcblxuICAgIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICBlc2J1aWxkOiB7XG4gICAgICAvLyBEcm9wIG9ubHkgZGVidWdnZXIgaW4gcHJvZHVjdGlvbiwga2VlcCBjb25zb2xlLmVycm9yIGZvciBkZWJ1Z2dpbmdcbiAgICAgIGRyb3A6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gW1wiZGVidWdnZXJcIl0gOiB1bmRlZmluZWQsXG4gICAgICAvLyBNaW5pbWl6ZSBkZWFkIGNvZGVcbiAgICAgIHRyZWVTaGFraW5nOiB0cnVlLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFNBQ0osT0FBTyxZQUFZLGVBQWUsUUFBUSxZQUFZLFFBQVEsU0FBUztBQUN6RSxJQUFNLFFBQVEsVUFBVSxRQUFRLElBQUksYUFBYTtBQUdqRCxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0s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
