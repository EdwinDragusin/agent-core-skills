# Esquemas de Frontmatter (Schemas)

> [!NOTE]
> Este documento define los esquemas canónicos de YAML frontmatter para la gestión estandarizada de documentos arquitectónicos en el vault de Obsidian. Sirve como referencia estricta para validaciones automáticas.

## Consideraciones Generales

> [!IMPORTANT]
> - Se prefiere una estructura plana (flat) sobre estructuras anidadas para máxima compatibilidad con Dataview y las mejores practicas de Obsidian.
> - Las comillas dobles deben usarse para los valores de cadena (strings) en los ejemplos y plantillas YAML.
> - Todos los archivos deben incluir una propiedad `tags` estructurada como un arreglo plano.

## Nueva Propiedad: `diataxis-quadrant`

> [!TIP]
> Para alinear la documentación con el estándar Diataxis, se introduce la propiedad `diataxis-quadrant`. Esta propiedad es obligatoria para las Guias y opcional (pero recomendada si aplica) para otros tipos.

- **Valores Permitidos:** `tutorial`, `how-to`, `referencia`, `explicacion`

---

## 1. ADR (Architecture Decision Record)

Aplica tanto para Backend (`ADR-001`) como Frontend (`ADR-F001`).

```yaml
id: ADR-001
titulo: "Patron Upsert para la Persistencia de Respuestas"
estado: Aprobado
fecha: "2026-07-24"
aliases: ["RN-I01", "Integridad de datos", "ADR-001"]
tags: [adr, regla-negocio/integridad]
diataxis-quadrant: "referencia"
```

### Campos Obligatorios
- `id` (String): Identificador unico. Ejemplo: `"ADR-001"` o `"ADR-F001"`.
- `titulo` (String): Titulo descriptivo de la decision. Ejemplo: `"Patron Upsert"`.
- `estado` (String): Estado actual de la decision.
- `fecha` (String): Fecha de creación o aprobación en formato ISO 8601 (YYYY-MM-DD).
- `tags` (Array): Lista de etiquetas. Debe incluir `adr`.

### Campos Opcionales
- `aliases` (Array): Nombres alternativos para busqueda.
- `diataxis-quadrant` (String): Clasificación en el framework Diataxis (generalmente `"referencia"`).

### Valores Permitidos
- `estado`: `Propuesto`, `Aprobado`, `Rechazado`, `Obsoleto`

### Reglas de Validacion
- `id` debe cumplir la expresion regular `^ADR-F?\d{3}$`.
- `fecha` debe ser un string válido en formato `YYYY-MM-DD`.

### Enlaces Internos
- No aplica estrictamente en el frontmatter, las relaciones se gestionan en el cuerpo del documento mediante wikilinks.

---

## 2. Caso de Uso (CU)

```yaml
id: CU-001
titulo: "Autenticar usuario"
actor_principal: Usuario
modulo: Autenticacion
complejidad: Media
estado: Aprobado
aliases: ["CU-001", "Autenticar usuario"]
tablas_afectadas: [Usuario, Sesion]
tags: [modulo/autenticacion, actor/usuario]
```

### Campos Obligatorios
- `id` (String): Identificador unico. Ejemplo: `"CU-001"`.
- `titulo` (String): Nombre del caso de uso.
- `actor_principal` (String): El usuario o sistema que inicia el CU.
- `modulo` (String): Modulo al que pertenece.
- `complejidad` (String): Nivel de complejidad de implementacion.
- `estado` (String): Estado de definicion o implementacion.
- `tags` (Array): Etiquetas relevantes.

### Campos Opcionales
- `aliases` (Array): Nombres alternativos.
- `tablas_afectadas` (Array): Entidades de base de datos principales involucradas.
- `diataxis-quadrant` (String): Clasificacion en Diataxis (ej. `"explicacion"`).

### Valores Permitidos
- `complejidad`: `Baja`, `Media`, `Alta`
- `estado`: `Borrador`, `En Revision`, `Aprobado`, `Implementado`

### Reglas de Validacion
- `id` debe cumplir la expresion regular `^CU-\d{3}$`.

### Enlaces Internos
- Se pueden usar wikilinks en `actor_principal` si existe un documento de actor, aunque comunmente es texto plano.

---

## 3. Regla de Negocio (RN)

```yaml
id: RN-E01
nombre: "Estructura de la prueba"
categoria: Evaluacion y Examen
aliases: ["RN-E01", "Estructura de la prueba"]
tags: [regla-negocio/evaluacion]
```

### Campos Obligatorios
- `id` (String): Identificador unico. Ejemplo: `"RN-E01"`.
- `nombre` (String): Descripcion corta de la regla.
- `categoria` (String): Agrupacion logica.
- `tags` (Array): Debe incluir la categoria como `regla-negocio/*`.

### Campos Opcionales
- `aliases` (Array): Alias para busqueda y vinculacion.
- `diataxis-quadrant` (String): Clasificacion en Diataxis (generalmente `"referencia"`).

### Valores Permitidos
- `categoria`: Depende de los dominios (ej. `Evaluacion y Examen`, `Seguridad`, `Integridad`).

### Reglas de Validacion
- `id` debe cumplir la expresion regular `^RN-[A-Z]\d{2}$`.

---

## 4. Diagrama de Secuencia (DS-CU)

```yaml
id: DS-CU-001
caso_de_uso: "[[CU-001-autenticar-usuario|CU-001 Autenticar usuario]]"
modulo: Autenticacion
actor_principal: Usuario
tablas_afectadas: [Usuario, Sesion]
tags: [diagrama-secuencia, arquitectura, modulo/autenticacion]
```

### Campos Obligatorios
- `id` (String): Identificador unico. Ejemplo: `"DS-CU-001"`.
- `caso_de_uso` (String): Enlace al caso de uso correspondiente.
- `modulo` (String): Modulo de pertenencia.
- `actor_principal` (String): Actor que inicia el flujo.
- `tags` (Array): Debe incluir `diagrama-secuencia`.

### Campos Opcionales
- `tablas_afectadas` (Array): Tablas con interaccion en el diagrama.
- `diataxis-quadrant` (String): Clasificacion en Diataxis (generalmente `"explicacion"` o `"referencia"`).

### Reglas de Validacion
- `id` debe cumplir la expresion regular `^DS-CU-\d{3}$`.

### Enlaces Internos
- `caso_de_uso` DEBE ser un wikilink valido con alias opcional. Ejemplo: `"[[CU-001-iniciar-examen|CU-001 Iniciar examen]]"`.

---

## 5. Capitulo arc42

```yaml
seccion_arc42: 1
titulo: "Introduccion y Metas"
estado: Aprobado
modulo: General
tags: [arquitectura/introduccion]
```

### Campos Obligatorios
- `seccion_arc42` (Integer o String): Numero de la seccion (1-12).
- `titulo` (String): Nombre oficial de la seccion arc42.
- `estado` (String): Estado de documentacion.
- `modulo` (String): Aplica `General` para la arquitectura global o un modulo especifico.
- `tags` (Array): Relacionados a la arquitectura.

### Campos Opcionales
- `diataxis-quadrant` (String): Generalmente `"explicacion"`.

### Valores Permitidos
- `seccion_arc42`: Valores del `1` al `12`, mas secciones adicionales como glosario.
- `estado`: `Borrador`, `Aprobado`, `Obsoleto`.

### Reglas de Validacion
- `seccion_arc42` debe ser valido dentro del marco arc42.

---

## 6. Reporte de Auditoria (AUDIT)

```yaml
id: AUDIT-014
titulo: "Auditoria de Arquitectura y Estandarizacion de README (Docs Vault)"
tipo: auditoria
estado: Concluida (Remediada)
fecha: "2026-09-02T11:08:00-06:00"
autor: "readme-architecture-auditor (skill automatizada)"
modo: completa
commits_analizados:
  docs: c80309a
tags: [auditoria, readme, standard-readme, docs, obsidian, arc42, diataxis]
```

### Campos Obligatorios
- `id` (String): Identificador unico. Ejemplo: `"AUDIT-014"`.
- `titulo` (String): Titulo descriptivo del reporte.
- `tipo` (String): Tipo de documento, siempre `"auditoria"`.
- `estado` (String): Estatus de la auditoria.
- `fecha` (String): Fecha y hora con zona horaria (ISO 8601 extendido).
- `autor` (String): Agente o individuo que realizo la auditoria.
- `modo` (String): Alcance de la revision.
- `tags` (Array): Debe incluir `auditoria`.

### Campos Opcionales
- `commits_analizados` (Object): Objeto (diccionario) mapeando repositorios a hashes de commit. Es la unica excepcion recomendada a la regla de estructura plana.

### Valores Permitidos
- `estado`: `En Progreso`, `Concluida`, `Concluida (Remediada)`.
- `modo`: `completa`, `parcial`, `incremental`.

### Reglas de Validacion
- `fecha` debe incluir timestamp y timezone.

---

## 7. Guia Tecnica / Operativa

```yaml
titulo: "Guia Tecnica: Como Funcionan los Background Workers y Jobs en el Sistema"
modulo: Arquitectura e Infraestructura
estado: Aprobado
diataxis-quadrant: "how-to"
tags: [guia, arquitectura, jobs, workers, procesos-programados]
```

### Campos Obligatorios
- `titulo` (String): Titulo descriptivo de la guia.
- `modulo` (String): Contexto funcional o arquitectonico.
- `estado` (String): Estado de documentacion.
- `diataxis-quadrant` (String): Clasificacion Diataxis obligatoria.
- `tags` (Array): Debe incluir `guia`.

### Campos Opcionales
- `id` (String): Opcional si se desea una nomenclatura secuencial.

### Valores Permitidos
- `diataxis-quadrant`: `tutorial`, `how-to`, `referencia`, `explicacion`.

---

## Tabla Comparativa Maestra

| Propiedad / Tipo | ADR | Caso de Uso | Regla Negocio | DS-CU | arc42 | Auditoria | Guia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `id` | Req | Req | Req | Req | No | Req | Opc |
| `titulo` / `nombre`| Req | Req | Req | No (usa caso_de_uso)| Req | Req | Req |
| `estado` | Req | Req | No | No | Req | Req | Req |
| `tags` | Req | Req | Req | Req | Req | Req | Req |
| `fecha` | Req | No | No | No | No | Req | No |
| `aliases` | Opc | Opc | Opc | No | No | No | No |
| `modulo` | No | Req | No | Req | Req | No | Req |
| `actor_principal`| No | Req | No | Req | No | No | No |
| `tablas_afectadas`| No | Opc | No | Opc | No | No | No |
| `diataxis-quadrant`| Opc | Opc | Opc | Opc | Opc | No | Req |

> [!NOTE]
> `Req` = Requerido, `Opc` = Opcional, `No` = No aplica por defecto.

---

## Errores Comunes de Validación y Detección

> [!WARNING]
> Prestar atención a estos antipatrones comunes durante las auditorias del vault.

1. **Falta de Comillas en Enlaces Internos:**
   - **Error:** `caso_de_uso: [[CU-001]]` (El analizador YAML puede fallar por los corchetes).
   - **Solucion:** Siempre envolver el wikilink en comillas: `caso_de_uso: "[[CU-001]]"`.

2. **Fechas en Formato Incorrecto:**
   - **Error:** `fecha: 24/07/2026` o `fecha: 24 de Julio de 2026`.
   - **Solucion:** Usar ISO 8601: `fecha: "2026-07-24"`.

3. **Anidamiento Innecesario:**
   - **Error:** Crear diccionarios complejos para metadatos simples.
   - **Solucion:** Usar arrays o campos separados. (Ej. `complejidad: Alta` en vez de `metricas: { complejidad: Alta }`).

4. **Etiquetas (Tags) Mal Formateadas:**
   - **Error:** Usar `#tag` dentro de la lista de arreglos YAML (`tags: [#adr]`).
   - **Solucion:** Omitir el símbolo de almohadilla (`tags: [adr]`).
