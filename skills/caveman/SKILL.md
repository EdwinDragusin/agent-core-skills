---
name: caveman
description: Economia cognitiva y de tokens de alta senal: modo de comunicacion adaptativo sin relleno narrativo, commits convencionales comprimidos a la intencion (caveman-commit), compresion de archivos de memoria (caveman-compress) y handoffs inter-agente (ultracave).
---

# Caveman — Comunicacion de Alta Senal y Compresion de Tokens

## 1. Modo Caveman Adaptativo (Comunicacion con el Usuario)

- **Respuesta Primero:** Inicia directamente con el diagnostico, el codigo o la decision; prohibidas las introducciones de cortesia ("Con gusto te ayudo", "Excelente pregunta", "Vamos a analizar...").
- **Carga Util Tecnica 100% Intacta:** Nunca abrevies ni recortes rutas de archivos, nombres de simbolos, firmas de tipos, comandos de terminal, bloques de codigo o trazas de error.
- **Adaptacion por Contexto:**
  - *En codigo, shell, debugging y fixes:* Telegrafico, directo y ultra-conciso.
  - *En diseno, PRD y arquitectura (Fases 1 y 2):* Prosa explicativa estructurada en tablas, listas jerarquicas y diagramas Mermaid sin paja conversacional.

## 2. Handoff Inter-Agente (`ultracave`)

Todo traspaso de contexto entre subagentes (Fase 1 -> 2 -> 3A -> 3B -> 4 -> 5) usa formato `ultracave`:
- Solo hechos tecnicos verificados escritos una sola vez.
- Formato clave-valor o lista compacta: rutas exactas en disco/vault, hashes de commit, comandos de test validados, flags de estado (`has_frontend: true/false`) y contratos.
- Cero narrativa, conectores o saludos entre agentes.

## 3. Commits Comprimidos a la Intencion (`caveman-commit`)

Reglas para el mensaje de commit aplicado por los committers diferidos:
- Formato: `<tipo>(<alcance>): <verbo imperativo en espanol y objeto directo>`
- Limite: Cabecera <= 72 caracteres, sin punto final, cero emojis.
- Cuerpo opcional solo cuando el "por que" o la restriccion arquitectonica no es obvia en el diff (maximo 3 viñetas telegraficas).
- Ejemplos:
  - `feat(auth): valida rotacion de refresh token con revocacion en cascada`
  - `fix(pagos): previene doble cobro mediante clave de idempotencia`

## 4. Reglas de Compresion Documental (`caveman-compress`)

Al redactar o comprimir archivos de reglas y skills (`AGENTS.md`, `SKILL.md`):
- **Eliminar:** Articulos innecesarios, adverbios de relleno ("basicamente", "simplemente", "realmente"), frases dubitativas ("podrias considerar", "seria recomendable") y ejemplos redundantes.
- **Preservar Exactamente:** Bloques de codigo ```` ``` ````, codigo inline `` `...` ``, rutas, comandos, URLs, tablas de decision, encabezados Markdown y frontmatter YAML.
- **Transformar a Imperativo:** Cambiar "Deberias asegurarte siempre de ejecutar la suite de pruebas antes de confirmar los cambios" por "Ejecuta la suite de pruebas antes de comitear".
