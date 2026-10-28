# Catálogo de Heurísticas y Taxonomía de Casos Borde (Edge Cases)

Catálogo exhaustivo para el diseño de casos de prueba y matrices de riesgo en aplicaciones web fullstack (Express, React, Sequelize, PostgreSQL/MySQL).

---

## 1. Taxonomía de Heurísticas de Casos Borde

Al analizar cualquier endpoint, modelo o servicio de negocio, aplica las siguientes 5 dimensiones de análisis:

```
                  ┌──────────────────────────────────────────────┐
                  │          TAXONOMÍA DE CASOS BORDE            │
                  ├──────────────────────────────────────────────┤
                  │ 1. Frontera de Datos & Precisión Numérica    │
                  │ 2. Mutación de Estado & Concurrencia (Race)  │
                  │ 3. Deriva de Contratos & Frontera Cliente    │
                  │ 4. Resiliencia & Inyección de Fallos         │
                  │ 5. Rendimiento, Límites & Saturación         │
                  └──────────────────────────────────────────────┘
```

---

### Dimensión 1: Frontera de Datos y Precisión Numérica

| Heurística | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Típico |
| :--- | :--- | :--- | :--- |
| **Desbordamiento Seguro** | Números $> 2^{53} - 1$ (`9,007,199,254,740,991` o `Number.MAX_SAFE_INTEGER`). | Rechazar con error 400 o procesar como `BigInt` / `DataTypes.BIGINT`. | Corrupción silenciosa de identificadores o montos financieros en JS. |
| **Cero y Negativos** | Montos `= 0`, `-0.01`, `-Infinity`, `NaN`. | Rechazo estricto con código 422/400. | Saldos inflados, recargas inversas o cobros negativos. |
| **Precisión Decimal** | Cálculos de punto flotante `0.1 + 0.2` ($0.30000000000000004$). | Uso de `DataTypes.DECIMAL(10, 2)` o librerías de precisión fija (`decimal.js`). | Pérdida de centavos en liquidaciones o redondeos inconsistentes. |
| **Cadenas y Whitespace** | `""` (vacío), `"   "` (solo espacios), cadenas de 10,000 caracteres, emojis multi-byte (UTF-8 4-byte). | Sanitización con trim, validación de longitud máxima y codificación `utf8mb4`/UTF-8. | Errores de truncamiento en BD o campos requeridos aceptados con espacios. |
| **Tipado Estricto vs Coerción** | Enviar `"123"` o `true` en campos tipados como `STRING` o `INTEGER`. | Sequelize v7 y validadores de middleware deben exigir tipado estricto sin coerción implícita. | Errores de validación en tiempo de ejecución o conversiones no deseadas. |
| **Fechas y Zonas Horarias** | Fechas en formatos ambiguos (`02/03/2026`), fechas bisiestas (`29-Feb-2024`), transiciones DST, timestamps sin UTC offset. | Exigir ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) y persistencia en UTC (`TIMESTAMPTZ`). | Desfases de 1 día en reportes entre el cliente React y la base de datos. |

---

### Dimensión 2: Mutación de Estado y Concurrencia (Race Conditions)

| Heurística | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Típico |
| :--- | :--- | :--- | :--- |
| **Doble Gasto / Reserva Concurrente** | 2 o más peticiones simultáneas consumiendo el último recurso disponible (stock = 1, balance = 100). | Una sola petición tiene éxito; las demás son rechazadas atómicamente con error 409 Conflict. | Sobreventa (over-selling), saldo negativo o duplicidad de transacciones. |
| **Bloqueo Pesimista (`FOR UPDATE`)** | Petición B intenta leer/mutar fila bloqueada por Petición A dentro de una transacción activa. | Petición B espera a que Petición A ejecute commit o rollback (`transaction.LOCK.UPDATE`). | Lectura de datos sucios (Dirty Reads) o actualizaciones perdidas (Lost Updates). |
| **Idempotencia de Peticiones** | El cliente reintenta un `POST /api/payments` idéntico tras un timeout de red. | Header `Idempotency-Key` procesa el pago una sola vez y devuelve el resultado guardado. | Cobro duplicado al usuario. |
| **Fallo a Mitad de Transacción** | La inserción en `Orders` es exitosa, pero falla la inserción en `OrderItems` o el descuento de saldo. | `sequelize.transaction` ejecuta `rollback` completo; ninguna tabla queda mutada. | Estados huérfanos o inconsistencia en la base de datos relacional. |

---

### Dimensión 3: Deriva de Contratos y Frontera Cliente (React <-> Express)

| Heurística | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Típico |
| :--- | :--- | :--- | :--- |
| **Colecciones Vacías vs Pobladas** | Endpoint de lista devuelve `[]` en lugar de omitir la propiedad o devolver `null`. | React recibe `[]` seguro para `.map()` sin lanzar `TypeError: undefined is not a function`. | Pantalla blanca / crash de la interfaz en React. |
| **Renombramiento de Propiedades** | Backend cambia `user_name` a `username` o `firstName`. | Pruebas de contrato Pact detectan la discrepancia en CI antes del despliegue (`can-i-deploy`). | UI muestra valores en blanco (`undefined`) sin arrojar error HTTP. |
| **Estructura Uniforme de Errores** | Errores 4xx/5xx emiten un esquema estándar `{ error: { code, message, details } }`. | Los interceptores de Axios/TanStack Query en React capturan el error de forma predecible. | Manejadores de error en React fallan al intentar leer `error.response.data.message`. |
| **Campos Opcionales Nulos** | Propiedades opcionales se devuelven como `null` o se omiten en JSON. | El contrato Pact valida la presencia de tipos permisibles mediante `MatchersV3.like()`. | Componentes de React que no usan *Optional Chaining* (`user?.profile?.avatar`) colapsan. |

---

### Dimensión 4: Resiliencia e Inyección de Fallos

| Heurística | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Típico |
| :--- | :--- | :--- | :--- |
| **Caída de Servicio Externo** | Pasarela de pago o webhook downstream no responde o devuelve 500. | Circuit breaker / timeout rápido con error manejado 502/504 y reversión de transacción en BD. | Peticiones HTTP colgadas en Express agotando los sockets del servidor. |
| **Agotamiento del Pool de BD** | Concurrencia supera el `pool.max` configurado en Sequelize. | Cola de espera respetando `pool.acquire` timeout con mensaje de error controlado (no crash). | `ConnectionAcquireTimeoutError` no capturado provoca caída no recuperable de la app. |
| **Inyección SQL / JSON Malformado** | Enviar `{ "$gt": "" }` o payloads con caracteres de escape en parámetros de Sequelize. | Uso estricto de `bind` parameters y deshabilitación de operadores peligrosos en Sequelize. | Extracción no autorizada de datos o bypass de autenticación. |

---

### Dimensión 5: Rendimiento, Límites y Saturación

| Heurística | Vector de Entrada / Escenario | Comportamiento Esperado | Riesgo / Bug Típico |
| :--- | :--- | :--- | :--- |
| **Problema de Consulta $N+1$** | Consultar 50 órdenes y recuperar sus items iterando en un bucle `Promise.all(orders.map(...))`. | Una sola consulta con `include: [{ model: OrderItem }]` o batching estructurado. | Degradación exponencial de latencia bajo carga real. |
| **Saturación del Event Loop** | Procesamiento de arreglos gigantes (100k elementos) o regex catastróficas (*ReDoS*) en Express. | Delegación a Worker Threads o streaming para mantener el Event Loop receptivo. | Bloqueo total de la API; todas las peticiones concurrentes sufren timeout. |
| **Evaluación de SLOs (k6)** | Carga de 1,000 VUs concurrentes durante 5 minutos. | $p(95) < 250\text{ms}$ y tasa de errores $< 0.5\%$. | Degradación de latencia o fallos masivos en producción bajo tráfico pico. |

---

## 2. Plantilla de Matriz de Casos Borde

Al auditar un módulo, genera la matriz en el siguiente formato:

```markdown
### Matriz de Casos Borde: [Nombre del Endpoint / Módulo]

| ID | Caso Borde / Escenario | Vector de Entrada | Precondiciones | Comportamiento Esperado | Código HTTP | Aserción Clave |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EC-01** | Doble gasto simultáneo | 2 x `POST /api/orders` con `stock=1` | Producto con stock=1 | 1 éxito, 1 conflicto | 200 / 409 | `expect(res2.body.error.code).toBe('INSUFFICIENT_STOCK')` |
| **EC-02** | Desbordamiento numérico | `quantity: 9007199254740992` | N/A | Validación de payload rechaza | 400 | `expect(res.body.details).toContain('MAX_SAFE_INTEGER')` |
| **EC-03** | Rollback por fallo downstream | Fallo simulado en pasarela de pago | Carrito con items | Base de datos revierte orden | 502 | `expect(await Order.count()).toBe(0)` |
```