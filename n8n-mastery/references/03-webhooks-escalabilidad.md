# 03 · Webhooks, Escalabilidad y PostgreSQL en n8n

## Webhooks: Asíncrono vs Síncrono

### Comportamiento por Defecto (Asíncrono)
- n8n acusa recibo inmediato al cliente con respuesta genérica exitosa.
- La ejecución del árbol de nodos continúa **en segundo plano**.
- Adecuado para: recopilación de registros, notificaciones pasivas.

### Respuesta Calculada (Síncrono)
- Usar el nodo **"Respond to Webhook"** cuando el cliente requiere una confirmación calculada.
- Suspende el cierre de la conexión HTTP inicial.
- Espera que el flujo procese la lógica y devuelve payload personalizado al peticionario.

`
[Webhook] → [Consulta BD] → [Calcular ID validación] → [Respond to Webhook]
`

---

## Patrón Wait + Subflujos Paralelos

Para procesamiento paralelo intensivo (calificación concurrente de miles de registros):

**Problema**: invocar subflujos síncronos genera bloqueos en el hilo de ejecución.

**Solución**:
1. Flujo principal emite tareas → múltiples subflujos.
2. Flujo principal entra en **hibernación** (nodo Wait) → n8n libera CPU y memoria.
3. Cada subflujo, al finalizar, llama a la **ruta webhook única** del nodo Wait.
4. El flujo orquestador **se despierta** y sintetiza los resultados.

`
[Trigger] → [Dividir en lotes] → [Execute Workflow x N] → [Wait] ← (webhooks de subflujos)
                                                                    ↓
                                                            [Sintetizar resultados]
`

---

## Queue Mode: Escalabilidad Horizontal

### Cuándo Migrar
- Más de decenas de miles de ejecuciones diarias.
- Síntomas de colapso en modo regular: UI bloqueada, timeouts en webhooks, "JavaScript heap out of memory".

### Arquitectura Distribuida

| Componente | Rol |
|---|---|
| Servidor principal (main) | Interfaz gráfica + recepción de eventos (plano de control) |
| Workers | Ejecución computacional exclusiva (plano de datos) |
| Redis | Agente intermediario para asignación de trabajos (BullMQ) |
| PostgreSQL | Persistencia del estado transaccional |

### Tabla Comparativa: Regular vs Queue Mode

| Característica | Modo Regular | Queue Mode |
|---|---|---|
| Topología | Contenedor único auto-contenido | Sistema desacoplado (Redis + PostgreSQL) |
| Escalabilidad | Limitada por V8 single-thread | Horizontal — múltiples workers |
| Comportamiento ante picos | Latencia UI, rechazos, colapsos OOM | Encolamiento seguro, UI receptiva |
| Coste operacional | Mínimo — ideal para pymes/PoC | Alto — gestión de BD y monitoreo BullMQ |

### Anti-Patrón Crítico de Workers

**Suposición errónea**: más workers = más rendimiento.

**Realidad demostrada**: 8 workers con concurrencia baja → asedio masivo al connection pool de PostgreSQL → lock contention → sistema en bloqueo.

**Solución contraintuitiva**:
`
❌ 8 workers × concurrencia 2  →  bloqueo por contención
✅ 2-3 workers × concurrencia alta (ej. 20-50) → reutilización de conexiones de larga duración
`
Configurar via variable de entorno: N8N_CONCURRENCY_PRODUCTION_LIMIT

---

## PostgreSQL: Problemática JSONB

### El Problema
El nodo nativo de n8n clasifica erróneamente arreglos desnudos y tipos primitivos en columnas JSONB → fallos de inserción con mensajes de "literal de arreglo malformado".

### Solución 1: Pre-procesamiento con JSON.stringify()
`javascript
// En Code Node antes de la inserción
return [{
  json: {
    ...item.json,
    tags: JSON.stringify(item.json.tags), // arreglo → string serializado
  }
}];
`
Luego en el nodo PostgreSQL usar la expresión {{ .tags }}::jsonb.

### Solución 2: SQL Puro con Cast Explícito
`sql
INSERT INTO productos (nombre, metadata)
VALUES (
  '{{ .nombre }}',
  '{{ .metadata }}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  metadata = EXCLUDED.metadata::jsonb;
`

---

## Sincronización Incremental con Static Data

`javascript
// Patrón eficiente: solo descargar registros nuevos
const staticData = \('global');
const desde = staticData.lastSync || '1970-01-01T00:00:00Z';

// Query: SELECT * FROM tabla WHERE created_at > '{{ desde }}'
// Después de procesar:
staticData.lastSync = new Date().toISOString();
`

**⚠️ Prohibido** serializar arreglos de datos en staticData → latencias extremas.
