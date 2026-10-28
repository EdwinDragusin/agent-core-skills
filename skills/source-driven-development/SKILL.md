---
name: source-driven-development
description: "Ancla la implementacion en documentacion oficial y tipos reales; prohibe programar APIs de memoria."
---

# Source-Driven Development — Implementacion Anclada en Fuentes Primarias

Los modelos de lenguaje tienen fechas de corte de entrenamiento y mezclan versiones antiguas de librerias (ej. React 18 vs 19, Zod 3 vs 4, Prisma 5 vs 6, Next.js Pages vs App Router). **Prohibido programar APIs de terceros de memoria.**

## 1. Protocolo de Verificacion Antes de Codificar

Antes de importar o invocar cualquier API de un framework, ORM, SDK o libreria externa:
1. **Inspecciona la Version Real Instalada:**
   - Lee `package.json`, `deno.json`, `pyproject.toml`, `Cargo.toml` o `go.mod` y sus respectivos lockfiles para conocer la version exacta en el proyecto.
2. **Verifica las Firmas Locales de Tipos (Primera Fuente):**
   - Busca en el grafo (`codebase-memory-mcp`), en las definiciones `.d.ts` instaladas o en el codigo existente del repositorio como ya se invoca esa libreria.
3. **Consulta Documentacion Oficial si No Esta en Local:**
   - Si es una API que no aparece en el codebase actual, verifica su firma oficial vigente para esa version exacta antes de escribir el test o la implementacion.

## 2. Antipatron Prohibido vs Practica Obligatoria

| Antipatron (Programar de Memoria) | Practica Source-Driven (Obligatoria) |
| :--- | :--- |
| Asumir que un metodo existe o recibe ciertos argumentos porque "asi solia ser". | Comprobar la firma exacta en los tipos del paquete o documentacion oficial de la version instalada. |
| Mezclar sintaxis deprecada (ej. `substr`, métodos legacy de ORM, configuraciones v1 en paquetes v3). | Usar exclusivamente las APIs estables vigentes en la version declarada en el manifiesto. |
| Inventar flags de CLI o parametros de configuracion en runners (`vitest`, `pytest`, `playwright`). | Verificar con `--help` o en el archivo de configuracion real del proyecto. |

## 3. Trazabilidad en Comentarios In-Code

Cuando utilices un comportamiento especifico de version, una configuracion no obvia de un framework o un workaround documentado oficialmente, cita brevemente la razon bajo el principio del "Por Que" (`code-documentation-mastery`) para que el revisor de Fase 4 (`qa-reviewer`) valide su vigencia.
