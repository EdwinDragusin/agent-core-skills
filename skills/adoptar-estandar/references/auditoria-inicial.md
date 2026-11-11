# Plantilla y Protocolo de Auditoria Inicial (Fase 1)

Informe obligatorio de la Fase 1. Solo lectura: prohibido crear o modificar archivos en el destino (los informes y salidas de herramientas se guardan fuera del repositorio destino).

> **RUTAS DEL PLUGIN:** `RAIZ_PLUGIN` corresponde a tres niveles arriba de este archivo (`../../../` relativo a `references/auditoria-inicial.md`).

---

## 1. Reglas del Informe

1. **Procedencia de cada cifra:** Toda cifra o afirmacion verificable lleva `[medido: <comando>]` o `[inferido]`. Prohibido presentar como resultado de una herramienta lo que se dedujo leyendo archivos.
2. **Equivalencia antes de ausencia:** Antes de declarar ausente un archivo o seccion, buscar equivalentes por nombre parecido, ruta alternativa o contenido (ej. `## Resumen Ejecutivo para la Direccion` frente a `## Resumen Ejecutivo de Negocio`). Si existe con otro nombre, el estado es `equivalente` y la accion es renombrar o mapear, no crear.
3. **Sin columnas vacias:** Prohibido `No aplica` en una celda. Si una columna no aplica a la mayoria de filas, la informacion va en su propia seccion.
4. **Una fila por archivo:** Prohibido agrupar varios mecanismos o manifiestos en una sola fila.

---

## 2. Comprobaciones Obligatorias

Cada punto se responde en el informe, aunque el resultado sea negativo:

| Punto | Como comprobarlo (solo lectura) |
|:--|:--|
| Modo y stack | `references/stack.md`, seccion 1 |
| Archivos de instrucciones de agentes | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` en cualquier nivel, `GEMINI.md`, `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md` |
| Reglas previas del proyecto | Directrices y reglas del vault, README, CONTRIBUTING y los archivos de agentes anteriores |
| Proteccion de `main` | `gh api repos/<owner>/<repo>/rulesets` y `gh api repos/<owner>/<repo>/branches/main/protection` (un 404 significa sin proteccion) |
| Esquema de base de datos | Ruta real para `back.archivoEsquema` (archivo, lista o directorio) |
| Migraciones | Ruta real para `back.directorioMigraciones` |
| Mapeo de carpetas | Carpetas reales de entidades, value objects, casos de uso, logger, generador UUID y composicion DI frente a las claves de `estandar.config.ts` |
| Topologia frontend | SPA unica o multiples SPAs, capa compartida, runner de pruebas (`references/stack.md`) |
| Estructura del vault | Seccion 5 de este informe |

---

## 3. Plantilla del Informe

```markdown
# Auditoria Inicial - <proyecto> (<fecha>, commit <sha>)

## 1. Modo y Stack
- Modo: nuevo | existente. [medido: ...]
- Stack: ... [medido: ...]
- Topologia frontend: ...

## 2. Archivos de Instrucciones y Reglas Previas
| Fuente | Regla (resumen) | Capa destino | Accion en Ola 0 (duplica / propia / contradice) |

## 3. Manifiestos AGENTS.md (Ola 0)
| Manifiesto plantilla | Ruta destino | Estado | Reglas previas a absorber |
(13 filas, una por manifiesto, mas el puntero CLAUDE.md)

## 4. Brechas por Mecanismo (Olas 1 a 5)
| Mecanismo | Ola | Estado (ausente / parcial / equivalente / presente) | Evidencia | Violaciones previas esperadas | Ajuste de estandar.config.ts propuesto |

## 5. Estructura del Vault
- Comando: `powershell -File RAIZ_PLUGIN/plantilla/scripts/doc-linter.ps1 -DocsPath <destino>/docs`
- Ruta auditada confirmada: <ruta absoluta de docs del destino>
- Totales: <comprobaciones> / <aprobadas> / <fallidas> [medido]
- Fallos literales: lista de lineas FAIL tal como las emite el linter.
- Interpretacion: por cada fallo, ausente o equivalente con otro nombre. [inferido]

## 6. Comprobaciones Obligatorias
Respuesta a cada punto de la seccion 2 de la referencia.

## 7. Pausa de Compuerta
```

---

## 4. Doc-Linter de la Plantilla

`plantilla/scripts/doc-linter.ps1` resuelve `docs/` relativo a su propia ubicacion si no recibe `-DocsPath`. Ejecutado desde el plugin sin ese parametro audita `RAIZ_PLUGIN/plantilla/docs/` y no el destino. Pasar siempre `-DocsPath <destino>/docs` y confirmar la ruta auditada en el informe.
