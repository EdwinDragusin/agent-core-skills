# Paradigmas Modernos y Agrupacion Logica

## Funciones Asincronas y Generadores

```javascript
/**
 * Genera tokens de sesion de forma iterativa para multiples administradores.
 *
 * @async
 * @generator
 * @yields {TokenSesion} Token firmado con HS256 listo para entregar al cliente.
 * @param {string[]} listaAdmins - IDs de los administradores a procesar.
 */
async function* generarTokens(listaAdmins) { ... }
```

## Ciclo de Vida de la API

```javascript
/**
 * Autentica al usuario con credenciales de acceso basicas.
 *
 * @since 1.0.0
 * @deprecated Desde 3.0.0. Usar {@link autenticarConMFA} que incluye segundo factor.
 *     Sera eliminado en la version 4.0.0.
 */
function autenticarUsuario(credenciales) { ... }
```

## Clases, Herencia y Eventos (OOP)

```javascript
/**
 * Agregado raiz del dominio de postulaciones.
 *
 * @class
 * @extends AgregadoRaiz
 * @fires Postulacion#estado-cambiado
 */
class Postulacion extends AgregadoRaiz {
  /**
   * Identificador del usuario asociado a esta postulacion.
   *
   * @type {string}
   * @private
   */
  #usuarioId;

  /**
   * Aprueba la postulacion y emite el evento de cambio de estado.
   *
   * @param {string} motivoAprobacion - Justificacion del dictamen favorable.
   * @fires Postulacion#estado-cambiado
   * @throws {ExcepcionDominio} Si la postulacion ya fue dictaminada previamente.
   */
  aprobar(motivoAprobacion) { ... }
}

/**
 * Evento emitido cuando el estado de una postulacion cambia.
 *
 * @event Postulacion#estado-cambiado
 * @type {Object}
 * @property {string} estadoAnterior - Estado previo al cambio.
 * @property {string} estadoNuevo - Estado resultante del dictamen.
 */
```

## Mixins y Composicion

```javascript
/**
 * Mixin que agrega capacidades de bitacora de auditoria a cualquier clase.
 *
 * @mixin
 */
const BitacoraMixin = { ... };

/**
 * Repositorio de expedientes con trazabilidad de auditoria incluida.
 *
 * @mixes BitacoraMixin
 */
class RepositorioExpediente { ... }
```

## Agrupacion Logica y Modularizacion

### Namespaces, @module y Encabezado de Archivo

```javascript
/**
 * @file Adaptadores HTTP para el consumo de la API REST de expedientes.
 * @fileoverview Este modulo implementa los adaptadores de infraestructura que
 *     transforman las respuestas de la API gubernamental al modelo de dominio
 *     interno, aislando el resto del sistema de cambios en el contrato externo.
 */

/**
 * Modulo de procesamiento de convocatorias gubernamentales.
 *
 * @module convocatoria
 */

/**
 * Contenedor logico para operaciones de administracion del proceso de seleccion.
 *
 * @namespace AdministracionSeleccion
 */

/**
 * Valida los criterios de admision de un usuario a una convocatoria especifica.
 *
 * @memberof AdministracionSeleccion
 * @param {PerfilUsuario} usuario - Perfil completo del candidato.
 * @returns {ResultadoAdmision} Dictamen de admisibilidad con justificacion.
 */
function validarAdmision(usuario) { ... }
```

### Ejemplos y Tutoriales

```javascript
/**
 * Procesa la solicitud institucional de extremo a extremo.
 *
 * @example <caption>Caso basico: solicitud simple</caption>
 * const resultado = await procesarSolicitud({ entidades: ['ORG-A'], tipo: 'general' });
 * console.log(resultado.folio); // 'SOL-2026-0042'
 *
 * @example <caption>Caso avanzado: solicitud con validacion estricta</caption>
 * const resultado = await procesarSolicitud(
 *   { entidades: ['ORG-A', 'ORG-B'], tipo: 'especifico' },
 *   { validacionEstricta: true, intentos: 5 }
 * );
 *
 * @tutorial guia-solicitudes-institucionales
 */
async function procesarSolicitud(datos, opciones) { ... }
```

### Diagramas Mermaid en Flujos Complejos

Para flujos con mas de 3 estados o transiciones, incrustar Mermaid en la descripcion:

```javascript
/**
 * Orquesta el pipeline completo de evaluacion de criterios.
 *
 * Flujo de estados:
 * ```mermaid
 * stateDiagram-v2
 *   [*] --> Recibido
 *   Recibido --> EnRevision
 *   EnRevision --> Aprobado : dictamen favorable
 *   EnRevision --> Rechazado : criterios no cumplidos
 * ```
 */
function evaluarCriterios(expediente) { ... }
```
