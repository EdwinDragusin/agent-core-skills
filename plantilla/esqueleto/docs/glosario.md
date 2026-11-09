---
title: "Glosario de Lenguaje Ubicuo y Arquitectura"
aliases:
  - Glosario
tags:
  - glosario
  - ddd
estado: Vigente
---

# Glosario de Lenguaje Ubicuo y Arquitectura

Este documento establece el vocabulario canonico del proyecto bajo una estructura dual: los conceptos del dominio funcional y las definiciones tecnicas de diseno guiado por el dominio (DDD) y arquitectura.

## 1. Terminos de Negocio (Lenguaje Ubicuo)

[Defina en esta seccion los conceptos propios del dominio del proyecto. Cada termino debe tener un significado unico y compartido entre personas expertas del negocio y el equipo de ingenieria, evitando sinonimos ambiguos.]

| Termino | Definicion Funcional | Analogias y Reglas Asociadas |
|---|---|---|
| [Termino de Negocio 1] | [Describa el significado exacto en el dominio del negocio] | [Indique notas o reglas `RN-*` relacionadas] |
| [Termino de Negocio 2] | [Describa el significado exacto en el dominio del negocio] | [Indique notas o reglas `RN-*` relacionadas] |

---

## 2. Dominio DDD y Arquitectura Tecnica (Terminos Tecnicos)

Conceptos estructurales de Clean Architecture, Domain-Driven Design (DDD) y Feature-Sliced Design (FSD) utilizados en el codigo y en las secciones tecnicas de la documentacion.

| Termino Tecnico | Definicion en la Arquitectura | Ubicacion / Convencion |
|---|---|---|
| **Agregado Raiz (Aggregate Root)** | Entidad principal que gobierna un limite de consistencia transaccional y protege las invariantes de sus entidades internas. | `back/src/dominio/` (extiende `AgregadoRaiz`) |
| **Entidad (Entity)** | Objeto de dominio definido por su identidad unica (`uuid` v7) y continuidad a lo largo del ciclo de vida. | `back/src/dominio/` (extiende `Entidad`) |
| **Objeto de Valor (Value Object)** | Objeto inmutable (`Object.freeze`) sin identidad conceptual propia, definido por el valor de sus atributos y validado en `crear()`. | `back/src/dominio/` (extiende `ValueObject`) |
| **Caso de Uso (UseCase)** | Unidad de orquestacion de la capa de aplicacion que ejecuta un flujo del sistema a traves del metodo `ejecutar()`. | `back/src/aplicacion/usecases/` |
| **Puerto (Port)** | Contrato (interfaz TypeScript) definido en la capa de aplicacion e implementado por adaptadores en infraestructura. | `back/src/aplicacion/ports/` |
| **DTO (Data Transfer Object)** | Estructura plana e inmutable para transportar datos entre la interfaz y la capa de aplicacion. | `back/src/aplicacion/dtos/` |
| **Unit of Work (UoW)** | Patron que agrupa multiples operaciones de persistencia dentro de una transaccion atomica. | `back/src/aplicacion/ports/UnitOfWork.ts` |
| **Concurrencia Optimista (CAS)** | Mecanismo Compare-And-Swap mediante columna `version` para detectar colisiones de escritura sin bloqueos pesimistas. | `back/src/infraestructura/persistencia/` |
| **Feature Slice (FSD)** | Modulo cerrado del frontend que encapsula una capacidad de usuario sin importar directamente de otras features vecinas. | `front/*/src/features/` |
