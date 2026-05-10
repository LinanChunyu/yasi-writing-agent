import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client";
import path from "path";

migrate(db, { migrationsFolder: path.join(process.cwd(), "src/db/migrations") });
console.log("Migrations applied.");
