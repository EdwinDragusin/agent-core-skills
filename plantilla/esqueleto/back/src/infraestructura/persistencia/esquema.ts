import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const tarea = pgTable("tarea", {
  uuid: uuid("uuid").primaryKey().notNull(),
  titulo: varchar("titulo", { length: 120 }).notNull(),
  completada: boolean("completada").notNull().default(false),
  version: integer("version").notNull().default(1),
  creadoEl: timestamp("creado_el").notNull().defaultNow(),
  modificadoEl: timestamp("modificado_el"),
  eliminadoEl: timestamp("eliminado_el"),
});
