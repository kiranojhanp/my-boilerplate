#!/usr/bin/env bun

/**
 * 🏗️ Production Build Script
 * Builds both frontend and backend for production
 */

import { $ } from "bun";

console.log("🏗️ Building for production...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);

try {
  // Build frontend
  console.log("📦 Building frontend...");
  await $`vite build`;

  // Build backend
  console.log("⚙️ Building backend...");
  await $`bun build src/backend/main.ts --outdir ./dist --target bun`;

  console.log("✅ Production build completed!");
  console.log("🚀 Run 'bun start' to start the production server");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
