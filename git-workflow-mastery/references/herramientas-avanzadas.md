# Arsenal Subyacente y Operaciones Avanzadas de Git

> **Nota sobre el entorno:** Las herramientas de Git Hooks se configuran según el ecosistema del proyecto (en Node/NPM con Husky y lint-staged, en Deno o Rust mediante tareas o ganchos nativos, y en Python con pre-commit).

### 1. Gobernanza Automatizada con Git Hooks (Referencia General)
El factor humano es susceptible al descuido en momentos de presión. La disciplina se garantiza mediante validadores automatizados que interceptan el ciclo de vida local de Git.

#### A. La Tríada Local de Integridad
1. **Husky:** Vincula el directorio `.git/hooks` a una carpeta versionada en el repositorio.
2. **Lint-Staged:** Se ejecuta en el hook `pre-commit`. Filtra y ejecuta formateadores y analizadores estáticos únicamente sobre los archivos modificados que están en el stage (`git add`).
3. **Commitlint:** Se ejecuta en el hook `commit-msg`. Evalúa el mensaje del commit contra la gramática de Conventional Commits.

#### B. Separación de Responsabilidades: Hooks Locales vs CI Remoto
- **Hooks locales (`pre-commit`, `commit-msg`):** Diseñados exclusivamente para validaciones instantáneas (< 2 segundos).
- **Hook `pre-push`:** Validación ligera de tipos.
- **CI en el servidor remoto:** Ejecución exhaustiva de tests pesados (Docker, Testcontainers).

### 2. Auditoría Forense Comparativa con `git range-diff`
Al reescribir historial (`git commit --amend`, `git rebase -i` o tras un `git push --force`), el revisor de código pierde el diferencial de qué varió exactamente entre la versión anterior y la nueva versión reescrita.
- **Funcionamiento:** Calcula un **"diff de diffs"**. Proyecta ambas secuencias de commits en un grafo bipartito y utiliza el **Algoritmo de Jonker-Volgenant** para resolver la asignación lineal óptima entre parches correspondientes.

### 3. Resolución Clandestina de Conflictos con `git rerere`
`rerere` (*Reuse Recorded Resolution*) es un demonio interno que memoriza cómo el desarrollador resolvió un conflicto de merge o rebase.
- **Mecanismo:**
  1. Ante un conflicto, graba la **pre-imagen** (estado conflictivo).
  2. Cuando el usuario resuelve el conflicto y commitea, graba la **post-imagen** (solución adoptada).
  3. Si la misma colisión textual vuelve a ocurrir en rebases subsecuentes o ramas apiladas, `rerere` aplica de forma automática la misma solución sin pedir intervención humana.

### 4. Exfiltración Quirúrgica y Purificación de Secretos con `git filter-repo`
Si se filtran accidentalmente credenciales, tokens o archivos binarios gigantes en el historial, la herramienta obsoleta `git filter-branch` resulta lenta y destructiva.
- **Estándar actual:** `git-filter-repo` (módulo optimizado en Python sobre el fast-export stream de Git).
- **Capacidades:** Reescribe historiales de más de 100,000 commits en milisegundos, recalculando hashes, eliminando referencias en reflogs y purificando cadenas de datos sensibles.
