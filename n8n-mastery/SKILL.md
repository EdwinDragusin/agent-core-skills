---
name: n8n-mastery
description: >-
  Arquitectura, desarrollo y mejores practicas avanzadas para la plataforma de
  automatizacion n8n. Activar cuando el usuario trabaje con flujos de n8n,
  nodos de codigo, agentes IA, webhooks, nodos personalizados (TypeScript),
  API REST de n8n, modo cola (Queue Mode), integraciones PostgreSQL/Supabase,
  servidores MCP de n8n, o necesite guia sobre resiliencia, seguridad y
  escalabilidad de instancias n8n.
---

# n8n Mastery

Guia de arquitectura sostenible, desarrollo programatico y operacion segura de
instancias n8n en produccion. Leer el archivo de referencia relevante antes de
responder cualquier pregunta especifica de dominio.

---

## Arbol de Referencias

| Dominio | Cuando leerlo |
|---|---|
| [Arquitectura y Diseno de Flujos](./references/01-arquitectura-flujos.md) | Modularidad, subflujos, resiliencia, manejo de errores, circuit breakers, observabilidad |
| [Nodo de Codigo (Code Node)](./references/02-code-node.md) | JS vs Python, modos de ejecucion, estructuras de retorno, webhooks, JMESPath, Luxon |
| [Webhooks y Escalabilidad](./references/03-webhooks-escalabilidad.md) | Webhooks sincronos/asincronos, nodo Wait, Queue Mode, workers, PostgreSQL, JSONB |
| [API REST y DevOps](./references/04-api-rest-devops.md) | Esquema JSON de flujos, API REST, CI/CD, importacion programatica, credenciales |
| [Nodos Personalizados TypeScript](./references/05-custom-nodes.md) | Arquitectura declarativa vs programatica, INodeType, IExecuteFunctions, empaquetado npm |
| [Agentes IA y MCP](./references/06-agentes-ia-mcp.md) | LangChain en n8n, ai_tool/ai_memory/ai_languageModel, servidores MCP, RAG, Supabase Vector |
| [Seguridad y Zero Trust](./references/07-seguridad.md) | CVEs documentados, sandbox escape, Zero Trust, gestion de secretos, hardening |

---

## Diagnostico Rapido

1. El flujo falla silenciosamente → manejo de errores en 01-arquitectura-flujos.md
2. Code Node no retorna datos → verificar estructura [{ json: {} }] en 02-code-node.md
3. Webhook no devuelve respuesta calculada → agregar "Respond to Webhook" en 03-webhooks-escalabilidad.md
4. Instancia colapsa bajo carga → migrar a Queue Mode en 03-webhooks-escalabilidad.md
5. Insercion JSONB falla en PostgreSQL → JSON.stringify() + cast ::jsonb en 03-webhooks-escalabilidad.md
6. Agente IA sin memoria persistente → conectar nodo al puerto ai_memory en 06-agentes-ia-mcp.md
7. Vulnerabilidad de sandbox o RCE → actualizar instancia + hardening en 07-seguridad.md
