---
aliases:
  - DIR-FRONT-001
categoria: Frontend # [Frontend | Backend | Seguridad | Infraestructura]
id: DIR-FRONT-001
nombre: Aislamiento Modular y Dependencias Frontend
tags:
  - directriz-tecnica/frontend
---

# DIR-FRONT-001: Aislamiento Modular y Dependencias Frontend

## 1. Proposito Tecnico
Directriz de gobernanza tecnica y arquitectura de software que regula las convenciones de programacion, patrones estructurales, restricciones de empaquetado o linters en la base de codigo.

*(Nota de gobernanza: Este archivo reside en `docs/arquitectura/directrices/` y NO en el catalogo de reglas de negocio institucionales `RN-*`).*

---

## 2. Especificacion de la Directriz
- **Restriccion de Codigo**: Ningun modulo dentro de `features/` puede importar codigo de forma directa desde otro modulo hermano dentro de `features/` (Metodologia Feature-Sliced Design). ^restriccion-codigo
- **Exportacion Canonica**: Todas las exportaciones se realizan exclusivamente a traves del archivo barril `index.ts` del slice. ^exportacion-barril

---

## 3. Verificacion Automatizada en CI
- **Herramienta**: Reglas de ESLint (`eslint-plugin-boundaries`) o linter nativo.
- **Accion ante violacion**: Bloqueo del build y error en pull request.

---

## 4. Modulos y Capas Afectadas
- **Capa**: Frontend / UI (`front/src/features/`).
- **ADRs Relacionados**: [[ADR-F001-arquitectura-frontend|ADR-F001]].
