import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
import { dynamicChunkPlugin } from "vite-plugin-dynamic-chunk";
import { resolve } from "path";
import env from "./src/backend/env";

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

  // Add compression for production builds  
  if (command === "build") {
    plugins.push(
      // Dynamic chunk splitting for better optimization
      dynamicChunkPlugin({
        dependencySplitOption: {
          // Core React libraries (complement your manual chunks)
          react: ["react", "react-dom"],
          "react-router": ["react-router-dom"],
          // tRPC ecosystem
          trpc: ["@trpc/client", "@trpc/react-query"],
          // React Query
          "react-query": ["@tanstack/react-query"],
          // Utility libraries
          utils: ["superjson"],
        },
        splitDynamicImportDependency: true, // Split dynamic imports
        experimentalMinChunkSize: 1000, // Merge small chunks (1KB threshold)
      }),
      compression({
        algorithms: ["gzip", "brotliCompress"],
        threshold: 1024, // Only compress files larger than 1KB
        deleteOriginalAssets: false, // Keep original files for fallback
        skipIfLargerOrEqual: true, // Skip if compressed file is larger
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
          // Let dynamic chunk plugin handle most of the chunking
          // Keep only essential manual chunks that need specific control
          manualChunks: (id) => {
            // Vendor chunks for node_modules (fallback for dynamic plugin)
            if (id.includes('node_modules')) {
              // Let the dynamic chunk plugin handle the splitting
              return undefined;
            }
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
      // Generate source maps for production debugging (but smaller)
      sourcemap: "hidden", // Don't include source maps in final bundle
      // Optimize chunks more aggressively
      chunkSizeWarningLimit: 300, // Lower warning limit to catch large chunks
      // Additional optimizations
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
    },

    // Development server configuration
    server: {
      port: env.VITE_PORT,
      strictPort: true,
      cors: true,
      proxy: {
        // Proxy API calls to the backend server
        "/trpc": {
          target: `http://localhost:${env.PORT}`,
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
