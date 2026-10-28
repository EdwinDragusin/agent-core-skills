# Escalabilidad, Rendimiento y Configuración Paramétrica

### A. Aceleración con `commit-graph` y Filtros de Bloom
En repositorios con decenas de miles de commits, comandos como `git log -- <archivo>` o `git blame` se vuelven lentos por tener que parsear recursivamente los árboles del historial.
- **`commit-graph`:** Serializa los linajes y la topología en un archivo precalculado `.git/objects/info/commit-graph`, acelerando el recorrido entre 2x y 5x.
- **Filtros de Bloom (`--changed-paths`):** Estructura matemática probabilística de pertenencia en $O(1)$. Si el filtro determina que un commit no modificó la ruta consultada, Git omite desempaquetar el árbol completo de ese commit:
  ```bash
  git commit-graph write --reachable --changed-paths
  ```

### B. Mantenimiento en Segundo Plano con `git maintenance`
Reemplaza la ejecución disruptiva de `git gc` mediante tareas programadas silenciosas a nivel de sistema operativo:
```bash
git maintenance register
git maintenance start
```
Tareas orquestadas:
- **`prefetch` (cada hora):** Descarga deltas del remoto sin tocar ramas locales.
- **`commit-graph` (cada hora):** Actualiza incrementalmente el grafo y los filtros de Bloom.
- **`loose-objects` (diario):** Comprime objetos sueltos para optimizar inodes de disco.
- **`incremental-repack` (diario):** Agrupa packfiles dispersos sin invalidar cachés previas.
- **`pack-refs` (semanal):** Condensa punteros individuales de ramas en un solo archivo plano.

### C. Configuración Paramétrica Global Recomendada
```bash
# Evitar tener que especificar --set-upstream en el primer push de cada rama
git config --global push.autoSetupRemote true

# Estandarizacion de finales de linea (evitar conflictos CRLF de Windows vs LF de Linux)
git config --global core.autocrlf input

# Habilitar reutilizacion de resolucion de conflictos
git config --global rerere.enabled true

# Clonacion asimetrica ultrarrapida en repositorios colosales o pipelines de CI
git clone --filter=blob:none <url_repositorio>
```
