---
name: browser-testing-with-devtools
description: "Verifica UI en navegador real via MCP playwright: DOM, accesibilidad, 4 estados, consola y flujos E2E."
---

# Browser Testing with Playwright & DevTools MCP — Verificacion Real en Navegador

El analisis estatico de codigo no detecta pantallas en blanco, errores de hidratacion, problemas de foco ni fallos de CORS. Usa el servidor MCP **`playwright`** (configurado en `mcp_config.json`) en las **Fases 3B (`ui-builder`)** y **4 (`qa-reviewer`)** para ver y probar la aplicacion en ejecucion real.

## 1. Flujo de Verificacion Obligatorio en Navegador

1. **Asegurar Servidor Activo:** Comprueba que el servidor de desarrollo este corriendo (o inicialo en segundo plano con `IsDaemon: true`).
2. **Navegar y Capturar Arbol de Accesibilidad:**
   - Usa `browser_navigate` hacia la ruta objetivo.
   - Usa `browser_snapshot` para inspeccionar el arbol semantico y de accesibilidad real (roles ARIA, nombres accesibles, estados interactivos).
3. **Auditar Consola y Red (Tolerancia Cero):**
   - Ejecuta `browser_console_messages` y `browser_network_requests`.
   - **Criterio de Bloqueo:** Debe haber **0 errores en consola**, **0 warnings de claves/hidratacion de React/framework** y **0 respuestas HTTP 500 o fallos de contrato** no controlados.

## 2. Verificacion de los 4 Estados FSM y Accesibilidad (Fase 3B y 4)

No basta con probar el flujo exitoso (*Happy Path*). Verifica empiricamente en el navegador:
1. **Estado Loading:** Comprueba presencia de skeletons o indicadores con `aria-busy="true"` sin saltos bruscos de layout.
2. **Estado Empty:** Comprueba que sin registros se renderiza el estado vacio con llamada a la accion clara.
3. **Estado Error (RFC 9457):** Simula o provoca una respuesta de error (400/409/422/500) y comprueba que la UI muestra un mensaje humano claro (sin volcar JSON crudo ni quedarse congelada).
4. **Estado Success:** Ejecuta la interaccion completa (`browser_click`, `browser_type` / `browser_fill_form`) y verifica la actualizacion visual y persistencia.
5. **Navegacion por Teclado (`browser_press_key`):** Comprueba que se puede recorrer el flujo principal usando `Tab`, `Enter` y `Escape` con foco visible.
