import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";
import { logger } from "@/server/shared/utils/logger";

// Create SQLite database connection
const sqlite = new Database("todo.db", { create: true });

// Enable WAL mode for better performance
sqlite.exec("PRAGMA journal_mode = WAL;");

// Create Drizzle database instance
export const db = drizzle(sqlite, { schema });

// Initialize database with migrations
export async function initializeDatabase() {
  try {
    logger.info("Initializing database...");

    // Run migrations
    await migrate(db, { migrationsFolder: "./drizzle" });

    logger.info("Database initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    throw error;
  }
}

// Export database instance and close function
export { sqlite };

// Graceful shutdown
export function closeDatabase() {
  try {
    sqlite.close();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error closing database:", error);
  }
}
