#!/usr/bin/env bun

/**
 * 🚀 Production Start Script
 * Starts the production server
 */

console.log("🚀 Starting production server...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
console.log("📂 Serving from: ./dist/main.js");

// Import and run the built server
import("../dist/main.js");
