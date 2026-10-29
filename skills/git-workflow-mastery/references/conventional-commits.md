# Anatomia Semantica del Historial de Commits

### A. Gramatica Estricta: Conventional Commits
```text
<tipo>[ambito opcional]: <descripcion imperativa en minusculas>

[cuerpo detallado opcional explicando motivaciones y mecanismos]

[pies de pagina opcionales para metadatos, referencias y cambios destructivos]
```

### B. Tipos de Commit y Correlacion con Versionado Semantico (SemVer)

| Tipo | Semantica del Cambio | Salto en SemVer |
| :--- | :--- | :--- |
| `feat` | Introduce una nueva funcionalidad a la base de codigo. | **MINOR** (ej. 1.2.0 -> 1.3.0) |
| `fix` | Parchea un defecto o error de logica existente. | **PATCH** (ej. 1.2.1 -> 1.2.2) |
| `refactor` | Reestructuracion de codigo que no altera el comportamiento externo ni corrige bugs. | Sin incremento de version externa |
| `docs` | Cambios exclusivos en documentacion (Markdown, comentarios JSDoc). | Sin incremento de version externa |
| `style` | Formato, espacios en blanco, comillas, punto y coma (sin cambios en logica). | Sin incremento de version externa |
| `test` | Anadir, corregir o refactorizar suites de pruebas (unitarias, integracion). | Sin incremento de version externa |
| `chore` | Mantenimiento de dependencias, scripts de build, configuracion de linter/CI. | Sin incremento de version externa |
| `schema` | Modificacion de esquemas de base de datos o migraciones (Drizzle/ORM). | Sin incremento (o segun impacto) |
| **`BREAKING CHANGE`** o sufijo `!` (ej. `feat(api)!:`) | Cambio incompatible hacia atras en la API publica. Declarado en el pie de pagina o tras el tipo. | **MAJOR** (ej. 1.0.0 -> 2.0.0) |

### C. Reglas de Redaccion del Commit
1. **Verbo en imperativo presente:** Escribir en tiempo imperativo ("agrega", "corrige", "refactoriza", "elimina"), jamas en pasado ("agregado", "se corrigio") ni gerundio ("agregando").
2. **Limite de longitud:** La linea de cabecera no debe superar los **50 a 72 caracteres**.
3. **Sin punto final:** No anadir punto al final de la primera linea.
4. **Prohibicion absoluta de emojis:** NUNCA utilizar emojis en los mensajes de commit, descripciones ni pies de pagina.
5. **Cuerpo enfocado en la causalidad:** Si el cambio es complejo, dejar una linea en blanco tras la cabecera y detallar:
   - Que problema existia?
   - Por que se eligio esta solucion sobre las alternativas?
   - Que efectos colaterales o implicaciones transitorias existen?

### D. Versionado Automatico (Semantic-Release)
El cumplimiento estricto de Conventional Commits permite a herramientas automatizadas del servidor (`semantic-release`):
- Escanear la secuencia de commits desde la ultima etiqueta (`git tag`).
- Deducir algoritmicamente el salto de version exacto (PATCH, MINOR o MAJOR).
- Generar el `CHANGELOG.md` indexado por categorias sin intervencion humana.
- Crear la etiqueta Git y publicar los artefactos correspondientes.
