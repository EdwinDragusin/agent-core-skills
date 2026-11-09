---
title: "03. Contexto y Alcance del Sistema"
capitulo: 3
tags:
  - arquitectura
  - arc42
estado: Borrador
---

# 03. Contexto y Alcance del Sistema

## 3.1 Contexto de Negocio

[Describa los actores humanos y sistemas externos con los que interactua el sistema desde una perspectiva de dominio, detallando las entradas y salidas funcionales.]

```mermaid
flowchart LR
    Actor["[Actor Principal]"] -->|"Solicitudes de negocio"| Sistema["[Sistema Principal]"]
    Sistema -->|"Notificaciones / Documentos"| ServicioExt["[Servicio Externo]"]
```

| Entidad Externa / Actor | Entrada al Sistema | Salida del Sistema |
|---|---|---|
| [Actor 1] | [Datos o acciones enviadas] | [Resultados o vistas entregadas] |
| [Sistema Externo 1] | [Eventos o respuestas recibidas] | [Peticiones enviadas] |

## 3.2 Contexto Tecnico

[Describa las interfaces tecnicas, protocolos de comunicacion, formatos de intercambio de datos y canales de red entre el sistema y su entorno.]

| Interfaz / Canal | Protocolo / Formato | Direccion | Descripcion Tecnica |
|---|---|---|---|
| API HTTP | HTTPS / JSON (RFC 9457) | Entrante | Comunicacion entre clientes web y backend. |
| Base de Datos | TCP / protocolo PostgreSQL | Saliente | Persistencia relacional transaccional. |
| [Canal adicional] | [Protocolo] | [Direccion] | [Describa el canal tecnico] |
