import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const plugins = [
    react(),
    tsconfigPaths(), // This will use the paths from tsconfig.json
  ];

  // Only add bundle analyzer in analyze mode
  if (process.env.ANALYZE === "true") {
    plugins.push(
      visualizer({
        filename: "dist/web/stats.html",
        open: true, // Auto-open in analyze mode
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // Better visualization
      })
    );
  }

  return {
    plugins,

    // Entry point for the app
    root: "src/frontend",

    // Public directory for static assets
    publicDir: "public",

    // Build configuration
    build: {
      outDir: "../../dist/web",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/frontend/index.html"),
        },
        output: {
          // Manual chunk splitting for better caching and loading
          manualChunks: {
            // Vendor chunk for external dependencies
            vendor: ["react", "react-dom"],
            // tRPC and query related
            trpc: [
              "@trpc/client",
              "@trpc/react-query",
              "@tanstack/react-query",
            ],
            // Router related
            router: ["react-router-dom"],
            // Utility libraries
            utils: ["superjson"],
          },
          // Optimize chunk file names
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split(".") ?? [];
            const extType = info[info.length - 1] ?? "";
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name].[hash][extname]`;
            }
            if (/css/i.test(extType)) {
              return `assets/css/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },
        },
        // Tree shaking optimization
        treeshake: {
          preset: "recommended",
          moduleSideEffects: false,
        },
      },
      // Generate source maps for production debugging
      sourcemap: true,
      // Optimize chunks
      chunkSizeWarningLimit: 500, // Reduced from 1000
      // Additional optimizations
      minify: "terser",
    },

    // Development server configuration
    server: {
      port: parseInt(process.env.VITE_PORT || "5173"),
      strictPort: true,
      cors: true,
      proxy: {
        // Proxy API calls to the backend server
        "/trpc": {
          target: `http://localhost:${process.env.PORT || 3000}`,
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
  };
});
