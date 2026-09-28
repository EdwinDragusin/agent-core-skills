# 06 · Agentes IA y Protocolo MCP en n8n

## Topologia de Conexion para Agentes LangChain

Los agentes IA en n8n usan puertos de conexion especializados, distintos al flujo principal:

| Puerto | Rol | Ejemplos de nodos conectables |
|---|---|---|
| `ai_languageModel` | Nucleo de procesamiento matematico (LLM) | OpenAI, Anthropic Claude, modelos locales via OpenRouter |
| `ai_memory` | Retencion contextual persistente | Buffer Memory, Redis Memory, Postgres Memory |
| `ai_tool` | Herramientas invocables por la IA | Cualquier nodo conector (Salesforce, PostgreSQL, HTTP, etc.) |

### Esquema de Conexion

```
[AI Agent]
   ├── ai_languageModel ← [OpenAI Chat Model]
   ├── ai_memory       ← [Window Buffer Memory]
   └── ai_tool         ← [PostgreSQL Node] (con descripcion de la herramienta)
   └── ai_tool         ← [HTTP Request] (con descripcion de la herramienta)
```

---

## Tipos de Memoria Disponibles

| Tipo | Persistencia | Caso de Uso |
|---|---|---|
| Window Buffer Memory | En memoria (efimera) | Conversaciones cortas, PoC |
| Redis Memory | Redis externo | Produccion, alta disponibilidad |
| Postgres Memory | PostgreSQL | Produccion, auditoria de historial |
| Zep Memory | Zep server | Memoria semantica a largo plazo |

---

## RAG con Supabase Vector Store (pgvector)

Flujo de ingestión de documentos:

```
[Archivo/URL] → [Split en chunks] → [Embeddings (OpenAI/OpenRouter)] → [Supabase Vector Store Insert]
```

Flujo de recuperacion (agente RAG):

```
[Chat Trigger] → [AI Agent]
                     └── ai_tool ← [Supabase Vector Store Retrieve]
                                      (busqueda de similitud semantica)
```

### Configuracion de Supabase Vector Store
- Usar la extension `pgvector` en PostgreSQL.
- El nodo acepta embeddings de dimension configurable (text-embedding-3-small: 1536 dims).
- Los resultados se rankean por similitud coseno automaticamente.

---

## Transformar Cualquier Nodo en Herramienta de IA

1. Conectar el nodo al puerto `ai_tool` del AI Agent.
2. El sistema inyecta en el LLM la descripcion del nodo como especificacion de funcion.
3. El LLM decide autonomamente si activar la herramienta y que parametros suministrar.

**Mejor practica**: proporcionar descripciones muy claras en el nodo sobre que hace y que parametros espera, para que el LLM tome decisiones correctas.

---

## Servidores MCP para n8n

Los servidores MCP permiten a asistentes agentes externos (Claude Desktop, Cursor, etc.) operar sobre instancias n8n.

### Implementaciones de la Comunidad
- `czlonkowski/n8n-mcp` — acceso completo de administracion
- `get2knowio/n8n-mcp` — orientado a discovery de nodos
- `leonardsellem/n8n-mcp` — gestion de flujos y ejecuciones

### Capacidades Expuestas por MCP

**Indexacion de Nodos**
- Acceso enciclopedico a la BD completa de nodos nativos y comunitarios.
- Propiedades de configuracion y arquitecturas de interconexion correctas.

**Evaluacion y Linting**
```
workflow_lint   → detecta puertos huerfanos, componentes obsoletos, expresiones JS mal formuladas
execution_explain → analiza fallos invisibles en el historial de ejecuciones
```

**Sintesis de Flujos en Lenguaje Natural**
- El agente ensambla el JSON completo de un flujo desde una descripcion.
- Usa `create_workflow` o REST PUT/POST para instanciar en el servidor real.
- Puede activar y probar el flujo automaticamente.

---

## Gobernanza y Seguridad de Agentes MCP

RIESGO CRITICO: delegar autoridad ejecutiva sobre infraestructuras a modelos probabilisticos.

Un error de alucinacion puede:
- Generar y activar un webhook sin autenticacion.
- Alterar estructuras de actualizacion de BD criticas.
- Desplegar codigo no auditado en el nucleo transaccional.

### Directrices Mandatorias

1. **Deshabilitar activacion automatica** de flujos generados por IA — confinamiento a entornos de revision humana.
2. **Tokens MCP con permisos de solo lectura** siempre que sea operativamente viable.
3. **Ambiente separado** de staging para toda prueba de flujos generados por IA.
4. **Revision obligatoria** del JSON generado antes de despliegue en produccion.
5. **Audit log** de todas las operaciones realizadas via MCP sobre la instancia.
