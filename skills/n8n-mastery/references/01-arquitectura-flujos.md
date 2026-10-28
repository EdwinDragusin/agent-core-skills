# 01 · Arquitectura y Diseño de Flujos n8n

## Principio de Responsabilidad Única

- Cada flujo debe ejecutar **una sola tarea discreta y describible**.
- La lógica reutilizable se delega a **subflujos** mediante el nodo *Execute Workflow*.
- Construir repositorios de submódulos con interfaces de entrada/salida estrictas para pruebas unitarias aisladas.
- **Anti-patrón crítico**: flujos monolíticos con decenas de nodos encadenados → acoplamiento extremo, fallos en cadena, incorporación lenta de nuevos ingenieros.

---

## Metodología de Ciclo de Vida

`
Planificación → Aislamiento (env staging) → Validación temprana → Pruebas de estrés → Revisión de pares → Despliegue
`

### Validación Temprana (Fail Fast)
- Aplicar comprobación exhaustiva de esquemas en los **puntos de entrada** del flujo.
- Verificar campos obligatorios y tipos antes de que los datos fluyan a sistemas dependientes.
- Registros inválidos → cuarentena inmediata, no propagación.

### Ingeniería del Caos (pre-despliegue)
- Simular respuestas de API vacías → verificar que los bucles no colapsen.
- Inyectar payloads de tamaño máximo → evaluar consumo de memoria.
- Interceptar conectividad de red → verificar recuperación.
- **Condición de despliegue en producción**: revisión de código por pares + plan de reversión documentado y funcional.

---

## Arquitectura de Resiliencia y Manejo de Errores

### Comportamiento por Defecto (Peligroso)
El motor detiene la ejecución y marca la transacción como fallida en el primer error de nodo → inconsistencias silenciosas de datos.

### Capas Defensivas

**1. Retroceso Exponencial (Fallos Transitorios)**
- Activar lógica de reintento nativa en nodos de red.
- Configurar escalonado: 2s → 4s → 8s.
- Casos de uso: fluctuaciones de red, timeouts de API externas.

**2. Continuación ante Fallos (Operaciones No Críticas)**
- Habilitar "Continue on Fail" cuando el nodo ejecuta enriquecimiento opcional.
- El nodo emite un objeto de error en lugar de detener el flujo.
- Nodos condicionales posteriores evalúan si se requiere ruta de degradación elegante.

**3. Error Trigger Global (Errores Críticos)**
- Cada flujo de producción debe vincularse a un **flujo de manejo de errores predeterminado**.
- El flujo de error recibe: ID de correlación, traza de pila, enlace visual al fallo.
- Acciones: registrar en sistema de observabilidad externo + alertar al equipo de guardia.

**4. Circuit Breakers (Agentes y Bucles)**
- Contar ejecuciones recientes; detener el flujo si se supera un umbral anómalo de transacciones/minuto.
- Prevenir ciclos infinitos que agoten cuotas de API.

---

## Tabla: Estrategias por Código HTTP

| Código HTTP | Naturaleza | Estrategia |
|---|---|---|
| 5xx (500/502/503) | Error transitorio del servidor | Reintentos con retroceso exponencial |
| 401 / 403 | Autenticación inválida/caducada | Pausar → invocar subflujo de refresh de token → reintentar |
| 422 / 400 | Datos malformados / esquema inválido | Fallar rápido sin reintentos → revisión manual → notificar |
| 429 | Rate limit excedido | Leer cabeceras Reset-Time → nodo Wait → reintentar |

---

## Observabilidad y KPIs

Integrar con **Grafana** (u herramienta equivalente). Métricas críticas:

| Métrica | Por qué importa |
|---|---|
| Tasa de ejecución (throughput) | Rendimiento global a lo largo del tiempo |
| Tasa de errores por flujo | Detección granular de regresiones |
| P95 de tiempo de ejecución | Identificar latencias ocultas |
| Profundidad de cola | Advertencia temprana de problemas de capacidad |
