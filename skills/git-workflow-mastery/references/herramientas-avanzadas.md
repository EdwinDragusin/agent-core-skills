# Arsenal Subyacente y Operaciones Avanzadas de Git

> **Nota sobre el entorno:** Las herramientas de Git Hooks se configuran segun el ecosistema del proyecto (en Node/NPM con Husky y lint-staged, en Deno o Rust mediante tareas o ganchos nativos, y en Python con pre-commit).

### 1. Gobernanza Automatizada con Git Hooks (Referencia General)
El factor humano es susceptible al descuido en momentos de presion. La disciplina se garantiza mediante validadores automatizados que interceptan el ciclo de vida local de Git.

#### A. La Triada Local de Integridad
1. **Husky:** Vincula el directorio `.git/hooks` a una carpeta versionada en el repositorio.
2. **Lint-Staged:** Se ejecuta en el hook `pre-commit`. Filtra y ejecuta formateadores y analizadores estaticos unicamente sobre los archivos modificados que estan en el stage (`git add`).
3. **Commitlint:** Se ejecuta en el hook `commit-msg`. Evalua el mensaje del commit contra la gramatica de Conventional Commits.

#### B. Separacion de Responsabilidades: Hooks Locales vs CI Remoto
- **Hooks locales (`pre-commit`, `commit-msg`):** Disenados exclusivamente para validaciones instantaneas (< 2 segundos).
- **Hook `pre-push`:** Validacion ligera de tipos.
- **CI en el servidor remoto:** Ejecucion exhaustiva de tests pesados (Docker, Testcontainers).

### 2. Auditoria Forense Comparativa con `git range-diff`
Al reescribir historial (`git commit --amend`, `git rebase -i` o tras un `git push --force`), el revisor de codigo pierde el diferencial de que vario exactamente entre la version anterior y la nueva version reescrita.
- **Funcionamiento:** Calcula un **"diff de diffs"**. Proyecta ambas secuencias de commits en un grafo bipartito y utiliza el **Algoritmo de Jonker-Volgenant** para resolver la asignacion lineal optima entre parches correspondientes.

### 3. Resolucion Clandestina de Conflictos con `git rerere`
`rerere` (*Reuse Recorded Resolution*) es un demonio interno que memoriza como el desarrollador resolvio un conflicto de merge o rebase.
- **Mecanismo:**
  1. Ante un conflicto, graba la **pre-imagen** (estado conflictivo).
  2. Cuando el usuario resuelve el conflicto y commitea, graba la **post-imagen** (solucion adoptada).
  3. Si la misma colision textual vuelve a ocurrir en rebases subsecuentes o ramas apiladas, `rerere` aplica de forma automatica la misma solucion sin pedir intervencion humana.

### 4. Exfiltracion Quirurgica y Purificacion de Secretos con `git filter-repo`
Si se filtran accidentalmente credenciales, tokens o archivos binarios gigantes en el historial, la herramienta obsoleta `git filter-branch` resulta lenta y destructiva.
- **Estandar actual:** `git-filter-repo` (modulo optimizado en Python sobre el fast-export stream de Git).
- **Capacidades:** Reescribe historiales de mas de 100,000 commits en milisegundos, recalculando hashes, eliminando referencias en reflogs y purificando cadenas de datos sensibles.
