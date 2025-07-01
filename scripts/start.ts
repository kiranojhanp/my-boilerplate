#!/usr/bin/env bun

/**
 * 🚀 Production Start Script
 * Starts the production server
 */

import env from "../src/backend/env";

console.log("🚀 Starting production server...");
console.log(`📊 Environment: ${env.NODE_ENV}`);
console.log(`🔧 Server port: ${env.PORT}`);
console.log("📂 Serving from: ./dist/main.js");

// Import and run the built server
import("../dist/main.js");
