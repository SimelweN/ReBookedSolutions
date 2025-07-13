// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "@vitejs/plugin-react-swc";
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
      global: "globalThis",
      // Disable HMR in production
      __VITE_HMR__: mode !== "production"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIFNhZmUgZW52aXJvbm1lbnQgZGV0ZWN0aW9uXG5jb25zdCBpc05vZGUgPVxuICB0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZTtcbmNvbnN0IGlzRGV2ID0gaXNOb2RlICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pID0+IHtcbiAgY29uc3QgaXNQcm9kdWN0aW9uID0gbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCI7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXJ2ZXI6ICFpc1Byb2R1Y3Rpb25cbiAgICAgID8ge1xuICAgICAgICAgIGhvc3Q6IFwiOjpcIixcbiAgICAgICAgICBwb3J0OiA4MDgxLFxuICAgICAgICAgIGhtcjoge1xuICAgICAgICAgICAgcG9ydDogODA4MSxcbiAgICAgICAgICAgIGhvc3Q6IFwibG9jYWxob3N0XCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgLy8gUHJveHkgQVBJIHJlcXVlc3RzIHRvIFZlcmNlbCBkZXYgc2VydmVyIG9yIGRlcGxveWVkIEFQSVxuICAgICAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICAgICAgdGFyZ2V0OlxuICAgICAgICAgICAgICAgIChpc05vZGUgJiYgcHJvY2Vzcy5lbnYuVklURV9BUElfQkFTRV9VUkwpIHx8XG4gICAgICAgICAgICAgICAgXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcbiAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBwcm94eS5vbihcImVycm9yXCIsIChlcnI6IGFueSwgcmVxOiBhbnksIHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm94eSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXFcIiwgKHByb3h5UmVxOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBcIlNlbmRpbmcgUmVxdWVzdCB0byB0aGUgVGFyZ2V0OlwiLFxuICAgICAgICAgICAgICAgICAgICByZXEubWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICByZXEudXJsLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwcm94eS5vbihcInByb3h5UmVzXCIsIChwcm94eVJlczogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgXCJSZWNlaXZlZCBSZXNwb25zZSBmcm9tIHRoZSBUYXJnZXQ6XCIsXG4gICAgICAgICAgICAgICAgICAgIHByb3h5UmVzLnN0YXR1c0NvZGUsXG4gICAgICAgICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICA6IHVuZGVmaW5lZCxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSwgLy8gUHJldmVudCBtdWx0aXBsZSBSZWFjdCBpbnN0YW5jZXNcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAvLyBPcHRpbWl6ZSBidWlsZCBvdXRwdXRcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgLy8gS2VlcCBSZWFjdCBhbmQgUmVhY3QtRE9NIHRvZ2V0aGVyIGFuZCBwcmlvcml0aXplIHRoZW0gRklSU1RcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvcmVhY3QvXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9cIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCIwLXJlYWN0LWNvcmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LWRvbVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCIwLXJlYWN0LWNvcmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJyZWFjdFwiKSAmJlxuICAgICAgICAgICAgICAhaWQuaW5jbHVkZXMoXCJyZWFjdC1yb3V0ZXJcIikgJiZcbiAgICAgICAgICAgICAgIWlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiMC1yZWFjdC1jb3JlXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJvdXRlciAoc2VwYXJhdGUgZnJvbSBjb3JlIFJlYWN0KVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInJvdXRlclwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVSSBDb21wb25lbnRzIChSYWRpeCBVSSlcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkByYWRpeC11aVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1aS1jb21wb25lbnRzXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN1cGFiYXNlXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAc3VwYWJhc2VcIikgfHwgaWQuaW5jbHVkZXMoXCJzdXBhYmFzZVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJzdXBhYmFzZVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBRdWVyeSBhbmQgZGF0YVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcInF1ZXJ5XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoYXJ0cyBhbmQgdmlzdWFsaXphdGlvblxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVjaGFydHNcIikgfHwgaWQuaW5jbHVkZXMoXCJjaGFydFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJjaGFydHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9ybSBoYW5kbGluZ1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3QtaG9vay1mb3JtXCIpIHx8IGlkLmluY2x1ZGVzKFwiaG9va2Zvcm1cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiZm9ybXNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGF0ZSB1dGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImRhdGUtZm5zXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImRhdGUtdXRpbHNcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWNvbnNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImx1Y2lkZS1yZWFjdFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJpY29uc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVdGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbHN4XCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwidGFpbHdpbmQtbWVyZ2VcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1dGlsc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMYXJnZSBjb21wb25lbnRzIHRoYXQgc2hvdWxkIGJlIHNlcGFyYXRlIGNodW5rc1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0FkbWluXCIpIHx8IGlkLmluY2x1ZGVzKFwiL2FkbWluL1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJhZG1pblwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL1VuaXZlcnNpdHlQcm9maWxlXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3VuaXZlcnNpdHktaW5mby9cIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJ1bml2ZXJzaXR5XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0xpc3RpbmdcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0RldGFpbHNcIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJib29rc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWZhdWx0IHZlbmRvciBjaHVuayBmb3Igb3RoZXIgbm9kZV9tb2R1bGVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBBZGQgaGFzaCB0byBmaWxlbmFtZXMgZm9yIGNhY2hlIGJ1c3RpbmdcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbzogeyBmYWNhZGVNb2R1bGVJZD86IHN0cmluZyB8IG51bGwgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFjYWRlTW9kdWxlSWQgPSBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgPyBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgICAgIC5zcGxpdChcIi9cIilcbiAgICAgICAgICAgICAgICAgIC5wb3AoKVxuICAgICAgICAgICAgICAgICAgPy5yZXBsYWNlKFwiLnRzeFwiLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoXCIudHNcIiwgXCJcIilcbiAgICAgICAgICAgICAgOiBcImNodW5rXCI7XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy8ke2ZhY2FkZU1vZHVsZUlkfS1baGFzaF0uanNgO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogeyBuYW1lPzogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBhc3NldEluZm8ubmFtZT8uc3BsaXQoXCIuXCIpLnBvcCgpO1xuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dFR5cGUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvaW1hZ2VzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC93b2ZmMj98ZW90fHR0ZnxvdGYvaS50ZXN0KGV4dFR5cGUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvZm9udHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIE9wdGltaXplIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXG4gICAgICAvLyBFbmFibGUgc291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZ1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgLy8gTWluaWZ5IGluIHByb2R1Y3Rpb25cbiAgICAgIG1pbmlmeTogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcImVzYnVpbGRcIiA6IGZhbHNlLFxuICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICB0YXJnZXQ6IFtcImVzMjAyMFwiLCBcImVkZ2U4OFwiLCBcImZpcmVmb3g3OFwiLCBcImNocm9tZTg3XCIsIFwic2FmYXJpMTMuMVwiXSxcbiAgICAgIC8vIENTUyBjb2RlIHNwbGl0dGluZ1xuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIH0sXG4gICAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzIC0gcHJpb3JpdGl6ZSBSZWFjdCBsb2FkaW5nXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC8vIFJlYWN0IGZpcnN0IC0gQ1JJVElDQUwgZm9yIGNyZWF0ZUNvbnRleHQgdG8gd29ya1xuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICAgIFwicmVhY3QtZG9tL2NsaWVudFwiLFxuICAgICAgICBcInJlYWN0L2pzeC1ydW50aW1lXCIsXG4gICAgICAgIFwicmVhY3QvanN4LWRldi1ydW50aW1lXCIsXG4gICAgICAgIC8vIFRoZW4gb3RoZXIgUmVhY3QgZGVwZW5kZW5jaWVzXG4gICAgICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgICAvLyBUaGVuIG90aGVyIGxpYnJhcmllc1xuICAgICAgICBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiLFxuICAgICAgICBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiLFxuICAgICAgICBcImx1Y2lkZS1yZWFjdFwiLFxuICAgICAgXSxcbiAgICAgIGV4Y2x1ZGU6IFtdLFxuICAgICAgZm9yY2U6IHRydWUsIC8vIEZvcmNlIHJlLWJ1bmRsaW5nIHRvIGVuc3VyZSBjb25zaXN0ZW5jeVxuICAgICAgLy8gRW5zdXJlIFJlYWN0IGlzIHByZS1idW5kbGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlXG4gICAgICBlbnRyaWVzOiBbXCJzcmMvbWFpbi50c3hcIl0sXG4gICAgICAvLyBGaXggRVNNIHRyYW5zZm9ybWF0aW9uIGlzc3Vlc1xuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgICAgICBmb3JtYXQ6IFwiZXNtXCIsXG4gICAgICAgIGpzeDogXCJhdXRvbWF0aWNcIixcbiAgICAgICAganN4RmFjdG9yeTogdW5kZWZpbmVkLFxuICAgICAgICBqc3hGcmFnbWVudDogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gRW5zdXJlIFJlYWN0IGlzIHByb3Blcmx5IGF2YWlsYWJsZSBpbiBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgIGRlZmluZToge1xuICAgICAgLy8gRW5zdXJlIFJlYWN0IGlzIGF2YWlsYWJsZSBnbG9iYWxseSBpZiBuZWVkZWRcbiAgICAgIF9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfXzogXCJ1bmRlZmluZWRcIixcbiAgICAgIC8vIFByZXZlbnQgUmVhY3QgY3JlYXRlQ29udGV4dCBlcnJvcnMgaW4gcHJvZHVjdGlvblxuICAgICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcInByb2R1Y3Rpb25cIiA6IFwiZGV2ZWxvcG1lbnRcIixcbiAgICAgICksXG4gICAgICAvLyBFbnN1cmUgZ2xvYmFsIFJlYWN0IGF2YWlsYWJpbGl0eVxuICAgICAgZ2xvYmFsOiBcImdsb2JhbFRoaXNcIixcbiAgICAgIC8vIERpc2FibGUgSE1SIGluIHByb2R1Y3Rpb25cbiAgICAgIF9fVklURV9ITVJfXzogbW9kZSAhPT0gXCJwcm9kdWN0aW9uXCIsXG4gICAgfSxcblxuICAgIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICBlc2J1aWxkOiB7XG4gICAgICAvLyBEcm9wIG9ubHkgZGVidWdnZXIgaW4gcHJvZHVjdGlvbiwga2VlcCBjb25zb2xlLmVycm9yIGZvciBkZWJ1Z2dpbmdcbiAgICAgIGRyb3A6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gW1wiZGVidWdnZXJcIl0gOiB1bmRlZmluZWQsXG4gICAgICAvLyBNaW5pbWl6ZSBkZWFkIGNvZGVcbiAgICAgIHRyZWVTaGFraW5nOiB0cnVlLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFNBQ0osT0FBTyxZQUFZLGVBQWUsUUFBUSxZQUFZLFFBQVEsU0FBUztBQUN6RSxJQUFNLFFBQVEsVUFBVSxRQUFRLElBQUksYUFBYTtBQUdqRCxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLFFBQVEsQ0FBQyxlQUNMO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsT0FBTztB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
