# Especificacion standard-readme y Taxonomia Empirica

## 1. Filosofia y Jerarquia Canonica

La especificacion `standard-readme` (creada por Richard Littauer) establece un orden jerarquico estricto y un conjunto de componentes normativos destinados a reducir la friccion cognitiva, facilitar la auditoria automatizada y permitir que cualquier desarrollador o agente consuma el proyecto sin necesidad de escudriñar el codigo fuente.

### Orden Canónico Obligatorio

1. **Titulo y Descripcion**:
   - Encabezado de nivel 1 (`# <nombre-del-proyecto>`).
   - Resumen conciso de una sola linea (propuesta de valor inmediata). Responde de inmediato que hace y que problema resuelve.
2. **Insignias (Badges)**:
   - Estado de construccion (CI / Actions).
   - Cobertura de pruebas (Coverage).
   - Version del paquete o release (npm, crates.io, deno.land, GitHub release).
   - Licencia legal (identificador SPDX).
3. **Tabla de Contenidos (TOC)**:
   - Obligatoria si el documento excede 100 lineas o 3 encabezados principales.
   - Enlaces ancla validos y normalizados en minusculas (kebab-case) segun las reglas de GitHub/GitLab.
4. **Antecedentes (Background)**:
   - Justificacion del proyecto y contexto arquitectonico ("el por que").
   - Comparacion con soluciones existentes o antecedentes historicos del problema.
5. **Instalacion (Install)**:
   - Prerrequisitos de runtime y versiones minimas (Node, Deno, Rust, Python, Docker).
   - Comandos explicitos de instalacion y aprovisionamiento.
6. **Uso (Usage)**:
   - Bloques de codigo ejecutables demostrando el camino feliz (happy path).
   - Debe ofrecer valor funcional inmediato antes de la primera pantalla de desplazamiento.
7. **Contribucion (Contributing)**:
   - Politicas de integracion, estandares de codificacion, convenciones de branching y directrices de Pull Request.
8. **Licencia (License)**:
   - Declaracion legal de derechos con identificador SPDX estandarizado (MIT, Apache-2.0, GPL-3.0, etc.).

---

## 2. Taxonomia Empirica de Contenido

Segun la investigacion empirica sobre repositorios de software, la presencia de secciones se clasifica en tres estratos:

| Estrato de Contenido | Secciones Requeridas | Proposito Operacional |
| -------------------- | -------------------- | --------------------- |
| Universal            | `Usage`, `Install`, `License` | Barrera minima de adopcion y viabilidad legal. Presencia mandatoria en el 100% de proyectos maduros. |
| Especifico de Biblioteca | `API`, `Install`, `Dependencies`, `License` | Enfoque en consumo externo, firmas de contratos e interfaces publicas sin riesgo de violacion de propiedad intelectual. |
| Especifico de Aplicacion | `Configuration`, `Options`, `Environment (.env)`, `Deployment` | Parametrizacion profunda, banderas de CLI, topologia de contenedores y variables de entorno. |
| Aseguramiento de Calidad | `Test`, `Architecture`, `Roadmap` / `Todo` | Verificacion de calidad interna, reglas arquitectonicas y estado de evolucion del sistema. |

---

## 3. Matriz de Deteccion de Antipatrones

### Antipatron 1: El README Vacio (Empty README)
- **Manifestacion**: Archivos con solo el titulo, placeholders genericos ("TODO: escribir documentacion"), o menos de 20 lineas informativas.
- **Impacto**: Comunica abandono o indiferencia institucional. Bloquea adopcion inmediata.
- **Criterio de Auditoria**: Severidad Critica si no contiene instalacion, uso basico ni licencia.

### Antipatron 2: El README Obvio (Obvious README)
- **Manifestacion**: Documento que asume conocimiento tacito o contexto implicito del desarrollador original. Omite variables de entorno necesarias, puertos, secretos requeridos, motores locales o comandos de inicializacion.
- **Impacto**: Friccion extrema en onboarding; errores inmediatos en tiempo de ejecucion local.
- **Criterio de Auditoria**: Severidad Alta si un comando documentado falla por falta de prerrequisito no declarado.

### Antipatron 3: La Novela (The Novel)
- **Manifestacion**: Miles de palabras sin jerarquia visual, bloques de texto monoliticos sin subtitulos, tablas, listas ni escaneabilidad.
- **Impacto**: Fatiga cognitiva. Los desarrolladores no leen linealmente; escanean buscando anclas operacionales.
- **Criterio de Auditoria**: Severidad Media si existen secciones con mas de 40 lineas de prosa ininterrumpida sin diagramas, listas o fragmentos de codigo.

### Antipatron 4: El README Desactualizado (Documentation Rot / Drift)
- **Manifestacion**: Comandos documentados que ya no coinciden con `deno.json`, `package.json`, rutas de archivos renombradas o flags deprecadas.
- **Impacto**: Mas perjudicial que la ausencia de documentacion: induce a errores activos y perdida masiva de tiempo de depuracion.
- **Criterio de Auditoria**: Severidad Critica o Alta dependiendo de si afecta la instalacion o el despliegue.

---

## 4. Automatizacion de Mantenimiento

Todo proyecto maduro debe incorporar validacion estatica en CI:
- **Linter de Markdown**: `markdownlint` o `deno fmt --check` para forzar formato consistente de listas, saltos de linea y encabezados.
- **Sincronizacion de TOC**: Uso de `doctoc` o hooks de pre-commit para auto-generar los anclajes y evitar enlaces rotos tras renombrar encabezados.
