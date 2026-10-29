---
name: domain-driven-design
description: "Modela por dominio: Bounded Contexts, Agregados, Value Objects, Eventos, Lenguaje Ubicuo y persistencia en DBML."
---

# Domain-Driven Design (DDD) - Diseno Estrategico y Tactico

Modela el codigo reflejando las reglas e invariantes reales del negocio. Opera en dos niveles: **Estrategico** (fronteras entre contextos) y **Tactico** (bloques internos del modelo).

## 1. Diseno Estrategico: Bounded Contexts y Lenguaje Ubicuo

- **Lenguaje Ubicuo:** Usa exactamente los mismos sustantivos y verbos del negocio en clases, metodos, tablas DBML y pruebas. Prohibido traducir conceptos de negocio a jerga generica (`DataManager`, `RecordHelper`). Si un termino significa dos cosas distintas segun el area (ej. `Producto` en Catalogo vs `Producto` en Envios), pertenecen a **Bounded Contexts** separados.
- **Identificacion de Fronteras:**
  1. Agrupa reglas que cambian juntas por la misma razon de negocio.
  2. Un Bounded Context es dueno exclusivo de su esquema de datos (ningun otro contexto consulta sus tablas directamente).
- **Patrones de Context Mapping:**
  - **Anti-Corruption Layer (ACL):** Traduce modelos externos o legacy antes de que entren a tu dominio puro.
  - **Customer-Supplier / Open Host Service:** Expone contratos publicos estables (DTOs/Eventos) sin filtrar entidades internas.
  - **Shared Kernel:** Minimo codigo compartido (solo tipos primitivos o estandares transversales como RFC 9457).

## 2. Diseno Tactico: Bloques de Construccion

| Bloque | Identidad | Mutabilidad | Regla de Oro |
| :--- | :--- | :--- | :--- |
| **Value Object** | Por valor (atributos) | Inmutable | Valida invariantes en su constructor (`Email`, `Money`, `DateRange`). Si es invalido, lanza excepcion de dominio inmediatamente. |
| **Entity** | Por ID unico | Controlada | Muta su estado exclusivamente mediante metodos con nombre de negocio (`orden.confirmar()`), nunca con setters publicos (`orden.setEstado()`). |
| **Aggregate Root** | Por ID global | Transaccional | Frontera de consistencia atomica. El mundo exterior solo referencia al Aggregate Root; las entidades hijas nunca se modifican desde fuera de la raiz. |
| **Domain Event** | Evento en pasado | Inmutable | Registra un hecho ocurrido (`OrdenConfirmada`, `PagoRechazado`) con timestamp e ID del agregado para desacoplar efectos secundarios. |
| **Domain Service** | Sin estado | N/A | Logica de dominio pura que involucra multiples agregados y no encaja naturalmente en ninguno de ellos. |
| **Repository** | Interfaz en `domain/` | N/A | Contrato de coleccion que persiste y recupera **Aggregate Roots completos**. La implementacion SQL/ORM vive en `infrastructure/`. |

## 3. Reglas de Diseno de Agregados (Reglas de Vernon)

1. **Disena agregados pequenos:** Incluye dentro del agregado solo las entidades que **deben** mantener consistencia transaccional inmediata (ACID).
2. **Referencia otros agregados unicamente por su ID:** Usa `clienteId: ClienteId`, nunca la instancia completa `cliente: Cliente` dentro de otro agregado.
3. **Un commit de base de datos = Un agregado modificado:** Si un caso de uso necesita alterar dos agregados distintos, usa consistencia eventual mediante Eventos de Dominio.

## 4. Integracion con Clean Architecture y DBML (Fase 2 y 3A)

- **`domain/`:** Cero dependencias de frameworks, HTTP u ORMs. Contiene Agregados, Entidades, Value Objects, Eventos, Excepciones de Dominio e interfaces de Repositorios.
- **`application/`:** Casos de uso (Command/Query Handlers). Orquesta: carga el agregado desde el repositorio -> invoca metodo del agregado -> persiste -> publica eventos.
- **Mapeo a DBML (`04-modelo-de-datos-y-contratos.md`):** Separa el modelo de dominio del modelo de persistencia cuando sea necesario. Documenta en DBML cada tabla, clave foranea e indice requeridos por los agregados.
