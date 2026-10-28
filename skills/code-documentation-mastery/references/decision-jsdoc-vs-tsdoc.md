# JSDoc vs TypeScript vs TSDoc — Decision Arquitectonica

| Escenario | Estrategia Recomendada | Justificacion |
|:---|:---|:---|
| **TypeScript puro** (`.ts`) | Tipos en sintaxis TS nativa; JSDoc solo para descripcion narrativa, `@since`, `@deprecated`, `@example`. Activar `recommended-typescript-error`. | El compilador TS ya garantiza el tipo de datos estaticamente. Repetir tipos en los bloques JSDoc resulta en redundancia innecesaria y propension a desincronizacion. |
| **JavaScript puro + Deno/Node** | JSDoc completo con tipos en etiquetas (`@type`, `@param {T}`, `@typedef`). `tsc --noEmit --allowJs --checkJs` valida con igual severidad que `.ts`. | Al no existir TypeScript como lenguaje, se inyectan las validaciones usando `checkJs` a traves del bloque comentado JSDoc. |
| **No Build Step** (Svelte, htmx, Deno scripts) | JSDoc es infraestructura critica de mision. Tipos completos, `@template` para genericos. Sin transpilacion ni `tsconfig`. | Es vital ya que el codigo se envia al navegador o runtime directamente. JSDoc actua como el motor primario de chequeo para evitar regresiones. |
| **SDK publico / monorepo hibrido** | TSDoc + Microsoft API Extractor. Eliminar etiquetas de tipo redundantes. Usar `@alpha`, `@beta`, `@public`, `@internal` de TSDoc. | Proyectos hibridos y bibliotecas de cara al publico requieren extraccion automatica de tipados generados y un pipeline de distribucion con doc-generation formalizado. |
