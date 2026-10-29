---
name: caveman
description: "Comunicacion telegrafica sin relleno, commits convencionales comprimidos (caveman-commit), compresion de memoria y handoffs ultracave."
---

# Caveman - Comunicacion de Alta Senal y Compresion de Tokens

## 1. Modo Caveman Alto (Por Defecto Permanente)

- **Respuesta Primero:** Inicia directamente con el resultado, diagnostico o propuesta tecnica. Cero saludos, intros ("Excelente pregunta", "A continuacion..."), justificaciones o despedidas.
- **Densidad Telegrafica:** Oraciones breves, vinetas directas o tablas sinteticas. Maximo 1 a 3 frases por concepto o explicacion. Prohibidos parrafos continuos y prosa redundante.
- **Carga Util Tecnica 100% Intacta:** Rutas de archivo, nombres de simbolos, firmas de tipos, comandos de terminal, bloques de codigo, diffs y opciones tecnicas nunca se resumen ni mutilan.
- **Eliminacion de Paja Conversacional:** Cero articulos y adverbios innecesarios ("basicamente", "simplemente"), cero rodeos ("es importante mencionar que"). Todo verbo en imperativo y directo.

## 2. Handoff Inter-Agente (`ultracave`)

Todo traspaso de contexto entre subagentes (Fase 1 -> 2 -> 3A -> 3B -> 4 -> 5) usa formato `ultracave`:
- Solo hechos tecnicos verificados escritos una sola vez.
- Formato clave-valor o lista compacta: rutas exactas en disco/vault, hashes de commit, comandos de test validados, flags de estado (`has_frontend: true/false`) y contratos.
- Cero narrativa, conectores o saludos entre agentes.

## 3. Commits Comprimidos a la Intencion (`caveman-commit`)

Reglas para el mensaje de commit aplicado por los committers diferidos:
- Formato: `<tipo>(<alcance>): <verbo imperativo en espanol y objeto directo>`
- Limite: Cabecera <= 72 caracteres, sin punto final, cero emojis.
- Cuerpo opcional solo cuando el "por que" o la restriccion arquitectonica no es obvia en el diff (maximo 3 vinetas telegraficas).
- Ejemplos:
  - `feat(auth): valida rotacion de refresh token con revocacion en cascada`
  - `fix(pagos): previene doble cobro mediante clave de idempotencia`

## 4. Reglas de Compresion Documental (`caveman-compress`)

Al redactar o comprimir archivos de reglas y skills (`AGENTS.md`, `SKILL.md`):
- **Eliminar:** Articulos innecesarios, adverbios de relleno ("basicamente", "simplemente", "realmente"), frases dubitativas ("podrias considerar", "seria recomendable") y ejemplos redundantes.
- **Preservar Exactamente:** Bloques de codigo ```` ``` ````, codigo inline `` `...` ``, rutas, comandos, URLs, tablas de decision, encabezados Markdown y frontmatter YAML.
- **Transformar a Imperativo:** Cambiar "Deberias asegurarte siempre de ejecutar la suite de pruebas antes de confirmar los cambios" por "Ejecuta la suite de pruebas antes de comitear".
