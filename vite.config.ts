import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
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
            // React core (keep together as they're often updated together)
            react: ["react", "react-dom"],
            // React Router (large dependency, separate for better caching)
            "react-router": ["react-router-dom"],
            // tRPC client libraries
            "trpc-client": ["@trpc/client"],
            // React Query and tRPC React integration
            "react-query": ["@tanstack/react-query", "@trpc/react-query"],
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
