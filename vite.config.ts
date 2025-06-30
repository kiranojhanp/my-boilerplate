import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // This will use the paths from tsconfig.json
  ],

  // Entry point for the app
  root: "src/web",

  // Public directory for static assets
  publicDir: "public",

  // Build configuration
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/web/index.html"),
      },
    },
    // Generate source maps for production debugging
    sourcemap: true,
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      // Proxy API calls to the backend server
      "/trpc": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying for tRPC subscriptions
      },
    },
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/web": resolve(__dirname, "src/web"),
      "@/server": resolve(__dirname, "src/server"),
    },
  },
});
