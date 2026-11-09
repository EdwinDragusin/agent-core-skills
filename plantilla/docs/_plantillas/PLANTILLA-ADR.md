<%*
// Requiere que el archivo ya se haya creado/nombrado como ADR-0NN-slug-en-minusculas.md
// (mismo patron que adr/ADR-009-exclusion-cas-identidad-catalogos.md)
const partes = tp.file.title.split("-");
const id = partes[0] + "-" + partes[1];
const tituloLegible = tp.file.title.split("-").slice(2).join(" ").replace(/\b\w/g, c => c.toUpperCase());
const subcategoria = await tp.system.prompt("Subcategoria de arquitectura (ej. concurrencia, persistencia, seguridad)", "general");
-%>
---
aliases:
  - <% id %>
id: <% id %>
titulo: "<% tituloLegible %>"
estado: Propuesto
fecha: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - adr
  - arquitectura/<% subcategoria %>
---

# <% id %>: <% tituloLegible %>

## Resumen Ejecutivo de Negocio
Sintesis en lenguaje de negocio accesible que describe el impacto funcional, las garantias operativas y el valor que aporta esta decision arquitectonica para la organizacion y usuarios finales, libre de jerga innecesaria.

## Estado
Propuesto

## Contexto


## Decision


## Consecuencias

