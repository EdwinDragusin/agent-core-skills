# 02 · Nodo de Codigo (Code Node) en n8n

## JavaScript vs Python: Tabla Comparativa

| Caracteristica | JavaScript (Node.js) | Python (Nativo / Pyodide) |
|---|---|---|
| Acceso a datos en lote | `$input.all()` | `_input.all()` o `_items` |
| Funciones HTTP internas | `$helpers.httpRequest()` — completo | NO soportado — bloqueado por seguridad |
| Modulos externos | npm en auto-alojamiento via env vars | Sin librerias externas por defecto |
| JMESPath nativo | `$jmespath()` inyectado | No disponible — algoritmos manuales |
| Manipulacion temporal | Luxon (DateTime) integrado | Modulo `datetime` de stdlib |

**Directriz**: usar JavaScript para la inmensa mayoria de implementaciones. Python solo para logica que use exclusivamente stdlib (regex avanzado, operaciones matematicas, strings) sin requerir funciones de red internas de n8n.

---

## Estructura de Retorno Obligatoria

El error mas prevalente en Code Nodes: devolver tipos primitivos u objetos sin envolver.
El nodo de codigo DEBE retornar un arreglo de objetos con clave `json`:

```javascript
// CORRECTO
return items.map(item => ({
  json: {
    email: item.json.email,
    nombre: item.json.nombre
  }
}));

// INCORRECTO — n8n no puede propagar esto al siguiente nodo
// return { email: "foo@bar.com" };
// return "resultado";
```

---

## Modos de Ejecucion

### Run Once for All Items (Lote Completo)
- Cuando usarlo: agregacion de metricas, sumatorias, deduplicacion de registros cruzados.
- Acceso a datos: `$input.all()` devuelve un arreglo global completo.
- Permite `map()`, `reduce()`, `filter()` sobre toda la carga de trabajo.

```javascript
// Configurar nodo en: "Run Once for All Items"
const allItems = $input.all();
const total = allItems.reduce((sum, item) => sum + item.json.monto, 0);
const promedio = total / allItems.length;
return [{ json: { total, promedio, cantidad: allItems.length } }];
```

### Run Once for Each Item (Elemento Individual)
- Cuando usarlo: enriquecimiento lineal (concatenar campos, transformar tipos).
- Acceso a datos: `$json` — solo el item actual, sin visibilidad del conjunto.
- Limitacion: inutil para ordenar o deduplicar arreglos globales.

```javascript
// Ejecutado por cada item individualmente
return [{
  json: {
    nombreCompleto: `${$json.nombre} ${$json.apellido}`,
    emailNormalizado: $json.email.toLowerCase().trim(),
    fechaProcesado: new Date().toISOString()
  }
}];
```

---

## Acceso Correcto a Datos de Webhook

Error comun: intentar acceder a `$json.email` directamente en un webhook POST.
El motor de n8n anida estrictamente los datos del body HTTP bajo objeto secundario:

```javascript
// INCORRECTO — retorna undefined
const email = $json.email;

// CORRECTO — body HTTP siempre bajo .body
const email = $json.body.email;
const nombre = $json.body.usuario.nombre;  // JSON anidado
const authHeader = $json.headers['authorization'];
const filtro = $json.query.status;  // query params
```

---

## JMESPath para JSON Profundamente Anidado

Evitar bucles anidados fragiles con `$jmespath()`:

```javascript
// Extraer emails de estructura anidada
const emails = $jmespath($json, 'usuarios[*].contacto.email');

// Filtrar por condicion (backticks para literales en JMESPath)
const activos = $jmespath($json, 'usuarios[?estado==`activo`].nombre');

// Proyeccion — remap de campos
const datos = $jmespath($json, 'pedidos[*].{id: id, total: monto, cliente: cliente.nombre}');

// Ordenar y limitar (con funciones JMESPath)
const top3 = $jmespath($json, 'productos | sort_by(@, &precio) | [0:3]');
```

---

## Manipulacion Temporal con Luxon

Luxon se inyecta automaticamente — disponible sin importacion en Code Nodes JS:

```javascript
const { DateTime } = require('luxon'); // Tambien disponible como global

// Convertir string ISO a DateTime
const fecha = DateTime.fromISO($json.fechaCreacion);

// Aritmetica temporal
const hace7Dias = fecha.minus({ days: 7 });
const enUnMes = fecha.plus({ months: 1 });

// Diferencia entre fechas
const diasTranscurridos = Math.floor(fecha.diffNow('days').days * -1);

// Formateo con locale
const formatoFR = fecha.setLocale('fr').toFormat('dd LLL yyyy');
const formatoES = fecha.setLocale('es').toFormat('dd LLLL yyyy');

// Validar que una fecha no haya expirado
const estaVigente = DateTime.fromISO($json.expiracion) > DateTime.now();

return [{ json: { ...($json), diasTranscurridos, estaVigente, formatoES } }];
```

---

## Datos Estaticos de Flujo ($getWorkflowStaticData)

Para sincronizacion incremental — almacenar solo marcadores, nunca datos masivos:

```javascript
// Leer ultimo timestamp procesado
const staticData = $getWorkflowStaticData('global');
const ultimoProcesado = staticData.lastTimestamp || '2000-01-01T00:00:00Z';

// Usar ultimoProcesado como filtro en query SQL:
// SELECT * FROM tabla WHERE created_at > '{{ ultimoProcesado }}'

// Despues de procesar todos los items, actualizar el marcador
staticData.lastTimestamp = new Date().toISOString();

// PROHIBIDO: serializar arreglos de datos en staticData
// staticData.cache = allItems; // <- corrompe rendimiento del servidor
```

---

## Modulos npm en Auto-Alojamiento

Configurar via variable de entorno en el servidor n8n:

```env
NODE_FUNCTION_ALLOW_EXTERNAL=lodash,axios,date-fns,uuid
```

Uso en Code Node:
```javascript
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

const agrupados = _.groupBy($input.all().map(i => i.json), 'categoria');
return [{ json: { agrupados, id: uuidv4() } }];
```
