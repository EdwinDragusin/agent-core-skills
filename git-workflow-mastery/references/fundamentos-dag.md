# Fundamentos Computacionales del Grafo Acíclico Dirigido (DAG)

### A. Anatomía de Objetos Internos
Git no almacena diferencias (diffs) entre archivos como los sistemas centralizados heredados (SVN, CVS); almacena **instantáneas completas (snapshots)** estructuradas mediante un Grafo Acíclico Dirigido (DAG) compuesto por tres objetos fundamentales e inmutables:
- **`blob` (Binary Large Object):** Contenido puro de un archivo en un estado determinado. Carece de nombre, permisos o rutas; se indexa exclusivamente por el hash de su contenido.
- **`tree`:** Representa un directorio del sistema de archivos. Contiene apuntadores a `blobs` (con sus nombres y permisos POSIX) y a sub-`trees`.
- **`commit`:** Metadatos del envío (autor, committer, marca de tiempo, mensaje), apuntador al `tree` raíz y apuntadores a sus commits padres (cero en commit raíz, uno en commit lineal, dos o más en commits de merge).

### B. Desmitificación: La Falsa Premisa de Ineficiencia por Ramificación
Existe la creencia errónea de que crear múltiples ramas "pesa" o penaliza el almacenamiento del repositorio. Computacionalmente:
- Una rama en Git **carece de peso estructural**.
- Una rama es únicamente un archivo plano de texto de **41 bytes** ubicado en `.git/refs/heads/<nombre_rama>` que almacena un hash SHA-1 de 40 caracteres (o 64 caracteres en SHA-256) y un salto de línea.
- Crear 10, 100 o 1,000 ramas concurrentes no degrada el rendimiento del motor de Git ni satura el almacenamiento del disco.

### C. La Verdadera Penalización: Longevidad y Divergencia de Integración
La ineficiencia no radica en la cantidad de ramas creadas, sino en su **tiempo de vida (longevidad)** y el diferencial topológico frente al tronco principal (`main`):
- **Métricas DORA:** La latencia en la integración genera una curva exponencial de conflictos de fusión (merge conflicts).
- **Línea de tiempo empírica:**
  - **Día 1:** Divergencia mínima; resolución de integración trivial o nula.
  - **Día 3:** Fricción moderada; conflictos menores de solapamiento contextual.
  - **Día 14+:** Base de código ampliamente mutada; el coste cognitivo de reconciliar el grafo supera el coste de reescribir la funcionalidad desde cero.
