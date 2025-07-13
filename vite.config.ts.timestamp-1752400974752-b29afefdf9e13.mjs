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
    plugins: [react()],
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
            if (id.includes("google-maps") || id.includes("maps")) {
              return "maps";
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
        format: "esm"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gU2FmZSBlbnZpcm9ubWVudCBkZXRlY3Rpb25cbmNvbnN0IGlzTm9kZSA9XG4gIHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xuY29uc3QgaXNEZXYgPSBpc05vZGUgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIFByb3h5IEFQSSByZXF1ZXN0cyB0byBWZXJjZWwgZGV2IHNlcnZlciBvciBkZXBsb3llZCBBUElcbiAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICB0YXJnZXQ6XG4gICAgICAgICAgICAoaXNOb2RlICYmIHByb2Nlc3MuZW52LlZJVEVfQVBJX0JBU0VfVVJMKSB8fFxuICAgICAgICAgICAgXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVycjogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm94eSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbihcInByb3h5UmVxXCIsIChwcm94eVJlcTogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgXCJTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICByZXEubWV0aG9kLFxuICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXNcIiwgKHByb3h5UmVzOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBcIlJlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDpcIixcbiAgICAgICAgICAgICAgICBwcm94eVJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgICBkZWR1cGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLCAvLyBQcmV2ZW50IG11bHRpcGxlIFJlYWN0IGluc3RhbmNlc1xuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIC8vIE9wdGltaXplIGJ1aWxkIG91dHB1dFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAvLyBLZWVwIFJlYWN0IGFuZCBSZWFjdC1ET00gdG9nZXRoZXIgYW5kIHByaW9yaXRpemUgdGhlbSBGSVJTVFxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC9cIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvcmVhY3QtZG9tL1wiKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjAtcmVhY3QtY29yZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3QtZG9tXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjAtcmVhY3QtY29yZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcInJlYWN0XCIpICYmXG4gICAgICAgICAgICAgICFpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSAmJlxuICAgICAgICAgICAgICAhaWQuaW5jbHVkZXMoXCJAcmVhY3QtZ29vZ2xlLW1hcHNcIikgJiZcbiAgICAgICAgICAgICAgIWlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJvdXRlciAoc2VwYXJhdGUgZnJvbSBjb3JlIFJlYWN0KVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInJvdXRlclwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVSSBDb21wb25lbnRzIChSYWRpeCBVSSlcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkByYWRpeC11aVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1aS1jb21wb25lbnRzXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN1cGFiYXNlXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAc3VwYWJhc2VcIikgfHwgaWQuaW5jbHVkZXMoXCJzdXBhYmFzZVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJzdXBhYmFzZVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYXBzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJnb29nbGUtbWFwc1wiKSB8fCBpZC5pbmNsdWRlcyhcIm1hcHNcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwibWFwc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBRdWVyeSBhbmQgZGF0YVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInF1ZXJ5XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoYXJ0cyBhbmQgdmlzdWFsaXphdGlvblxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVjaGFydHNcIikgfHwgaWQuaW5jbHVkZXMoXCJjaGFydFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJjaGFydHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9ybSBoYW5kbGluZ1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3QtaG9vay1mb3JtXCIpIHx8IGlkLmluY2x1ZGVzKFwiaG9va2Zvcm1cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiZm9ybXNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGF0ZSB1dGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImRhdGUtZm5zXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImRhdGUtdXRpbHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWNvbnNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImx1Y2lkZS1yZWFjdFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJpY29uc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVdGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbHN4XCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwidGFpbHdpbmQtbWVyZ2VcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1dGlsc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMYXJnZSBjb21wb25lbnRzIHRoYXQgc2hvdWxkIGJlIHNlcGFyYXRlIGNodW5rc1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0FkbWluXCIpIHx8IGlkLmluY2x1ZGVzKFwiL2FkbWluL1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJhZG1pblwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL1VuaXZlcnNpdHlQcm9maWxlXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3VuaXZlcnNpdHktaW5mby9cIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1bml2ZXJzaXR5XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0xpc3RpbmdcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0RldGFpbHNcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJib29rc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWZhdWx0IHZlbmRvciBjaHVuayBmb3Igb3RoZXIgbm9kZV9tb2R1bGVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBBZGQgaGFzaCB0byBmaWxlbmFtZXMgZm9yIGNhY2hlIGJ1c3RpbmdcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbzogeyBmYWNhZGVNb2R1bGVJZD86IHN0cmluZyB8IG51bGwgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFjYWRlTW9kdWxlSWQgPSBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgPyBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgICAgIC5zcGxpdChcIi9cIilcbiAgICAgICAgICAgICAgICAgIC5wb3AoKVxuICAgICAgICAgICAgICAgICAgPy5yZXBsYWNlKFwiLnRzeFwiLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoXCIudHNcIiwgXCJcIilcbiAgICAgICAgICAgICAgOiBcImNodW5rXCI7XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy8ke2ZhY2FkZU1vZHVsZUlkfS1baGFzaF0uanNgO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogeyBuYW1lPzogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBhc3NldEluZm8ubmFtZT8uc3BsaXQoXCIuXCIpLnBvcCgpO1xuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dFR5cGUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvaW1hZ2VzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC93b2ZmMj98ZW90fHR0ZnxvdGYvaS50ZXN0KGV4dFR5cGUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvZm9udHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIE9wdGltaXplIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXG4gICAgICAvLyBFbmFibGUgc291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZ1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgLy8gTWluaWZ5IGluIHByb2R1Y3Rpb25cbiAgICAgIG1pbmlmeTogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcImVzYnVpbGRcIiA6IGZhbHNlLFxuICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICB0YXJnZXQ6IFtcImVzMjAyMFwiLCBcImVkZ2U4OFwiLCBcImZpcmVmb3g3OFwiLCBcImNocm9tZTg3XCIsIFwic2FmYXJpMTMuMVwiXSxcbiAgICAgIC8vIENTUyBjb2RlIHNwbGl0dGluZ1xuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIH0sXG4gICAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzIC0gcHJpb3JpdGl6ZSBSZWFjdCBsb2FkaW5nXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC8vIFJlYWN0IGZpcnN0IC0gQ1JJVElDQUwgZm9yIGNyZWF0ZUNvbnRleHQgdG8gd29ya1xuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICAgIFwicmVhY3QtZG9tL2NsaWVudFwiLFxuICAgICAgICBcInJlYWN0L2pzeC1ydW50aW1lXCIsXG4gICAgICAgIC8vIFRoZW4gb3RoZXIgUmVhY3QgZGVwZW5kZW5jaWVzXG4gICAgICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgICAvLyBUaGVuIG90aGVyIGxpYnJhcmllc1xuICAgICAgICBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiLFxuICAgICAgICBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiLFxuICAgICAgICBcImx1Y2lkZS1yZWFjdFwiLFxuICAgICAgICBcIkByZWFjdC1nb29nbGUtbWFwcy9hcGlcIiwgLy8gRm9yY2Ugb3B0aW1pemF0aW9uIHRvIGZpeCB0ZW1wb3JhbCBkZWFkIHpvbmVcbiAgICAgIF0sXG4gICAgICBleGNsdWRlOiBbXSxcbiAgICAgIGZvcmNlOiB0cnVlLCAvLyBGb3JjZSByZS1idW5kbGluZyB0byBlbnN1cmUgY29uc2lzdGVuY3lcbiAgICAgIC8vIEVuc3VyZSBSZWFjdCBpcyBwcmUtYnVuZGxlZCBiZWZvcmUgYW55dGhpbmcgZWxzZVxuICAgICAgZW50cmllczogW1wic3JjL21haW4udHN4XCJdLFxuICAgICAgLy8gRml4IEVTTSB0cmFuc2Zvcm1hdGlvbiBpc3N1ZXNcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIHRhcmdldDogXCJlc25leHRcIixcbiAgICAgICAgZm9ybWF0OiBcImVzbVwiLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gRW5zdXJlIFJlYWN0IGlzIHByb3Blcmx5IGF2YWlsYWJsZSBpbiBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgIGRlZmluZToge1xuICAgICAgLy8gRW5zdXJlIFJlYWN0IGlzIGF2YWlsYWJsZSBnbG9iYWxseSBpZiBuZWVkZWRcbiAgICAgIF9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfXzogXCJ1bmRlZmluZWRcIixcbiAgICAgIC8vIFByZXZlbnQgUmVhY3QgY3JlYXRlQ29udGV4dCBlcnJvcnMgaW4gcHJvZHVjdGlvblxuICAgICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcInByb2R1Y3Rpb25cIiA6IFwiZGV2ZWxvcG1lbnRcIixcbiAgICAgICksXG4gICAgICAvLyBFbnN1cmUgZ2xvYmFsIFJlYWN0IGF2YWlsYWJpbGl0eVxuICAgICAgZ2xvYmFsOiBcImdsb2JhbFRoaXNcIixcbiAgICB9LFxuXG4gICAgLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uc1xuICAgIGVzYnVpbGQ6IHtcbiAgICAgIC8vIERyb3Agb25seSBkZWJ1Z2dlciBpbiBwcm9kdWN0aW9uLCBrZWVwIGNvbnNvbGUuZXJyb3IgZm9yIGRlYnVnZ2luZ1xuICAgICAgZHJvcDogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBbXCJkZWJ1Z2dlclwiXSA6IHVuZGVmaW5lZCxcbiAgICAgIC8vIE1pbmltaXplIGRlYWQgY29kZVxuICAgICAgdHJlZVNoYWtpbmc6IHRydWUsXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2TSxTQUFTLG9CQUFvQjtBQUMxTyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU0sU0FDSixPQUFPLFlBQVksZUFBZSxRQUFRLFlBQVksUUFBUSxTQUFTO0FBQ3pFLElBQU0sUUFBUSxVQUFVLFFBQVEsSUFBSSxhQUFhO0FBR2pELElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFDakQsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUEsUUFFTCxRQUFRO0FBQUEsVUFDTixRQUNHLFVBQVUsUUFBUSxJQUFJLHFCQUN2QjtBQUFBLFVBQ0YsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFVBQ1IsV0FBVyxDQUFDLE9BQVksWUFBaUI7QUFDdkMsa0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBVSxLQUFVLFFBQWE7QUFFbEQsc0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxZQUNoQyxDQUFDO0FBQ0Qsa0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBZSxLQUFVLFFBQWE7QUFFMUQsc0JBQVE7QUFBQSxnQkFDTjtBQUFBLGdCQUNBLElBQUk7QUFBQSxnQkFDSixJQUFJO0FBQUEsY0FDTjtBQUFBLFlBQ0YsQ0FBQztBQUNELGtCQUFNLEdBQUcsWUFB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
