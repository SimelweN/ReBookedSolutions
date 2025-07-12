// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/app/code";
var isNode = typeof process !== "undefined" && process.versions && process.versions.node;
var isDev = isNode && process.env.NODE_ENV !== "production";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to Vercel dev server or deployed API
      "/api": {
        target: isNode && process.env.VITE_API_BASE_URL || "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
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
    alias: isNode ? {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Ensure consistent React imports
      react: path.resolve(__vite_injected_original_dirname, "node_modules/react"),
      "react-dom": path.resolve(__vite_injected_original_dirname, "node_modules/react-dom")
    } : {
      "@": "/src"
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
      "lucide-react"
    ],
    exclude: [
      // Exclude heavy optional dependencies
      "@react-google-maps/api"
    ],
    force: true,
    // Force re-bundling to ensure consistency
    // Ensure React is pre-bundled before anything else
    entries: ["src/main.tsx"]
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
    // Make React available globally to prevent createContext errors
    "globalThis.React": "globalThis.React || {}"
  },
  // Performance optimizations
  esbuild: {
    // Drop only console.log and debugger in production, keep console.error for debugging
    drop: mode === "production" ? ["debugger"] : [],
    // Minimize dead code
    treeShaking: true
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gU2FmZSBlbnZpcm9ubWVudCBkZXRlY3Rpb25cbmNvbnN0IGlzTm9kZSA9XG4gIHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xuY29uc3QgaXNEZXYgPSBpc05vZGUgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFByb3h5IEFQSSByZXF1ZXN0cyB0byBWZXJjZWwgZGV2IHNlcnZlciBvciBkZXBsb3llZCBBUElcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDpcbiAgICAgICAgICAoaXNOb2RlICYmIHByb2Nlc3MuZW52LlZJVEVfQVBJX0JBU0VfVVJMKSB8fCBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBvcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oXCJlcnJvclwiLCAoZXJyLCByZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm94eSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXFcIiwgKHByb3h5UmVxLCByZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDpcIiwgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oXCJwcm94eVJlc1wiLCAocHJveHlSZXMsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgXCJSZWNlaXZlZCBSZXNwb25zZSBmcm9tIHRoZSBUYXJnZXQ6XCIsXG4gICAgICAgICAgICAgIHByb3h5UmVzLnN0YXR1c0NvZGUsXG4gICAgICAgICAgICAgIHJlcS51cmwsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogaXNOb2RlXG4gICAgICA/IHtcbiAgICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgICAvLyBFbnN1cmUgY29uc2lzdGVudCBSZWFjdCBpbXBvcnRzXG4gICAgICAgICAgcmVhY3Q6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwibm9kZV9tb2R1bGVzL3JlYWN0XCIpLFxuICAgICAgICAgIFwicmVhY3QtZG9tXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwibm9kZV9tb2R1bGVzL3JlYWN0LWRvbVwiKSxcbiAgICAgICAgfVxuICAgICAgOiB7XG4gICAgICAgICAgXCJAXCI6IFwiL3NyY1wiLFxuICAgICAgICB9LFxuICAgIGRlZHVwZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sIC8vIFByZXZlbnQgbXVsdGlwbGUgUmVhY3QgaW5zdGFuY2VzXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gT3B0aW1pemUgYnVpbGQgb3V0cHV0XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XG4gICAgICAgICAgLy8gS2VlcCBSZWFjdCBhbmQgUmVhY3QtRE9NIHRvZ2V0aGVyIGFuZCBwcmlvcml0aXplIHRoZW0gRklSU1RcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC9cIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9cIilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBcIjAtcmVhY3QtY29yZVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcIjAtcmVhY3QtY29yZVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcInJlYWN0XCIpICYmXG4gICAgICAgICAgICAhaWQuaW5jbHVkZXMoXCJyZWFjdC1yb3V0ZXJcIikgJiZcbiAgICAgICAgICAgICFpZC5pbmNsdWRlcyhcIkByZWFjdC1nb29nbGUtbWFwc1wiKSAmJlxuICAgICAgICAgICAgIWlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIwLXJlYWN0LWNvcmVcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSb3V0ZXIgKHNlcGFyYXRlIGZyb20gY29yZSBSZWFjdClcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1yb3V0ZXJcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInJvdXRlclwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVJIENvbXBvbmVudHMgKFJhZGl4IFVJKVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkByYWRpeC11aVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwidWktY29tcG9uZW50c1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFN1cGFiYXNlXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHN1cGFiYXNlXCIpIHx8IGlkLmluY2x1ZGVzKFwic3VwYWJhc2VcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInN1cGFiYXNlXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTWFwc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImdvb2dsZS1tYXBzXCIpIHx8IGlkLmluY2x1ZGVzKFwibWFwc1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwibWFwc1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFF1ZXJ5IGFuZCBkYXRhXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJxdWVyeVwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoYXJ0cyBhbmQgdmlzdWFsaXphdGlvblxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlY2hhcnRzXCIpIHx8IGlkLmluY2x1ZGVzKFwiY2hhcnRcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcImNoYXJ0c1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZvcm0gaGFuZGxpbmdcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1ob29rLWZvcm1cIikgfHwgaWQuaW5jbHVkZXMoXCJob29rZm9ybVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiZm9ybXNcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEYXRlIHV0aWxpdGllc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImRhdGUtZm5zXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJkYXRlLXV0aWxzXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWNvbnNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJsdWNpZGUtcmVhY3RcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcImljb25zXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVXRpbGl0aWVzXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjbHN4XCIpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcInRhaWx3aW5kLW1lcmdlXCIpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIFwidXRpbHNcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBMYXJnZSBjb21wb25lbnRzIHRoYXQgc2hvdWxkIGJlIHNlcGFyYXRlIGNodW5rc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIi9wYWdlcy9BZG1pblwiKSB8fCBpZC5pbmNsdWRlcyhcIi9hZG1pbi9cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcImFkbWluXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvVW5pdmVyc2l0eVByb2ZpbGVcIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3VuaXZlcnNpdHktaW5mby9cIilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBcInVuaXZlcnNpdHlcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi9wYWdlcy9Cb29rTGlzdGluZ1wiKSB8fFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0RldGFpbHNcIilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBcImJvb2tzXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVmYXVsdCB2ZW5kb3IgY2h1bmsgZm9yIG90aGVyIG5vZGVfbW9kdWxlc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBBZGQgaGFzaCB0byBmaWxlbmFtZXMgZm9yIGNhY2hlIGJ1c3RpbmdcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBmYWNhZGVNb2R1bGVJZCA9IGNodW5rSW5mby5mYWNhZGVNb2R1bGVJZFxuICAgICAgICAgICAgPyBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCIvXCIpXG4gICAgICAgICAgICAgICAgLnBvcCgpXG4gICAgICAgICAgICAgICAgPy5yZXBsYWNlKFwiLnRzeFwiLCBcIlwiKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiLnRzXCIsIFwiXCIpXG4gICAgICAgICAgICA6IFwiY2h1bmtcIjtcbiAgICAgICAgICByZXR1cm4gYGFzc2V0cy8ke2ZhY2FkZU1vZHVsZUlkfS1baGFzaF0uanNgO1xuICAgICAgICB9LFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBhc3NldEluZm8ubmFtZT8uc3BsaXQoXCIuXCIpLnBvcCgpO1xuICAgICAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlIHx8IFwiXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9pbWFnZXMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgvd29mZjI/fGVvdHx0dGZ8b3RmL2kudGVzdChleHRUeXBlIHx8IFwiXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9mb250cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gT3B0aW1pemUgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0XG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmdcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgLy8gTWluaWZ5IGluIHByb2R1Y3Rpb25cbiAgICBtaW5pZnk6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJlc2J1aWxkXCIgOiBmYWxzZSxcbiAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICB0YXJnZXQ6IFtcImVzMjAyMFwiLCBcImVkZ2U4OFwiLCBcImZpcmVmb3g3OFwiLCBcImNocm9tZTg3XCIsIFwic2FmYXJpMTMuMVwiXSxcbiAgICAvLyBDU1MgY29kZSBzcGxpdHRpbmdcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gIH0sXG4gIC8vIE9wdGltaXplIGRlcGVuZGVuY2llcyAtIHByaW9yaXRpemUgUmVhY3QgbG9hZGluZ1xuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAvLyBSZWFjdCBmaXJzdCAtIENSSVRJQ0FMIGZvciBjcmVhdGVDb250ZXh0IHRvIHdvcmtcbiAgICAgIFwicmVhY3RcIixcbiAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICBcInJlYWN0LWRvbS9jbGllbnRcIixcbiAgICAgIFwicmVhY3QvanN4LXJ1bnRpbWVcIixcbiAgICAgIC8vIFRoZW4gb3RoZXIgUmVhY3QgZGVwZW5kZW5jaWVzXG4gICAgICBcInJlYWN0LXJvdXRlci1kb21cIixcbiAgICAgIC8vIFRoZW4gb3RoZXIgbGlicmFyaWVzXG4gICAgICBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiLFxuICAgICAgXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIixcbiAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgXSxcbiAgICBleGNsdWRlOiBbXG4gICAgICAvLyBFeGNsdWRlIGhlYXZ5IG9wdGlvbmFsIGRlcGVuZGVuY2llc1xuICAgICAgXCJAcmVhY3QtZ29vZ2xlLW1hcHMvYXBpXCIsXG4gICAgXSxcbiAgICBmb3JjZTogdHJ1ZSwgLy8gRm9yY2UgcmUtYnVuZGxpbmcgdG8gZW5zdXJlIGNvbnNpc3RlbmN5XG4gICAgLy8gRW5zdXJlIFJlYWN0IGlzIHByZS1idW5kbGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlXG4gICAgZW50cmllczogW1wic3JjL21haW4udHN4XCJdLFxuICB9LFxuXG4gIC8vIEVuc3VyZSBSZWFjdCBpcyBwcm9wZXJseSBhdmFpbGFibGUgaW4gcHJvZHVjdGlvbiBidWlsZHNcbiAgZGVmaW5lOiB7XG4gICAgLy8gRW5zdXJlIFJlYWN0IGlzIGF2YWlsYWJsZSBnbG9iYWxseSBpZiBuZWVkZWRcbiAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX186IFwidW5kZWZpbmVkXCIsXG4gICAgLy8gUHJldmVudCBSZWFjdCBjcmVhdGVDb250ZXh0IGVycm9ycyBpbiBwcm9kdWN0aW9uXG4gICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBKU09OLnN0cmluZ2lmeShcbiAgICAgIG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCJwcm9kdWN0aW9uXCIgOiBcImRldmVsb3BtZW50XCIsXG4gICAgKSxcbiAgICAvLyBFbnN1cmUgZ2xvYmFsIFJlYWN0IGF2YWlsYWJpbGl0eVxuICAgIGdsb2JhbDogXCJnbG9iYWxUaGlzXCIsXG4gICAgLy8gTWFrZSBSZWFjdCBhdmFpbGFibGUgZ2xvYmFsbHkgdG8gcHJldmVudCBjcmVhdGVDb250ZXh0IGVycm9yc1xuICAgIFwiZ2xvYmFsVGhpcy5SZWFjdFwiOiBcImdsb2JhbFRoaXMuUmVhY3QgfHwge31cIixcbiAgfSxcblxuICAvLyBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25zXG4gIGVzYnVpbGQ6IHtcbiAgICAvLyBEcm9wIG9ubHkgY29uc29sZS5sb2cgYW5kIGRlYnVnZ2VyIGluIHByb2R1Y3Rpb24sIGtlZXAgY29uc29sZS5lcnJvciBmb3IgZGVidWdnaW5nXG4gICAgZHJvcDogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBbXCJkZWJ1Z2dlclwiXSA6IFtdLFxuICAgIC8vIE1pbmltaXplIGRlYWQgY29kZVxuICAgIHRyZWVTaGFraW5nOiB0cnVlLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2TSxTQUFTLG9CQUFvQjtBQUMxTyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU0sU0FDSixPQUFPLFlBQVksZUFBZSxRQUFRLFlBQVksUUFBUSxTQUFTO0FBQ3pFLElBQU0sUUFBUSxVQUFVLFFBQVEsSUFBSSxhQUFhO0FBR2pELElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04s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
