# Plantilla y Protocolo de Auditoria Inicial (Fase 1)

Informe obligatorio de la Fase 1. Solo lectura: prohibido crear o modificar archivos en el destino, incluidos los ignorados por git (los informes y salidas de herramientas se guardan fuera del repositorio destino).

**Comandos permitidos:** lectura y busqueda (`git`, `grep`, listados), consultas `gh api` y el doc-linter de la plantilla con `-DocsPath`. Prohibido ejecutar en el destino tests, builds, instaladores, formateadores o tareas `deno task`: escriben artefactos (`deno.lock`, `node_modules/`, `coverage/`). Si una medicion exige ejecutar Deno, usar `--no-lock` y ningun directorio de salida dentro del destino; si no es posible, registrar la cifra como `inferido`.

**Huella de solo lectura:** Ejecutar `git status --short --ignored` al empezar y al terminar. Ambas salidas van en el informe y deben ser identicas; si difieren, la Fase 1 no se da por cerrada hasta revertir lo creado y declararlo.

> **RUTAS DEL PLUGIN:** `RAIZ_PLUGIN` corresponde a tres niveles arriba de este archivo (`../../../` relativo a `references/auditoria-inicial.md`).

---

## 1. Reglas del Informe

1. **Procedencia de cada cifra:** Toda tabla del informe lleva una columna `Procedencia` obligatoria en cada fila, con el valor `medido: <comando exacto>` o `inferido`. Fuera de las tablas, toda cifra o afirmacion verificable lleva `[medido: <comando>]` o `[inferido]`. Una cifra sin comando que la reproduzca es `inferido`. Prohibido presentar como resultado de una herramienta lo que se dedujo leyendo archivos.
2. **Equivalencia antes de ausencia:** Antes de declarar ausente un archivo o seccion, buscar equivalentes por nombre parecido, ruta alternativa o contenido (ej. `## Resumen Ejecutivo para la Direccion` frente a `## Resumen Ejecutivo de Negocio`). Si existe con otro nombre, el estado es `equivalente` y la accion es renombrar o mapear, no crear.
3. **Sin celdas vacias:** Prohibido `No aplica`, `N/A`, `-`, celda vacia o cualquier equivalente. Si no hay dato, escribir el resultado concreto (ej. `0 violaciones`) con su procedencia. Si una columna no aplica a la mayoria de filas, la informacion va en su propia seccion.
4. **Una fila por archivo:** Prohibido agrupar varios mecanismos o manifiestos en una sola fila.

---

## 2. Comprobaciones Obligatorias

Cada punto se responde en el informe, aunque el resultado sea negativo:

| Punto | Como comprobarlo (solo lectura) |
|:--|:--|
| Modo y stack | `references/stack.md`, seccion 1 |
| Archivos de instrucciones de agentes | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` en cualquier nivel, `GEMINI.md`, `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md` |
| Reglas previas del proyecto | Directrices y reglas del vault, README, CONTRIBUTING y los archivos de agentes anteriores |
| Proteccion de `main` | `gh api repos/<owner>/<repo>/rulesets` y `gh api repos/<owner>/<repo>/branches/main/protection`. Un 404 significa sin proteccion; un 403 por plan significa que la proteccion no esta disponible, lo que bloquea el blindaje de la Fase 4 y debe anticiparse |
| Esquema de base de datos | Ruta real para `back.archivoEsquema` (archivo, lista o directorio). Contrastar ademas las rutas que declaran los archivos de config del ORM y las tareas (ej. `drizzle.config.ts`, `deno.json`) con las que existen; cada ruta declarada inexistente es un hallazgo |
| Migraciones | Ruta real para `back.directorioMigraciones`, con el mismo contraste de rutas declaradas frente a existentes |
| Huella de solo lectura | `git status --short --ignored` al inicio y al final (seccion 7 del informe) |
| Mapeo de carpetas | Carpetas reales de entidades, value objects, casos de uso, logger, generador UUID y composicion DI frente a las claves de `estandar.config.ts` |
| Topologia frontend | SPA unica o multiples SPAs, capa compartida, runner de pruebas (`references/stack.md`) |
| Estructura del vault | Seccion 5 de este informe |

---

## 3. Plantilla del Informe

```markdown
# Auditoria Inicial - <proyecto> (<fecha>, commit <sha>)

## 0. Huella Inicial
- `git status --short --ignored` al empezar: <salida literal>

## 1. Modo y Stack
- Modo: nuevo | existente. [medido: ...]
- Stack: ... [medido: ...]
- Topologia frontend: ... [medido: ...]

## 2. Archivos de Instrucciones y Reglas Previas
| Fuente | Regla (resumen) | Capa destino | Accion en Ola 0 (duplica / propia / contradice) | Procedencia |

## 3. Manifiestos AGENTS.md (Ola 0)
| Manifiesto plantilla | Ruta destino | Estado | Reglas previas a absorber | Procedencia |
(13 filas, una por manifiesto, mas el puntero CLAUDE.md)

## 4. Brechas por Mecanismo (Olas 1 a 5)
| Mecanismo | Ola | Estado (ausente / parcial / equivalente / presente) | Evidencia | Violaciones previas esperadas | Ajuste de estandar.config.ts propuesto | Procedencia |

## 5. Estructura del Vault
- Comando: `powershell -File RAIZ_PLUGIN/plantilla/scripts/doc-linter.ps1 -DocsPath <destino>/docs`
- Ruta auditada confirmada: <ruta absoluta de docs del destino>
- Totales: <comprobaciones> / <aprobadas> / <fallidas> [medido]
- Fallos literales: lista de lineas FAIL tal como las emite el linter.
- Interpretacion: por cada fallo, ausente o equivalente con otro nombre. [inferido]

## 6. Comprobaciones Obligatorias
| Punto | Resultado | Procedencia |
(una fila por punto de la seccion 2 de la referencia)

## 7. Huella Final y Pausa de Compuerta
- `git status --short --ignored` al terminar: <salida literal>
- Identica a la huella inicial: si | no (si es no, listar lo creado y como se revirtio)
```

---

## 4. Doc-Linter de la Plantilla

`plantilla/scripts/doc-linter.ps1` resuelve `docs/` relativo a su propia ubicacion si no recibe `-DocsPath`. Ejecutado desde el plugin sin ese parametro audita `RAIZ_PLUGIN/plantilla/docs/` y no el destino. Pasar siempre `-DocsPath <destino>/docs` y confirmar la ruta auditada en el informe.
