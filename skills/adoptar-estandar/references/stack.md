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

### Adaptacion Frontend con Vitest (Alternativa a Deno Test)
La plantilla estandar ejecuta las pruebas unitarias y de arquitectura del frontend mediante `deno test`. En proyectos donde el frontend utiliza Vite + Vitest (`vitest` en `package.json` o `vite.config.ts`):
- **Opcion recomendada:** Mantener Vitest como runner nativo de pruebas frontend y ejecutar `npx vitest run --coverage` (proveedor `@vitest/coverage-v8` o `istanbul`).
- **Medicion de cobertura y fijacion de umbral:**
  1. Medir linea base local ejecutando `npx vitest run --coverage`.
  2. Tomar el porcentaje consolidado de lineas y sentencias obtenido en la linea base (ej. `82.4%`).
  3. Fijar el umbral bloqueante en `vite.config.ts` o `vitest.config.ts`:
     ```typescript
     test: {
       coverage: {
         provider: "v8",
         thresholds: {
           lines: 82.4,
           statements: 82.4,
         },
       },
     }
     ```
  4. Integrar la ejecucion de `vitest run --coverage` en el pipeline de CI (`deno task ci` o script npm) para hacer cumplir la politica de trinquete (ratchet policy: el umbral jamas desciende).
- **Tests de arquitectura con Vitest:** Los tests de arquitectura frontend (`front-dependencias.test.ts`) pueden ejecutarse con Deno si el runtime esta instalado en el repositorio (leyendo `estandar.config.ts`), o bien traducirse a la suite de Vitest manteniendo las mismas aserciones de aislamiento entre capas FSD.

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

---

## 3. Tratamiento de Violaciones Masivas Preexistentes

Al adoptar el estandar sobre proyectos existentes o sistemas heredados (legacy), es habitual encontrar cientos de violaciones acumuladas de Clean Architecture o FSD (ej. imports relativos profundos sin alias `@dominio/`, inyeccion de dependencias dispersa fuera de la raiz de composicion, o entidades de dominio sin herencia de clase base `Entidad`/`AgregadoRaiz`).

### Protocolo de Lista Base Congelada (Allowlist con TODO)
- **Principio:** No bloquear la adopcion del estandar ni forzar una reescritura masiva de alto riesgo en una sola iteracion.
- **Mecanismo:** Registrar una lista base congelada (`ALLOWLIST`) directamente en el test de arquitectura correspondiente, documentando las rutas o identificadores tolerados:
  ```typescript
  // Lista base temporal de archivos heredados pendientes de desacoplamiento
  // TODO(arquitectura): desacoplar dependencias segun plan de refactor
  const ARCHIVOS_EXCLUIDOS_HEREDADOS = new Set([
    "src/dominio/legado/ServicioAntiguo.ts",
    "src/dominio/legado/HelperRelativo.ts",
  ]);
  ```
- **Asercion estricta contra regresiones:** El test filtra los archivos de la lista base y verifica que no aparezcan nuevas infracciones:
  ```typescript
  const violacionesNuevas = violaciones.filter(v => !ARCHIVOS_EXCLUIDOS_HEREDADOS.has(v.archivo));
  assertEquals(violacionesNuevas.length, 0, `Nuevas violaciones detectadas: ${violacionesNuevas.join(", ")}`);
  ```
- **Politica de saneamiento continuo:** Todo codigo nuevo o refactorizado debe cumplir al 100% las reglas de arquitectura. Conforme se limpien archivos heredados, se eliminan del allowlist y se reduce el conjunto tolerado (politica de trinquete de calidad arquitectonica).
