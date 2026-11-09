---
title: "Guia de Incorporacion (Onboarding)"
aliases:
  - Onboarding
tags:
  - onboarding
  - guia
estado: Vigente
---

# Guia de Incorporacion (Onboarding)

Punto de partida para integrantes de ingenieria, producto, auditoria y agentes de software que se incorporan al proyecto.

## 1. Proposito y Navegacion del Vault

[Describa brevemente la vision general del proyecto y como utilizar este vault de Obsidian como fuente unica de verdad.]

- Indice general: [[README]]
- Vocabulario del proyecto: [[glosario]]
- Tablero de pendientes: [[TODO]]

## 2. Rutas de Lectura por Rol

### Ruta 1: Comprension del Dominio y Producto

1. Leer [[capitulo-01-introduccion-y-metas|01. Introduccion y Metas]] y [[capitulo-03-contexto-y-alcance|03. Contexto y Alcance]].
2. Revisar el [[glosario|Glosario de Lenguaje Ubicuo]].
3. Consultar los actores y casos de uso en `docs/guia/referencia/`.

### Ruta 2: Arquitectura y Desarrollo Backend / Frontend

1. Revisar la estrategia general en [[capitulo-04-estrategia-solucion|04. Estrategia de Solucion]] y [[capitulo-05-vista-de-bloques|05. Vista de Bloques]].
2. Consultar las decisiones vigentes en [[capitulo-09-decisiones|09. Decisiones de Arquitectura]] y [[ADR-001-adoptar-estandar-calidad-y-clean-architecture|ADR-001]].
3. Leer los manifiestos operacionales `AGENTS.md` en la raiz del repositorio, `back/`, `front/` y `docs/`.
4. Configurar los hooks locales siguiendo [[configurar-hooks-git|Configurar Hooks de Git]].

### Ruta 3: Calidad, Auditoria y Operacion

1. Revisar [[capitulo-10-requerimientos-de-calidad|10. Requerimientos de Calidad]] y [[capitulo-11-riesgos-y-deuda-tecnica|11. Riesgos y Deuda Tecnica]].
2. Consultar el indice de auditorias en `docs/auditorias/README.md` y el tablero [[TODO]].

## 3. Primeros Pasos en el Entorno Local

[Describa los requisitos previos de instalacion (Deno 2.x, Docker, PowerShell) y la secuencia de comandos para levantar el entorno (`deno task hooks:install`, `deno task ci`).]
