# Manifiesto de Capa - Dominio

Directrices operacionales para entidades, objetos de valor y logica pura del dominio.

---

## 1. Reglas Inviolables de Capa

<!-- [ESTANDAR] -->

- **Aislamiento absoluto**: `dominio/` importa unicamente de `dominio/`.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Cero dependencias externas**: prohibido importar librerias npm, frameworks o modulos de
  infraestructura.
  <!-- verifica: back/tests/arquitectura/dependencias.test.ts -->
- **Inmutabilidad en Value Objects**: todo Value Object debe ser inmutable (`Object.freeze`) y
  exponer factory estatica `crear()`.
  <!-- verifica: back/tests/arquitectura/valueObjects.test.ts -->
- **Herencia de Entidades**: toda entidad o sub-entidad debe extender obligatoriamente `Entidad` o
  `AgregadoRaiz`.
  <!-- verifica: back/tests/arquitectura/entidades.test.ts -->
- **Centralizacion de UUID**: identificadores unicos deben generarse exclusivamente con
  `generarUuid()`. Prohibido `crypto.randomUUID()`.
  <!-- verifica: back/tests/arquitectura/uuid.test.ts -->

---

## 2. Recetas Estandar de Desarrollo

<!-- [ESTANDAR] -->

### Receta: Nuevo Value Object

<!-- [ESTANDAR] -->

1. Ubicar en `dominio/compartido/` si es generico, o en el subdominio correspondiente.
2. Definir interfaz de propiedades de solo lectura `interface Props { readonly valor: string }`.
3. Extender `ValueObject<Props>` y declarar constructor privado llamando a `super(props)`.
4. Implementar factory `public static crear(valor: string): NombreVO` validando invariantes y
   lanzando `ErrorDominio`.
5. Crear test unitario en `tests/dominio/` cubriendo casos validos, invalidos y limites.

### Receta: Nueva Entidad o Agregado

<!-- [ESTANDAR] -->

1. Extender `Entidad` para objetos con ciclo de vida o `AgregadoRaiz` para limites de consistencia
   transaccional.
2. El constructor recibe `uuid: string` y valida presencia llamando a `super(uuid)`.
3. Mutaciones de estado mediante metodos de negocio descriptivos que protejan las invariantes.
4. Generar eventos de dominio o validar reglas antes de alterar colecciones internas.

### Distribucion y Organizacion de Codigo

<!-- [ESTANDAR] -->

- `compartido/`: clases base (`Entidad.ts`, `AgregadoRaiz.ts`, `ValueObject.ts`), utilidades puras
  (`generarUuid.ts`) y VOs transversales.
- `<subdominio>/`: carpetas tematicas conteniendo agregados, entidades y VOs especificos del area
  funcional.
- `servicios/`: logica de dominio que orquesta multiples entidades sin residir naturalmente en
  ninguna de ellas, sin persistencia.

---
