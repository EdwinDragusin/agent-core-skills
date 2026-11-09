CREATE TABLE "tarea" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"titulo" varchar(120) NOT NULL,
	"completada" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"creado_el" timestamp DEFAULT now() NOT NULL,
	"modificado_el" timestamp,
	"eliminado_el" timestamp
);
