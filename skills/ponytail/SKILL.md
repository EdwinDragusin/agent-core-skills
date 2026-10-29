---
name: ponytail
description: "Modo anti-sobreingenieria: minimo cambio completo, YAGNI, review anti-bloat, auditoria de repo (audit) y deuda con shortcut:."
---

# Ponytail - Simplicidad Radical, Auditoria Anti-Bloat y Deuda Tecnica

## 1. Reglas Nucleares de Implementacion (Modo `full`)

1. **Minimo Cambio Completo:** Escribe la menor cantidad de codigo que resuelva el problema al 100%, incluyendo lo que tu cambio afecte (llamadores, tests, tipos y fixtures).
2. **Jerarquia de Reutilizacion:**
   - Primero: Reutilizar funciones, utilidades y componentes ya existentes en el repositorio.
   - Segundo: Usar la biblioteca estandar del lenguaje/runtime.
   - Tercero: Usar dependencias ya presentes en el manifiesto del proyecto.
   - Ultimo recurso: Escribir codigo nuevo o instalar un paquete externo.
3. **Prohibida la Abstraccion Prematura (YAGNI):**
   - No crees clases base genericas, fabricas, sistemas de plugins ni parametros de configuracion para un solo caso de uso real.
   - Tres lineas claras y directas son mejores que una abstraccion prematura.
4. **Cierre de Transparencia Obligatorio:**
   - Termina cada respuesta tecnica con **1 o 2 lineas** indicando explicitamente: que se omitio o no se verifico, y que riesgos latentes quedan abiertos.

## 2. Registro de Atajos y Deuda Tecnica (`ponytail-debt`)

Cuando tomes un atajo deliberado para evitar sobreingenieria (ej. cache en memoria en lugar de Redis, validacion sincrona simple en lugar de cola distribuida):
- Deja un comentario rastreable en el codigo con el formato exacto:
  ```ts
  // shortcut: <que se simplifico> - limite: <cuando fallara> - mejora: <cuando migrar>
  ```
- Al cierre de las Fases 3A y 3B, extrae todos los comentarios `shortcut:` y `TODO:` hacia `docs/arquitectura/07-deuda-tecnica-y-riesgos.md`.

## 3. Protocolo de Revision Anti-Bloat (`ponytail-review`)

Al auditar un cambio o Pull Request (especialmente en Fase 4 `qa-reviewer`), evalua estas 6 preguntas en orden:
1. **Es correcta la logica?** Resuelve el requerimiento sin romper invariantes existentes?
2. **Es segura?** Valida entradas en fronteras, evita inyecciones y no expone secretos ni PII?
3. **Soporta carga real?** Hay consultas N+1, bucles sin cota, fugas de memoria o bloqueos del event loop?
4. **Estan probadas las rutas riesgosas?** Los tests verifican comportamiento real y casos borde, no mocks triviales?
5. **Es suficientemente rapida?** Cumple los SLOs sin optimizacion prematura?
6. **Sobra alguna linea?** Identifica codigo muerto, wrappers inutiles, capas de indireccion sin valor y propone su eliminacion directa.

## 4. Auditoria de Repositorio (`ponytail-audit`)

Informe unico bajo demanda ("audita el repo", "que puedo borrar"); no modifica codigo. Lo usa `system-architect` en Modo Baseline Documental para `07-deuda-tecnica-y-riesgos.md`. Protocolo completo (mapear, buscar, verificar, formato de salida): leer [references/ponytail-audit.md](references/ponytail-audit.md) solo al ejecutar esta auditoria.
