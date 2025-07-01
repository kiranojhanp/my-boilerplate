#!/usr/bin/env bun

/**
 * 🏗️ Production Build Script
 * Builds both frontend and backend for production
 */

import { $ } from "bun";
import env from "../src/backend/env";

const isAnalyze = process.env.ANALYZE === "true";

console.log("🏗️ Building for production...");
console.log(`📊 Environment: ${env.NODE_ENV}`);
console.log(`🔧 Backend port: ${env.PORT}`);
console.log(`⚡ Frontend port: ${env.VITE_PORT}`);
if (isAnalyze) {
  console.log("📈 Bundle analysis enabled");
}

try {
  // Build frontend with optional analysis
  if (isAnalyze) {
    console.log("📦 Building frontend with bundle analysis...");
    await $`vite build`;
    console.log("📊 Bundle analysis complete! Check dist/web/stats.html");
  } else {
    console.log("📦 Building frontend...");
    await $`vite build`;
  }

  // Build backend
  console.log("⚙️ Building backend...");
  await $`bun build src/backend/main.ts --outdir ./dist --target bun`;

  console.log("✅ Production build completed!");
  if (isAnalyze) {
    console.log("📈 Open dist/web/stats.html to view bundle analysis");
  }
  console.log("🚀 Run 'bun start' to start the production server");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
