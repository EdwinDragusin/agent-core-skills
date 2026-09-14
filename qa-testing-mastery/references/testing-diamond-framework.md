# Marco Arquitectónico: El Diamante de Pruebas y Persistencia

Guía técnica de referencia sobre la arquitectura de pruebas para backends modernos basados en Node.js (Express), React y Sequelize con motores relacionales como PostgreSQL o MySQL.

---

## 1. Evolución Paradigmática: Del Triángulo al Diamante de Pruebas

Históricamente, el aseguramiento de calidad adoptó la **Pirámide de Pruebas** (base masiva de pruebas unitarias, capa moderada de integración y cúspide mínima E2E). Sin embargo, en arquitecturas backend donde Express actúa como enrutador HTTP y Sequelize como mediador de persistencia relacional, la aplicación dogmática de este modelo genera serios problemas:

*   **Fragilidad por sobre-simulación (Over-mocking)**: Probar controladores simulando `req`, `res` y cada método del modelo de Sequelize (`findOrCreate`, `update`, `transaction`) genera pruebas altamente acopladas a la implementación interna que no detectan errores reales de SQL, esquemas o restricciones.
*   **Falsos positivos**: Pruebas unitarias pasan con éxito, pero la aplicación colapsa en producción al ejecutar una consulta mal formada o violar una clave foránea.

### El Diamante de Pruebas (Test Diamond)

El paradigma contemporáneo traslada el núcleo de gravedad hacia las **Pruebas de Componente / Integración**:

| Clasificación de Prueba | Enfoque Arquitectónico (Express + React + Sequelize) | Proporción Estratégica |
| :--- | :--- | :--- |
| **Extremo a Extremo (E2E)** | Renderizado completo en React, red real hacia Express y mutaciones permanentes en BD. | **Mínima (5-10%)**: Lenta y frágil; reservada para flujos críticos (ej. checkout de pagos). |
| **Integración / Componente** | Peticiones HTTP directas a Express en proceso (Supertest), atravesando middlewares y ejecutando SQL real en Sequelize. | **Máxima (60-70%)**: Núcleo central que detecta el 99% de las regresiones sin latencia de red externa. |
| **Contrato (CDC)** | Verificación formal de contratos JSON entre React y Express mediante Pact.js. | **Moderada (15-20%)**: Esencial para evitar roturas silenciosas entre frontend y backend. |
| **Unitaria Pura** | Aislamiento estricto de lógica de dominio pura, algoritmos y formateadores sin BD ni red. | **Moderada (10-15%)**: Focalizada en lógica de negocio condicionalmente densa. |

---

## 2. La Falacia del Motor en Memoria: SQLite vs PostgreSQL / MySQL

> [!CAUTION]
> **Antipatrón Crítico**: Configurar `sqlite::memory:` para la suite de pruebas mientras producción corre sobre PostgreSQL o MySQL produce falsas garantías de correctitud debido a discrepancias insalvables de dialecto y comportamiento.

### Matriz de Discrepancias Técnicas

| Característica SQL | SQLite (Entorno de Pruebas Antipatrón) | PostgreSQL (Producción Real) | Implicación para el Testing |
| :--- | :--- | :--- | :--- |
| **Tipado Estricto** | Utiliza *afinidad de tipos*. Permite insertar texto en columnas enteras o decimales. | Validación estricta de tipos. Rechaza inserciones incompatibles lanzando excepciones. | Pruebas con datos mal formados pasan localmente pero colapsan en producción. |
| **Sensibilidad a Mayúsculas** | Operador `LIKE` es insensible a mayúsculas por defecto. | Operador `LIKE` es sensible. Requiere `ILIKE` para búsquedas insensibles. | Rutas de búsqueda fallan con errores de sintaxis o resultados vacíos en producción. |
| **Campos Booleanos** | Carece de tipo booleano nativo; usa enteros `0` y `1`. | Valores booleanos nativos `true` y `false`. | Comparaciones estrictas `=== true` en Node.js fallan intermitentemente. |
| **Manipulación JSON** | Soporta JSON como texto plano mediante `json_extract`. | Soporte nativo para `JSONB` con indexación y operadores `->`, `->>`. | Consultas avanzadas de Sequelize sobre atributos JSON generarán errores de dialecto. |
| **Concurrencia de Escritura** | Bloqueo a nivel de archivo completo (`SQLITE_BUSY`). | Control de Concurrencia Multiversión (MVCC) con transacciones paralelas. | Pruebas paralelas en Vitest/Jest fallan por bloqueos temporales en SQLite. |
| **Funciones Temporales** | Función estilo C `strftime`. | API robusta con `date_trunc`, `timezone`, etc. | Agrupaciones analíticas temporales requieren bifurcación lógica. |

### Solución Estructural: Paridad de Entornos
Se debe ejecutar la suite de pruebas contra el **mismo motor de base de datos de producción**:
1.  **Testcontainers**: Contenedores Docker efímeros de PostgreSQL/MySQL gestionados programáticamente desde el setup global de pruebas.
2.  **Docker Compose dedicado**: Contenedor aislado levantado en el script `globalSetup` del test runner.

---

## 3. Aislamiento de Estado y Desmontaje Transaccional (CLS)

Las pruebas deben ejecutarse en un vacío hermético; la mutación de datos en una prueba nunca debe afectar a las siguientes.

### El Cuello de Botella del Truncamiento
Ejecutar `Model.destroy({ truncate: true, cascade: true })` o `sequelize.sync({ force: true })` en cada `beforeEach`/`afterEach`:
*   Adquiere bloqueos exclusivos de esquema.
*   Purga páginas en disco y recalcula secuencias.
*   Ralentiza la suite de pruebas a varios minutos a medida que crecen los modelos.

### Rollbacks Transaccionales con CLS (Continuation-Local Storage)
El estándar de alto rendimiento consiste en envolver cada prueba en una transacción lógica y ejecutar un `rollback` incondicional en `afterEach`:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. beforeEach: Iniciar Transacción CLS                      │
│    const t = await sequelize.transaction();                 │
├─────────────────────────────────────────────────────────────┤
│ 2. Test Execution: Petición Supertest -> Express -> ORM     │
│    request(app).post('/api/orders').send(...)               │
│    Sequelize auto-asocia 't' mediante cls-hooked            │
├─────────────────────────────────────────────────────────────┤
│ 3. afterEach: Rollback Incondicional                        │
│    await t.rollback(); // Estado revertido en <5ms          │
└─────────────────────────────────────────────────────────────┘
```

*   **Propagación Invisible**: Utilizando `cls-hooked`, Sequelize asocia automáticamente todas las consultas generadas durante la petición HTTP a la transacción activa sin modificar el código de producción.
*   **Tiempo Constante**: Los rollbacks en motores MVCC toman milisegundos, permitiendo suites de cientos de pruebas de integración en pocos segundos.

---

## 4. Niveles de Aislamiento y Bloqueos Pesimistas en Sequelize

Para prevenir condiciones de carrera y fallos de concurrencia en operaciones transaccionales críticas, Sequelize proporciona abstracciones de bloqueo pesimista que deben ser verificadas en las pruebas de integración:

| Directiva Sequelize | SQL Equivalente | Comportamiento y Caso de Uso |
| :--- | :--- | :--- |
| `transaction.LOCK.UPDATE` | `FOR UPDATE` | Adquiere bloqueo exclusivo sobre la fila. Evita que transacciones concurrentes lean con bloqueo, actualicen o borren hasta commit/rollback. **Indispensable para sustracción de inventario y saldos.** |
| `transaction.LOCK.SHARE` | `FOR SHARE` | Bloquea la fila para lectura compartida. Otras transacciones pueden leer pero no mutar. Útil para reportes consistentes en tiempo real. |
| `transaction.LOCK.KEY_SHARE` | `FOR KEY SHARE` | Bloquea llaves primarias/únicas permitiendo updates concurrentes en columnas secundarias. |
| `transaction.LOCK.NO_KEY_UPDATE` | `FOR NO KEY UPDATE` | Bloqueo para mutar datos no clave, previniendo modificaciones en llaves relacionales. |

---

## 5. Evolución Estructural: Migraciones, Semillas y Fábricas

### Migraciones Reales vs `sync()`
*   `sequelize.sync({ force: true })` es un **antipatrón en entornos maduros** porque ignora la lógica granular de archivos de migración (conversión de datos históricos, índices compuestos específicos, funciones almacenadas).
*   El entorno de pruebas debe aprovisionarse ejecutando las migraciones reales mediante `sequelize-cli db:migrate` o el orquestador agnóstico `Umzug`.

### Semillas Globales vs Fábricas Dinámicas
1.  **Semillas Globales (Seeders)**: Únicamente para **datos de catálogo invariables** (roles del sistema, países, monedas) insertados una sola vez antes de la suite con `db:seed:all` o `bulkInsert`.
2.  **Fábricas Dinámicas (Data Factories)**: Para **datos transaccionales mutables** (usuarios, productos, pedidos). Se implementan generadores basados en `@faker-js/faker` para instanciar registros únicos y explícitos por cada prueba, evitando colisiones de restricciones únicas.