# Catalogo de Heuristicas y Taxonomia de Casos Borde (Edge Cases)

Catalogo exhaustivo para el diseno de casos de prueba y matrices de riesgo en aplicaciones web fullstack (Express, React, Sequelize, PostgreSQL/MySQL).

---

## 1. Taxonomia de Heuristicas de Casos Borde

Al analizar cualquier endpoint, modelo o servicio de negocio, aplica las siguientes 5 dimensiones de analisis:

```
                  +----------------------------------------------+
                  |          TAXONOMIA DE CASOS BORDE            |
                  +----------------------------------------------+
                  | 1. Frontera de Datos & Precision Numerica    |
                  | 2. Mutacion de Estado & Concurrencia (Race)  |
                  | 3. Deriva de Contratos & Frontera Cliente    |
                  | 4. Resiliencia & Inyeccion de Fallos         |
                  | 5. Rendimiento, Limites & Saturacion         |
                  +----------------------------------------------+
```

---

### Dimension 1: Frontera de Datos y Precision Numerica

| Heuristica | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Tipico |
| :--- | :--- | :--- | :--- |
| **Desbordamiento Seguro** | Numeros $> 2^{53} - 1$ (`9,007,199,254,740,991` o `Number.MAX_SAFE_INTEGER`). | Rechazar con error 400 o procesar como `BigInt` / `DataTypes.BIGINT`. | Corrupcion silenciosa de identificadores o montos financieros en JS. |
| **Cero y Negativos** | Montos `= 0`, `-0.01`, `-Infinity`, `NaN`. | Rechazo estricto con codigo 422/400. | Saldos inflados, recargas inversas o cobros negativos. |
| **Precision Decimal** | Calculos de punto flotante `0.1 + 0.2` ($0.30000000000000004$). | Uso de `DataTypes.DECIMAL(10, 2)` o librerias de precision fija (`decimal.js`). | Perdida de centavos en liquidaciones o redondeos inconsistentes. |
| **Cadenas y Whitespace** | `""` (vacio), `"   "` (solo espacios), cadenas de 10,000 caracteres, emojis multi-byte (UTF-8 4-byte). | Sanitizacion con trim, validacion de longitud maxima y codificacion `utf8mb4`/UTF-8. | Errores de truncamiento en BD o campos requeridos aceptados con espacios. |
| **Tipado Estricto vs Coercion** | Enviar `"123"` o `true` en campos tipados como `STRING` o `INTEGER`. | Sequelize v7 y validadores de middleware deben exigir tipado estricto sin coercion implicita. | Errores de validacion en tiempo de ejecucion o conversiones no deseadas. |
| **Fechas y Zonas Horarias** | Fechas en formatos ambiguos (`02/03/2026`), fechas bisiestas (`29-Feb-2024`), transiciones DST, timestamps sin UTC offset. | Exigir ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) y persistencia en UTC (`TIMESTAMPTZ`). | Desfases de 1 dia en reportes entre el cliente React y la base de datos. |

---

### Dimension 2: Mutacion de Estado y Concurrencia (Race Conditions)

| Heuristica | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Tipico |
| :--- | :--- | :--- | :--- |
| **Doble Gasto / Reserva Concurrente** | 2 o mas peticiones simultaneas consumiendo el ultimo recurso disponible (stock = 1, balance = 100). | Una sola peticion tiene exito; las demas son rechazadas atomicamente con error 409 Conflict. | Sobreventa (over-selling), saldo negativo o duplicidad de transacciones. |
| **Bloqueo Pesimista (`FOR UPDATE`)** | Peticion B intenta leer/mutar fila bloqueada por Peticion A dentro de una transaccion activa. | Peticion B espera a que Peticion A ejecute commit o rollback (`transaction.LOCK.UPDATE`). | Lectura de datos sucios (Dirty Reads) o actualizaciones perdidas (Lost Updates). |
| **Idempotencia de Peticiones** | El cliente reintenta un `POST /api/payments` identico tras un timeout de red. | Header `Idempotency-Key` procesa el pago una sola vez y devuelve el resultado guardado. | Cobro duplicado al usuario. |
| **Fallo a Mitad de Transaccion** | La insercion en `Orders` es exitosa, pero falla la insercion en `OrderItems` o el descuento de saldo. | `sequelize.transaction` ejecuta `rollback` completo; ninguna tabla queda mutada. | Estados huerfanos o inconsistencia en la base de datos relacional. |

---

### Dimension 3: Deriva de Contratos y Frontera Cliente (React <-> Express)

| Heuristica | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Tipico |
| :--- | :--- | :--- | :--- |
| **Colecciones Vacias vs Pobladas** | Endpoint de lista devuelve `[]` en lugar de omitir la propiedad o devolver `null`. | React recibe `[]` seguro para `.map()` sin lanzar `TypeError: undefined is not a function`. | Pantalla blanca / crash de la interfaz en React. |
| **Renombramiento de Propiedades** | Backend cambia `user_name` a `username` o `firstName`. | Pruebas de contrato Pact detectan la discrepancia en CI antes del despliegue (`can-i-deploy`). | UI muestra valores en blanco (`undefined`) sin arrojar error HTTP. |
| **Estructura Uniforme de Errores** | Errores 4xx/5xx emiten un esquema estandar `{ error: { code, message, details } }`. | Los interceptores de Axios/TanStack Query en React capturan el error de forma predecible. | Manejadores de error en React fallan al intentar leer `error.response.data.message`. |
| **Campos Opcionales Nulos** | Propiedades opcionales se devuelven como `null` o se omiten en JSON. | El contrato Pact valida la presencia de tipos permisibles mediante `MatchersV3.like()`. | Componentes de React que no usan *Optional Chaining* (`user?.profile?.avatar`) colapsan. |

---

### Dimension 4: Resiliencia e Inyeccion de Fallos

| Heuristica | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Tipico |
| :--- | :--- | :--- | :--- |
| **Caida de Servicio Externo** | Pasarela de pago o webhook downstream no responde o devuelve 500. | Circuit breaker / timeout rapido con error manejado 502/504 y reversion de transaccion en BD. | Peticiones HTTP colgadas en Express agotando los sockets del servidor. |
| **Agotamiento del Pool de BD** | Concurrencia supera el `pool.max` configurado en Sequelize. | Cola de espera respetando `pool.acquire` timeout con mensaje de error controlado (no crash). | `ConnectionAcquireTimeoutError` no capturado provoca caida no recuperable de la app. |
| **Inyeccion SQL / JSON Malformado** | Enviar `{ "$gt": "" }` o payloads con caracteres de escape en parametros de Sequelize. | Uso estricto de `bind` parameters y deshabilitacion de operadores peligrosos en Sequelize. | Extraccion no autorizada de datos o bypass de autenticacion. |

---

### Dimension 5: Rendimiento, Limites y Saturacion

| Heuristica | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Tipico |
| :--- | :--- | :--- | :--- |
| **Problema de Consulta $N+1$** | Consultar 50 ordenes y recuperar sus items iterando en un bucle `Promise.all(orders.map(...))`. | Una sola consulta con `include: [{ model: OrderItem }]` o batching estructurado. | Degradacion exponencial de latencia bajo carga real. |
| **Saturacion del Event Loop** | Procesamiento de arreglos gigantes (100k elementos) o regex catastroficas (*ReDoS*) en Express. | Delegacion a Worker Threads o streaming para mantener el Event Loop receptivo. | Bloqueo total de la API; todas las peticiones concurrentes sufren timeout. |
| **Evaluacion de SLOs (k6)** | Carga de 1,000 VUs concurrentes durante 5 minutos. | $p(95) < 250\text{ms}$ y tasa de errores $< 0.5\%$. | Degradacion de latencia o fallos masivos en produccion bajo trafico pico. |

---

## 2. Plantilla de Matriz de Casos Borde

Al auditar un modulo, genera la matriz en el siguiente formato:

```markdown
### Matriz de Casos Borde: [Nombre del Endpoint / Modulo]

| ID | Caso Borde / Escenario | Vector de Entrada | Precondiciones | Comportamiento Esperado | Codigo HTTP | Asercion Clave |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EC-01** | Doble gasto simultaneo | 2 x `POST /api/orders` con `stock=1` | Producto con stock=1 | 1 exito, 1 conflicto | 200 / 409 | `expect(res2.body.error.code).toBe('INSUFFICIENT_STOCK')` |
| **EC-02** | Desbordamiento numerico | `quantity: 9007199254740992` | N/A | Validacion de payload rechaza | 400 | `expect(res.body.details).toContain('MAX_SAFE_INTEGER')` |
| **EC-03** | Rollback por fallo downstream | Fallo simulado en pasarela de pago | Carrito con items | Base de datos revierte orden | 502 | `expect(await Order.count()).toBe(0)` |
```