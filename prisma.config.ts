import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local, falling back to .env
config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // The CLI uses this URL for operations like `prisma db push` and `prisma migrate dev`
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
