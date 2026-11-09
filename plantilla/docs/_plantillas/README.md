---
tipo: plantilla
uso: "Indice de plantillas Templater del vault"
tags:
  - plantilla
---

# Plantillas Templater

Esta carpeta centraliza las plantillas para los tipos de nota recurrentes del vault. Se creo como complemento del patron que ya existia en `auditorias/PLANTILLA-revision-DS.md` (esa plantilla se deja donde esta, es de uso puntual por copia manual).

## Plantillas disponibles

| Plantilla | Para crear | Carpeta destino | Convencion de nombre de archivo |
|---|---|---|---|
| `PLANTILLA-ADR.md` | Decisiones de arquitectura | `adr/` | `ADR-0NN-slug-en-minusculas.md` |
| `PLANTILLA-CU.md` | Casos de uso | `guia/referencia/casos-de-uso/` | `CU-0NN-slug-en-minusculas.md` |
| `PLANTILLA-PB.md` | Procesos de negocio | `arquitectura/procesos/` | `PB-00N-slug-en-minusculas.md` |
| `PLANTILLA-RN.md` | Reglas de negocio | `arquitectura/reglas/` | `RN-X0N-slug-en-minusculas.md` (X = A/E/I/S segun categoria) |
| `PLANTILLA-DS-CU.md` | Diagramas de secuencia | `arquitectura/diagramas-secuencia/` | `DS-CU-0NN-slug-en-minusculas.md` (mismo NNN que el CU) |
| `PLANTILLA-Actor.md` | Fichas de actor | `arquitectura/actores/` | `nombre-actor-en-minusculas.md` |

## Como usar (requiere el plugin Templater instalado y activo)

1. Crea el archivo vacio **ya con el nombre final** en la carpeta destino (siguiendo la convencion de la tabla). Las plantillas leen el ID desde el nombre del archivo - si el archivo no sigue la convencion, la plantilla generara un ID incorrecto.
2. Ejecuta el comando `Templater: Insertar plantilla` (o el atajo que configures) y elige la plantilla correspondiente.
3. Completa los campos vacios y los prompts que te pida Templater (actor, modulo, complejidad, etc.).

## Con QuickAdd (paso 2 de la integracion)

Configura un "Capture Choice" por cada fila de la tabla: prompta el nombre de archivo con la convencion ya aplicada, crea la nota en la carpeta destino y aplica la plantilla correspondiente en un solo paso. Ver el plan de integracion para el detalle.
