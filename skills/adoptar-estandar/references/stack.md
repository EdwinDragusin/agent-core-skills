# Matriz de Stack y Catalogo de Mecanismos Agnosticos

Este documento define la estrategia para detectar el stack tecnologico del proyecto adoptante y clasifica que componentes de la plantilla se aplican de forma directa y cuales requieren adaptacion o seleccion selectiva.

> **RUTAS DEL PLUGIN:** `RAIZ_PLUGIN` corresponde a tres niveles arriba de este archivo (`../../../` relativo a `references/stack.md`, raiz del plugin instalador). Toda plantilla y script vive en `RAIZ_PLUGIN/`.

---

## 1. Deteccion del Stack Tecnologico

Durante la Fase 1 (Auditoria de Solo Lectura), el adoptante evalua los archivos raiz y descriptores de dependencias del repositorio:

| Archivo / Indicador | Tecnologia Detectada | Clasificacion |
|---|---|---|
| `deno.json` o `deno.jsonc` | Deno 2.x | Runtime soportado directamente |
| `src/infraestructura/persistencia/esquema.ts` con Drizzle | Drizzle ORM + PostgreSQL | Persistencia soportada directamente |
| `front/vite.config.ts`, `package.json` con React | React + Vite (FSD single-SPA o multi-SPA) | Frontend soportado directamente |
| `package.json` con Node/Bun, `pyproject.toml`, `Cargo.toml`, `go.mod` | Stack Heterogeneo | Modo agnostico universal |

### Modos de Operacion
- **Modo Homogeneo (Deno + Hono + Drizzle + React FSD):**
  Aplica el 100% de los archivos de `RAIZ_PLUGIN/plantilla/` (backend Clean Architecture, frontend FSD con configuracion centralizada de topologia en `estandar.config.ts` soportando una sola SPA o multiples SPAs con capa shared opcional, tests Deno y linters).
- **Modo Heterogeneo / Stack Alternativo:**
  Emite advertencia en la Fase 1. Se restringe la adopcion a los mecanismos agnosticos universales, absteniendose de transferir tests de capas acoplados al runtime de Deno a menos que se traduzcan al runner nativo del proyecto.

---

## 2. Catalogo de Mecanismos Agnosticos Universales

Los siguientes mecanismos no dependen del lenguaje de programacion ni del framework del proyecto destino, y deben transferirse obligatoriamente en cualquier adopcion:

### 1. Convenciones de Commits y Hooks Locales
- **Mecanismos:** `RAIZ_PLUGIN/plantilla/.githooks/commit-msg`, `RAIZ_PLUGIN/plantilla/scripts/hooks/validar-commit.ts`.
- **Estandar:** Conventional Commits en espanol, minusculas, sin acentos ortograficos, cero emojis y bloqueo de lineas de atribucion ajenas (`Co-Authored-By`, `Generated with`).
- **Adaptacion:** Requiere runtime Deno o Node para ejecutar el validador en el hook de Git local.

### 2. Validacion de Nombres de Ramas
- **Mecanismos:** `RAIZ_PLUGIN/plantilla/.githooks/pre-push`, `RAIZ_PLUGIN/plantilla/scripts/hooks/validar-rama.ts`.
- **Estandar:** Nomenclatura obligatoria `<tipo>/<descripcion-kebab-case>` con tipos autorizados (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `schema`, `perf`, `ci`, `build`). Bloqueo de git push directo a `main` y prohibicion de `--force`.

### 3. Higiene Absoluta y Anti-Emojis
- **Mecanismos:** `RAIZ_PLUGIN/plantilla/scripts/higiene/sin-emojis.test.ts`.
- **Estandar:** Prohibicion estricta de emojis en todo el repositorio (codigo fuente, comentarios, documentacion, variables y mensajes).

### 4. Blindaje de Rama Principal y Politica de PRs
- **Mecanismos:** `RAIZ_PLUGIN/scripts/protect-main-branch.ps1`, `RAIZ_PLUGIN/plantilla/.github/pull_request_template.md`.
- **Estandar:** La rama `main` solo recibe integraciones via Pull Request verificado. Prohibicion absoluta de merge directo o auto-merge por agentes de IA.
- **Procedimiento:** Ejecutar con cwd en la raiz del proyecto destino. Primero simular con `-DryRun` y, solo con aprobacion explicita del usuario, aplicar la configuracion:
  ```powershell
  # Paso 1: Simulacion obligatoria
  pwsh RAIZ_PLUGIN/scripts/protect-main-branch.ps1 [-Repo <owner/name>] -Checks <nombres de los jobs de CI separados por punto y coma> -DryRun

  # Paso 2: Aplicacion definitiva tras aprobacion humana
  pwsh RAIZ_PLUGIN/scripts/protect-main-branch.ps1 [-Repo <owner/name>] -Checks <nombres de los jobs de CI separados por punto y coma>
  ```
  Los checks requeridos deben corresponder a los nombres reales de los jobs del `ci.yml` adoptado (propiedad `name:` de cada job).

### 5. Gobernanza Documental y Gestion de Decisiones
- **Mecanismos:** Estructura `docs/`, `docs/adr/`, formato Michael Nygard para Architecture Decision Records, y `RAIZ_PLUGIN/plantilla/scripts/lint-docs.ts`.
- **Estandar:** Trazabilidad inmutable de decisiones tecnicas, separacion entre estandar institucional y logica de proyecto via marcas `[ESTANDAR]` y `[PROYECTO]`.

### 6. Politica de Cobertura No Degradable (Ratchet Policy)
- **Mecanismos:** Configuracion de status checks y medicion de umbrales minimos.
- **Estandar:** La cobertura del repositorio jamas desciende tras la integracion de una rama; el piso medido en la linea base se consolida como umbral bloqueante en CI.
