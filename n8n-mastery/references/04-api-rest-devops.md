# 04 · API REST de n8n y DevOps

## Anatomia del JSON de un Flujo n8n

Un flujo exportado es un documento JSON con estos elementos raiz:

```json
{
  "name": "Nombre del Flujo",
  "nodes": [],
  "connections": {},
  "settings": {},
  "staticData": null
}
```

### Estructura de un Nodo
```json
{
  "id": "uuid-unico",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [240, 300],
  "parameters": {
    "url": "https://api.ejemplo.com/datos",
    "method": "GET"
  },
  "credentials": {
    "nombreCredencial": { "id": "cred-id", "name": "Mi Credencial" }
  }
}
```

### Estructura de Connections
El campo `connections` es un diccionario que mapea nodo origen -> puertos -> nodos destino, construyendo matematicamente el grafo dirigido que el motor evalua en tiempo de ejecucion.

NOTA DE SEGURIDAD: los exports de flujos se despojan completamente de material criptografico. Las credenciales deben reasignarse manualmente o mediante la API tras la importacion.

---

## API REST Publica de n8n

### Autenticacion
- Header: X-N8N-API-KEY: <tu-api-key>
- Base URL: https://tu-instancia.n8n.cloud/api/v1/
- Disponible en instancias enterprise y auto-alojadas.

### Endpoints Criticos

| Metodo | Ruta | Accion |
|---|---|---|
| GET | /workflows | Listar todos los flujos |
| GET | /workflows/{id} | Obtener flujo especifico |
| POST | /workflows | Crear flujo nuevo desde JSON |
| PUT | /workflows/{id} | Actualizar flujo existente |
| DELETE | /workflows/{id} | Eliminar flujo |
| POST | /workflows/{id}/activate | Activar flujo |
| POST | /workflows/{id}/deactivate | Desactivar flujo |
| GET | /executions | Historial de ejecuciones |
| GET | /executions/{id} | Detalle de ejecucion |
| GET | /credentials | Listar credenciales (sin secretos) |

### Ejemplo: Crear y Activar Flujo via API (bash)

```bash
# 1. Crear el flujo
WORKFLOW_ID=$(curl -s -X POST https://instancia.n8n.cloud/api/v1/workflows \
  -H "X-N8N-API-KEY: $KEY" \
  -H "Content-Type: application/json" \
  -d @flujo.json | jq -r ".id")

# 2. Activar
curl -X POST "https://instancia.n8n.cloud/api/v1/workflows/${WORKFLOW_ID}/activate" \
  -H "X-N8N-API-KEY: $KEY"
```

---

## CI/CD: Despliegue Sin Intervencion Humana

### Flujo Recomendado
1. Validar JSON del flujo (lint/schema)
2. POST /workflows (crear) o PUT /workflows/{id} (actualizar)
3. Asignar credenciales via API
4. Activar flujo
5. Verificar estado de activacion

### Variables de Entorno Criticas

```env
N8N_ENCRYPTION_KEY=<clave-256-bits-aleatoria>
N8N_BASIC_AUTH_ACTIVE=true
N8N_HOST=tu-dominio.com
N8N_PROTOCOL=https
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=<password-seguro>
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=redis
NODE_FUNCTION_ALLOW_EXTERNAL=lodash,axios
```

---

## Auditoria Programatica de Flujos

Extraer todos los flujos y verificar configuracion de error handler:

```javascript
const response = await fetch("/api/v1/workflows", {
  headers: { "X-N8N-API-KEY": apiKey }
});
const { data: flujos } = await response.json();

const sinErrorHandler = flujos.filter(f => !f.settings?.errorWorkflow);
console.log("Flujos sin error handler:", sinErrorHandler.map(f => f.name));
```
