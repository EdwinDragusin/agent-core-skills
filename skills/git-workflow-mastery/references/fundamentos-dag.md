# Fundamentos Computacionales del Grafo Aciclico Dirigido (DAG)

### A. Anatomia de Objetos Internos
Git no almacena diferencias (diffs) entre archivos como los sistemas centralizados heredados (SVN, CVS); almacena **instantaneas completas (snapshots)** estructuradas mediante un Grafo Aciclico Dirigido (DAG) compuesto por tres objetos fundamentales e inmutables:
- **`blob` (Binary Large Object):** Contenido puro de un archivo en un estado determinado. Carece de nombre, permisos o rutas; se indexa exclusivamente por el hash de su contenido.
- **`tree`:** Representa un directorio del sistema de archivos. Contiene apuntadores a `blobs` (con sus nombres y permisos POSIX) y a sub-`trees`.
- **`commit`:** Metadatos del envio (autor, committer, marca de tiempo, mensaje), apuntador al `tree` raiz y apuntadores a sus commits padres (cero en commit raiz, uno en commit lineal, dos o mas en commits de merge).

### B. Desmitificacion: La Falsa Premisa de Ineficiencia por Ramificacion
Existe la creencia erronea de que crear multiples ramas "pesa" o penaliza el almacenamiento del repositorio. Computacionalmente:
- Una rama en Git **carece de peso estructural**.
- Una rama es unicamente un archivo plano de texto de **41 bytes** ubicado en `.git/refs/heads/<nombre_rama>` que almacena un hash SHA-1 de 40 caracteres (o 64 caracteres en SHA-256) y un salto de linea.
- Crear 10, 100 o 1,000 ramas concurrentes no degrada el rendimiento del motor de Git ni satura el almacenamiento del disco.

### C. La Verdadera Penalizacion: Longevidad y Divergencia de Integracion
La ineficiencia no radica en la cantidad de ramas creadas, sino en su **tiempo de vida (longevidad)** y el diferencial topologico frente al tronco principal (`main`):
- **Metricas DORA:** La latencia en la integracion genera una curva exponencial de conflictos de fusion (merge conflicts).
- **Linea de tiempo empirica:**
  - **Dia 1:** Divergencia minima; resolucion de integracion trivial o nula.
  - **Dia 3:** Friccion moderada; conflictos menores de solapamiento contextual.
  - **Dia 14+:** Base de codigo ampliamente mutada; el coste cognitivo de reconciliar el grafo supera el coste de reescribir la funcionalidad desde cero.
