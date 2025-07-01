// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-vendor";
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
          if (id.includes("/pages/EnhancedUniversityProfile") || id.includes("/university-info/")) {
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
    // Enable source maps for debugging in dev
    sourcemap: mode === "development",
    // Minify in production
    minify: mode === "production" ? "esbuild" : false,
    // Target modern browsers for better performance
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari13.1"],
    // CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "lucide-react"
    ],
    exclude: [
      // Exclude heavy optional dependencies
      "@react-google-maps/api"
    ]
  },
  // Performance optimizations
  esbuild: {
    // Drop console logs and debugger statements in production
    drop: mode === "production" ? ["console", "debugger"] : []
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICAvLyBPcHRpbWl6ZSBidWlsZCBvdXRwdXRcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcbiAgICAgICAgICAvLyBSZWFjdCBhbmQgUmVhY3QtRE9NXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3RcIikgfHwgaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInJlYWN0LXZlbmRvclwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJvdXRlclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwicm91dGVyXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVUkgQ29tcG9uZW50cyAoUmFkaXggVUkpXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHJhZGl4LXVpXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ1aS1jb21wb25lbnRzXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU3VwYWJhc2VcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAc3VwYWJhc2VcIikgfHwgaWQuaW5jbHVkZXMoXCJzdXBhYmFzZVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwic3VwYWJhc2VcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBNYXBzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiZ29vZ2xlLW1hcHNcIikgfHwgaWQuaW5jbHVkZXMoXCJtYXBzXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJtYXBzXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUXVlcnkgYW5kIGRhdGFcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInF1ZXJ5XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hhcnRzIGFuZCB2aXN1YWxpemF0aW9uXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVjaGFydHNcIikgfHwgaWQuaW5jbHVkZXMoXCJjaGFydFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiY2hhcnRzXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRm9ybSBoYW5kbGluZ1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LWhvb2stZm9ybVwiKSB8fCBpZC5pbmNsdWRlcyhcImhvb2tmb3JtXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJmb3Jtc1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIERhdGUgdXRpbGl0aWVzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiZGF0ZS1mbnNcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcImRhdGUtdXRpbHNcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJY29uc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImx1Y2lkZS1yZWFjdFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiaWNvbnNcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBVdGlsaXRpZXNcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcImNsc3hcIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwidGFpbHdpbmQtbWVyZ2VcIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ1dGlsc1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExhcmdlIGNvbXBvbmVudHMgdGhhdCBzaG91bGQgYmUgc2VwYXJhdGUgY2h1bmtzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0FkbWluXCIpIHx8IGlkLmluY2x1ZGVzKFwiL2FkbWluL1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiYWRtaW5cIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi9wYWdlcy9FbmhhbmNlZFVuaXZlcnNpdHlQcm9maWxlXCIpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi91bml2ZXJzaXR5LWluZm8vXCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ1bml2ZXJzaXR5XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCIvcGFnZXMvQm9va0xpc3RpbmdcIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiL3BhZ2VzL0Jvb2tEZXRhaWxzXCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJib29rc1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIERlZmF1bHQgdmVuZG9yIGNodW5rIGZvciBvdGhlciBub2RlX21vZHVsZXNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInZlbmRvclwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gQWRkIGhhc2ggdG8gZmlsZW5hbWVzIGZvciBjYWNoZSBidXN0aW5nXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XG4gICAgICAgICAgY29uc3QgZmFjYWRlTW9kdWxlSWQgPSBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcbiAgICAgICAgICAgID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkXG4gICAgICAgICAgICAgICAgLnNwbGl0KFwiL1wiKVxuICAgICAgICAgICAgICAgIC5wb3AoKVxuICAgICAgICAgICAgICAgID8ucmVwbGFjZShcIi50c3hcIiwgXCJcIilcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcIi50c1wiLCBcIlwiKVxuICAgICAgICAgICAgOiBcImNodW5rXCI7XG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvJHtmYWNhZGVNb2R1bGVJZH0tW2hhc2hdLmpzYDtcbiAgICAgICAgfSxcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF0uanNcIixcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBleHRUeXBlID0gYXNzZXRJbmZvLm5hbWU/LnNwbGl0KFwiLlwiKS5wb3AoKTtcbiAgICAgICAgICBpZiAoL3BuZ3xqcGU/Z3xzdmd8Z2lmfHRpZmZ8Ym1wfGljby9pLnRlc3QoZXh0VHlwZSB8fCBcIlwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvaW1hZ2VzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoL3dvZmYyP3xlb3R8dHRmfG90Zi9pLnRlc3QoZXh0VHlwZSB8fCBcIlwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvZm9udHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBgYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIE9wdGltaXplIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwLFxuICAgIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nIGluIGRldlxuICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICAgIC8vIE1pbmlmeSBpbiBwcm9kdWN0aW9uXG4gICAgbWluaWZ5OiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFwiZXNidWlsZFwiIDogZmFsc2UsXG4gICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgdGFyZ2V0OiBbXCJlczIwMjBcIiwgXCJlZGdlODhcIiwgXCJmaXJlZm94NzhcIiwgXCJjaHJvbWU4N1wiLCBcInNhZmFyaTEzLjFcIl0sXG4gICAgLy8gQ1NTIGNvZGUgc3BsaXR0aW5nXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICB9LFxuICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgXCJyZWFjdFwiLFxuICAgICAgXCJyZWFjdC1kb21cIixcbiAgICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIixcbiAgICAgIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIsXG4gICAgICBcImx1Y2lkZS1yZWFjdFwiLFxuICAgIF0sXG4gICAgZXhjbHVkZTogW1xuICAgICAgLy8gRXhjbHVkZSBoZWF2eSBvcHRpb25hbCBkZXBlbmRlbmNpZXNcbiAgICAgIFwiQHJlYWN0LWdvb2dsZS1tYXBzL2FwaVwiLFxuICAgIF0sXG4gIH0sXG4gIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgZXNidWlsZDoge1xuICAgIC8vIERyb3AgY29uc29sZSBsb2dzIGFuZCBkZWJ1Z2dlciBzdGF0ZW1lbnRzIGluIHByb2R1Y3Rpb25cbiAgICBkcm9wOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFtcImNvbnNvbGVcIiwgXCJkZWJ1Z2dlclwiXSA6IFtdLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNB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
