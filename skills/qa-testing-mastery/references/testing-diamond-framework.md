# Marco Arquitectonico: El Diamante de Pruebas y Persistencia

Guia tecnica de referencia sobre la arquitectura de pruebas para backends modernos basados en Node.js (Express), React y Sequelize con motores relacionales como PostgreSQL o MySQL.

---

## 1. Evolucion Paradigmatica: Del Triangulo al Diamante de Pruebas

Historicamente, el aseguramiento de calidad adopto la **Piramide de Pruebas** (base masiva de pruebas unitarias, capa moderada de integracion y cuspide minima E2E). Sin embargo, en arquitecturas backend donde Express actua como enrutador HTTP y Sequelize como mediador de persistencia relacional, la aplicacion dogmatica de este modelo genera serios problemas:

*   **Fragilidad por sobre-simulacion (Over-mocking)**: Probar controladores simulando `req`, `res` y cada metodo del modelo de Sequelize (`findOrCreate`, `update`, `transaction`) genera pruebas altamente acopladas a la implementacion interna que no detectan errores reales de SQL, esquemas o restricciones.
*   **Falsos positivos**: Pruebas unitarias pasan con exito, pero la aplicacion colapsa en produccion al ejecutar una consulta mal formada o violar una clave foranea.

### El Diamante de Pruebas (Test Diamond)

El paradigma contemporaneo traslada el nucleo de gravedad hacia las **Pruebas de Componente / Integracion**:

| Clasificacion de Prueba | Enfoque Arquitectonico (Express + React + Sequelize) | Proporcion Estrategica |
| :--- | :--- | :--- |
| **Extremo a Extremo (E2E)** | Renderizado completo en React, red real hacia Express y mutaciones permanentes en BD. | **Minima (5-10%)**: Lenta y fragil; reservada para flujos criticos (ej. checkout de pagos). |
| **Integracion / Componente** | Peticiones HTTP directas a Express en proceso (Supertest), atravesando middlewares y ejecutando SQL real en Sequelize. | **Maxima (60-70%)**: Nucleo central que detecta el 99% de las regresiones sin latencia de red externa. |
| **Contrato (CDC)** | Verificacion formal de contratos JSON entre React y Express mediante Pact.js. | **Moderada (15-20%)**: Esencial para evitar roturas silenciosas entre frontend y backend. |
| **Unitaria Pura** | Aislamiento estricto de logica de dominio pura, algoritmos y formateadores sin BD ni red. | **Moderada (10-15%)**: Focalizada en logica de negocio condicionalmente densa. |

---

## 2. La Falacia del Motor en Memoria: SQLite vs PostgreSQL / MySQL

> [!CAUTION]
> **Antipatron Critico**: Configurar `sqlite::memory:` para la suite de pruebas mientras produccion corre sobre PostgreSQL o MySQL produce falsas garantias de correctitud debido a discrepancias insalvables de dialecto y comportamiento.

### Matriz de Discrepancias Tecnicas

| Caracteristica SQL | SQLite (Entorno de Pruebas Antipatron) | PostgreSQL (Produccion Real) | Implicacion para el Testing |
| :--- | :--- | :--- | :--- |
| **Tipado Estricto** | Utiliza *afinidad de tipos*. Permite insertar texto en columnas enteras o decimales. | Validacion estricta de tipos. Rechaza inserciones incompatibles lanzando excepciones. | Pruebas con datos mal formados pasan localmente pero colapsan en produccion. |
| **Sensibilidad a Mayusculas** | Operador `LIKE` es insensible a mayusculas por defecto. | Operador `LIKE` es sensible. Requiere `ILIKE` para busquedas insensibles. | Rutas de busqueda fallan con errores de sintaxis o resultados vacios en produccion. |
| **Campos Booleanos** | Carece de tipo booleano nativo; usa enteros `0` y `1`. | Valores booleanos nativos `true` y `false`. | Comparaciones estrictas `=== true` en Node.js fallan intermitentemente. |
| **Manipulacion JSON** | Soporta JSON como texto plano mediante `json_extract`. | Soporte nativo para `JSONB` con indexacion y operadores `->`, `->>`. | Consultas avanzadas de Sequelize sobre atributos JSON generaran errores de dialecto. |
| **Concurrencia de Escritura** | Bloqueo a nivel de archivo completo (`SQLITE_BUSY`). | Control de Concurrencia Multiversion (MVCC) con transacciones paralelas. | Pruebas paralelas en Vitest/Jest fallan por bloqueos temporales en SQLite. |
| **Funciones Temporales** | Funcion estilo C `strftime`. | API robusta con `date_trunc`, `timezone`, etc. | Agrupaciones analiticas temporales requieren bifurcacion logica. |

### Solucion Estructural: Paridad de Entornos
Se debe ejecutar la suite de pruebas contra el **mismo motor de base de datos de produccion**:
1.  **Testcontainers**: Contenedores Docker efimeros de PostgreSQL/MySQL gestionados programaticamente desde el setup global de pruebas.
2.  **Docker Compose dedicado**: Contenedor aislado levantado en el script `globalSetup` del test runner.

---

## 3. Aislamiento de Estado y Desmontaje Transaccional (CLS)

Las pruebas deben ejecutarse en un vacio hermetico; la mutacion de datos en una prueba nunca debe afectar a las siguientes.

### El Cuello de Botella del Truncamiento
Ejecutar `Model.destroy({ truncate: true, cascade: true })` o `sequelize.sync({ force: true })` en cada `beforeEach`/`afterEach`:
*   Adquiere bloqueos exclusivos de esquema.
*   Purga paginas en disco y recalcula secuencias.
*   Ralentiza la suite de pruebas a varios minutos a medida que crecen los modelos.

### Rollbacks Transaccionales con CLS (Continuation-Local Storage)
El estandar de alto rendimiento consiste en envolver cada prueba en una transaccion logica y ejecutar un `rollback` incondicional en `afterEach`:

```
+-------------------------------------------------------------+
| 1. beforeEach: Iniciar Transaccion CLS                      |
|    const t = await sequelize.transaction();                 |
+-------------------------------------------------------------+
| 2. Test Execution: Peticion Supertest -> Express -> ORM     |
|    request(app).post('/api/orders').send(...)               |
|    Sequelize auto-asocia 't' mediante cls-hooked            |
+-------------------------------------------------------------+
| 3. afterEach: Rollback Incondicional                        |
|    await t.rollback(); // Estado revertido en <5ms          |
+-------------------------------------------------------------+
```

*   **Propagacion Invisible**: Utilizando `cls-hooked`, Sequelize asocia automaticamente todas las consultas generadas durante la peticion HTTP a la transaccion activa sin modificar el codigo de produccion.
*   **Tiempo Constante**: Los rollbacks en motores MVCC toman milisegundos, permitiendo suites de cientos de pruebas de integracion en pocos segundos.

---

## 4. Niveles de Aislamiento y Bloqueos Pesimistas en Sequelize

Para prevenir condiciones de carrera y fallos de concurrencia en operaciones transaccionales criticas, Sequelize proporciona abstracciones de bloqueo pesimista que deben ser verificadas en las pruebas de integracion:

| Directiva Sequelize | SQL Equivalente | Comportamiento y Caso de Uso |
| :--- | :--- | :--- |
| `transaction.LOCK.UPDATE` | `FOR UPDATE` | Adquiere bloqueo exclusivo sobre la fila. Evita que transacciones concurrentes lean con bloqueo, actualicen o borren hasta commit/rollback. **Indispensable para sustraccion de inventario y saldos.** |
| `transaction.LOCK.SHARE` | `FOR SHARE` | Bloquea la fila para lectura compartida. Otras transacciones pueden leer pero no mutar. Util para reportes consistentes en tiempo real. |
| `transaction.LOCK.KEY_SHARE` | `FOR KEY SHARE` | Bloquea llaves primarias/unicas permitiendo updates concurrentes en columnas secundarias. |
| `transaction.LOCK.NO_KEY_UPDATE` | `FOR NO KEY UPDATE` | Bloqueo para mutar datos no clave, previniendo modificaciones en llaves relacionales. |

---

## 5. Evolucion Estructural: Migraciones, Semillas y Fabricas

### Migraciones Reales vs `sync()`
*   `sequelize.sync({ force: true })` es un **antipatron en entornos maduros** porque ignora la logica granular de archivos de migracion (conversion de datos historicos, indices compuestos especificos, funciones almacenadas).
*   El entorno de pruebas debe aprovisionarse ejecutando las migraciones reales mediante `sequelize-cli db:migrate` o el orquestador agnostico `Umzug`.

### Semillas Globales vs Fabricas Dinamicas
1.  **Semillas Globales (Seeders)**: Unicamente para **datos de catalogo invariables** (roles del sistema, paises, monedas) insertados una sola vez antes de la suite con `db:seed:all` o `bulkInsert`.
2.  **Fabricas Dinamicas (Data Factories)**: Para **datos transaccionales mutables** (usuarios, productos, pedidos). Se implementan generadores basados en `@faker-js/faker` para instanciar registros unicos y explicitos por cada prueba, evitando colisiones de restricciones unicas.