# 05 · Nodos Personalizados en TypeScript

## Cuándo Crear un Nodo Personalizado

- Sistemas legados o APIs propietarias no cubiertas por integraciones nativas.
- Mecanismos de firma complejos (HMAC-SHA1, OAuth 1.0a).
- Estandarizacion estricta de formatos de entrada/salida.
- Reemplazar multiples Code Nodes propensos a errores por una abstraccion formal.

---

## Setup Inicial con n8n/node-cli

```bash
npx @n8n/node-cli new
# Responder prompts: nombre, descripcion, tipo (regular/trigger)
# Genera estructura:
# my-node/
#   src/
#     nodes/MyNode/
#       MyNode.node.ts
#       MyNode.node.json    # icono opcional
#     credentials/
#       MyNodeApi.credentials.ts
#   package.json
#   tsconfig.json
```

---

## Arquitectura Declarativa (RESTful Estandar)

Para APIs REST bien documentadas — sin bloque `execute()`, maxima mantenibilidad:

```typescript
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MiApiNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Mi API',
    name: 'miApi',
    group: ['transform'],
    version: 1,
    description: 'Interactua con Mi API',
    defaults: { name: 'Mi API' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      { name: 'miApiCredentials', required: true }
    ],
    requestDefaults: {
      baseURL: 'https://api.midominio.com/v1',
      headers: { Accept: 'application/json' }
    },
    properties: [
      {
        displayName: 'Operacion',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Obtener Usuario', value: 'getUser', action: 'Obtener usuario por ID' }
        ],
        default: 'getUser'
      },
      {
        displayName: 'ID de Usuario',
        name: 'userId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { operation: ['getUser'] } }
      }
    ],
    // Mapeo declarativo: parametros → HTTP request
    routing: {
      request: {
        method: 'GET',
        url: '=/users/{{$parameter.userId}}'
      }
    }
  };
}
```

Ventaja: inmune a roturas de compatibilidad tras actualizaciones del nucleo de n8n.

---

## Arquitectura Programatica (Logica Compleja)

Para triggers, librerias externas, protocolos no-REST (GraphQL, OData, WebSocket):

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError
} from 'n8n-workflow';
import * as crypto from 'crypto';

export class MiNodoComplejo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Mi Nodo Complejo',
    name: 'miNodoComplejo',
    group: ['transform'],
    version: 1,
    description: 'Nodo con firma HMAC-SHA256',
    defaults: { name: 'Mi Nodo Complejo' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'miApiCredentials', required: true }],
    properties: [
      {
        displayName: 'Payload',
        name: 'payload',
        type: 'string',
        default: ''
      }
    ]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Obtener credenciales del gestor criptografico
    const credentials = await this.getCredentials('miApiCredentials');

    for (let i = 0; i < items.length; i++) {
      try {
        const payload = this.getNodeParameter('payload', i) as string;

        // Logica de firma HMAC-SHA256
        const firma = crypto
          .createHmac('sha256', credentials.secretKey as string)
          .update(payload)
          .digest('hex');

        const respuesta = await this.helpers.httpRequest({
          method: 'POST',
          url: `${credentials.baseUrl}/endpoint`,
          headers: {
            'X-Signature': firma,
            'Content-Type': 'application/json'
          },
          body: { payload, firma }
        });

        // Empaquetar resultado en estructura esperada por n8n
        returnData.push({ json: respuesta });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
```

---

## Descriptores de Credenciales

```typescript
import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MiApiCredentials implements ICredentialType {
  name = 'miApiCredentials';
  displayName = 'Mi API Credentials';
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.midominio.com'
    },
    {
      displayName: 'Secret Key',
      name: 'secretKey',
      type: 'string',
      typeOptions: { password: true },
      default: ''
    }
  ];
}
```

---

## Compilacion y Publicacion

```bash
# Compilar TypeScript
npm run build

# Probar localmente — enlazar con instancia n8n local
npm link
cd ~/.n8n/custom
npm link mi-paquete-nodo

# package.json — metadato OBLIGATORIO para registro
{
  "name": "n8n-nodes-mi-paquete",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/MiApiCredentials.credentials.js"],
    "nodes": ["dist/nodes/MiNodo/MiNodo.node.js"]
  }
}

# Publicar en npm
npm publish
```
