# Manifiesto de Capa - Shared

Directrices operacionales para componentes compartidos, utilidades transversales y primitivos de
diseno.

---

## 1. Reglas Inviolables de Capa

<!-- [ESTANDAR] -->

- **Aislamiento absoluto**: `front/shared/` JAMAS importa de aplicaciones o portales especificos
  (`{{APP_1}}/`, `{{APP_2}}/`).
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
- **Sin logica de dominio**: `front/shared/` contiene unicamente UI generica, utilidades puras,
  tipos base y tokens visuales. Prohibido incluir logica de negocio institucional.
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
- **Componentes presentacionales puros (RN-F02)**: los componentes visuales de `shared/ui/` reciben
  `props` y emiten callbacks. Prohibido llamar APIs de red, `fetch` o TanStack Query directamente.
  <!-- verifica: front/tests/arquitectura/front-dependencias.test.ts -->
- **Prohibicion total de emojis**: NUNCA utilizar emojis en componentes, textos accesibles, clases
  ni pruebas.
  <!-- verifica: scripts/higiene/sin-emojis.test.ts, scripts/hooks/validar-commit.ts, scripts/doc-linter.ps1 -->

---

## 2. Recetas Estandar de Desarrollo

<!-- [ESTANDAR] -->

### Receta: Nuevo Componente UI

<!-- [ESTANDAR] -->

1. Ubicar el componente en `front/shared/ui/` como funcion pura de React.
2. Definir interfaz de `Props` extendiendo atributos HTML nativos y atributos de accesibilidad ARIA.
3. Utilizar primitivos de Radix UI y clases de Tailwind CSS para estilizacion consistente.
4. Exportar componentes y subcomponentes desde `front/shared/ui/index.ts`.
5. Crear suite de pruebas en `shared/ui/__tests/` con `@testing-library/react` verificando roles
   ARIA, estados visuales (`cargando`, `error`, `deshabilitado`) y callbacks.

### Receta: Nuevo Token de Diseno

<!-- [ESTANDAR] -->

1. Declarar tokens en `front/shared/styles/tokens.css` o configuracion de Tailwind.
2. Usar variables semanticas (`--color-primario`, `--radio-borde`, `--espaciado-base`) para asegurar
   coherencia multi-portal.
3. Evitar valores fijos en componentes cuando exista un token equivalente.
