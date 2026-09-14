# Anatomía Semántica del Historial de Commits

### A. Gramática Estricta: Conventional Commits
```text
<tipo>[ámbito opcional]: <descripción imperativa en minúsculas>

[cuerpo detallado opcional explicando motivaciones y mecanismos]

[pies de página opcionales para metadatos, referencias y cambios destructivos]
```

### B. Tipos de Commit y Correlación con Versionado Semántico (SemVer)

| Tipo | Semántica del Cambio | Salto en SemVer |
| :--- | :--- | :--- |
| `feat` | Introduce una nueva funcionalidad a la base de código. | **MINOR** (ej. 1.2.0 -> 1.3.0) |
| `fix` | Parchea un defecto o error de lógica existente. | **PATCH** (ej. 1.2.1 -> 1.2.2) |
| `refactor` | Reestructuración de código que no altera el comportamiento externo ni corrige bugs. | Sin incremento de versión externa |
| `docs` | Cambios exclusivos en documentación (Markdown, comentarios JSDoc). | Sin incremento de versión externa |
| `style` | Formato, espacios en blanco, comillas, punto y coma (sin cambios en lógica). | Sin incremento de versión externa |
| `test` | Añadir, corregir o refactorizar suites de pruebas (unitarias, integración). | Sin incremento de versión externa |
| `chore` | Mantenimiento de dependencias, scripts de build, configuración de linter/CI. | Sin incremento de versión externa |
| `schema` | Modificación de esquemas de base de datos o migraciones (Drizzle/ORM). | Sin incremento (o según impacto) |
| **`BREAKING CHANGE`** o sufijo `!` (ej. `feat(api)!:`) | Cambio incompatible hacia atrás en la API pública. Declarado en el pie de página o tras el tipo. | **MAJOR** (ej. 1.0.0 -> 2.0.0) |

### C. Reglas de Redacción del Commit
1. **Verbo en imperativo presente:** Escribir en tiempo imperativo ("agrega", "corrige", "refactoriza", "elimina"), jamás en pasado ("agregado", "se corrigió") ni gerundio ("agregando").
2. **Límite de longitud:** La línea de cabecera no debe superar los **50 a 72 caracteres**.
3. **Sin punto final:** No añadir punto al final de la primera línea.
4. **Prohibición absoluta de emojis:** NUNCA utilizar emojis en los mensajes de commit, descripciones ni pies de página.
5. **Cuerpo enfocado en la causalidad:** Si el cambio es complejo, dejar una línea en blanco tras la cabecera y detallar:
   - ¿Qué problema existía?
   - ¿Por qué se eligió esta solución sobre las alternativas?
   - ¿Qué efectos colaterales o implicaciones transitorias existen?

### D. Versionado Automático (Semantic-Release)
El cumplimiento estricto de Conventional Commits permite a herramientas automatizadas del servidor (`semantic-release`):
- Escanear la secuencia de commits desde la última etiqueta (`git tag`).
- Deducir algorítmicamente el salto de versión exacto (PATCH, MINOR o MAJOR).
- Generar el `CHANGELOG.md` indexado por categorías sin intervención humana.
- Crear la etiqueta Git y publicar los artefactos correspondientes.
