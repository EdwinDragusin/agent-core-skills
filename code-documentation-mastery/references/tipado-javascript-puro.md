# Expresividad Exhaustiva de Tipos para JavaScript Puro

> Nota: Esta referencia aplica a proyectos JavaScript puro sin TypeScript. En proyectos TypeScript nativo, los tipos se definen con sintaxis TS y estas etiquetas son redundantes.

## Tabla de Patrones de Tipado

| Patron | Sintaxis | Uso |
|:---|:---|:---|
| Primitivo | `{string}` / `{number}` / `{boolean}` | Tipos intrinsecos ECMAScript |
| Objeto nativo | `{Promise<T>}` / `{Map<K,V>}` | Enlaza auto a MDN |
| Parametro opcional | `{number} [timeout]` | El nombre entre `[]` |
| Valor por defecto | `{number} [timeout=2000]` | Mapea a parametros ES6 |
| Union | `{(string\|string[])} target` | Polimorfismo de entrada |
| Nulable | `{?number} count` | Valor o `null` |
| No nulo forzado | `{!Object} ref` | Contrato no nulo |
| Arreglo tipado | `{User[]}` / `{Array.<User>}` | Homogeneo |
| Desestructuracion | `{Object} opts` + `{string} opts.url` | Objeto de configuracion |
| Variadic (rest) | `{...number} operands` | Numero indefinido de args |
| Generico | `{T}` con `@template T` | Programacion generica |
| Funcion de orden | `@callback` + `@param` en bloque separado | Callbacks tipados |

## Parametros, Retorno y Excepciones

```javascript
/**
 * Solicita datos a la API con reintentos automaticos.
 *
 * @param {string} endpoint - URL relativa del recurso (ej. '/usuarios').
 * @param {Object} [opciones] - Configuracion opcional de la solicitud.
 * @param {number} [opciones.intentos=3] - Numero maximo de reintentos.
 * @param {number} [opciones.timeout=5000] - Milisegundos antes de abortar.
 * @returns {Promise<RespuestaAPI>} Promesa que resuelve con la respuesta normalizada.
 * @throws {ErrorRed} Si se agotan los reintentos o el servidor devuelve 5xx.
 * @since 2.1.0
 */
async function solicitarDatos(endpoint, opciones) { ... }
```

## Tipos Personalizados con @typedef

```javascript
/**
 * Perfil completo de un usuario registrado en el sistema.
 *
 * @typedef {Object} PerfilUsuario
 * @property {string} id - UUID v7 generado por el sistema.
 * @property {string} nombre - Nombre completo sin abreviaturas.
 * @property {number} edad - Edad en anos cumplidos al momento del registro.
 * @property {('activo'|'suspendido'|'baja')} estado - Estado actual en el proceso.
 */
```

## Callbacks Tipados con @callback

```javascript
/**
 * Funcion invocada al completar la validacion de un expediente.
 *
 * @callback CallbackValidacion
 * @param {Error|null} error - Error si la validacion fallo, null si fue exitosa.
 * @param {ResultadoValidacion} resultado - Detalles del dictamen emitido.
 */
```
