import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infraestructura/persistencia/esquema.ts",
  out: "./src/infraestructura/persistencia/migraciones",
  dialect: "postgresql",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL") ??
      "postgres://postgres:postgres@localhost:5432/app_db",
  },
});
