---
title: "08. Conceptos Transversales"
capitulo: 8
tags:
  - arquitectura
  - arc42
estado: Borrador
---

# 08. Conceptos Transversales

## 8.1 Modelo de Dominio y Persistencia

[Describa las convenciones transversales de modelado: uso de UUIDv7 generados en dominio, objetos de valor inmutables, transacciones mediante `UnitOfWork` y control de concurrencia optimista Compare-And-Swap (`version`).]

## 8.2 Manejo de Errores y Contratos HTTP (RFC 9457)

[Describa la jerarquia de errores desde el dominio hasta la capa de interfaz y la serializacion estandarizada bajo Problem Details (RFC 9457), garantizando que los errores 500 no filtren detalles internos.]

## 8.3 Seguridad, Autenticacion y Autorizacion

[Describa los mecanismos de autenticacion, control de acceso basado en roles, manejo seguro de credenciales en variables de entorno y proteccion de datos sensibles.]

## 8.4 Observabilidad y Trazabilidad

[Describa el registro estructurado mediante el puerto `Logger`, la propagacion de `X-Peticion-Id` y la redaccion de informacion personal identificable (PII) en los logs.]
