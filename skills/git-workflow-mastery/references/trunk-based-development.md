# Topologia del Ciclo de Vida: Trunk-Based Development

### A. Superacion del Modelo Clasico GitFlow
GitFlow (Driessen, 2010) introdujo una arquitectura rigida basada en dos ramas perennes (`main` y `develop`) combinadas con ramas transitorias (`feature`, `release`, `hotfix`). Aunque apto para software de escritorio con ciclos de distribucion trimestrales, GitFlow genera cuellos de botella severos en entornos web/cloud modernos con despliegue continuo (Continuous Delivery). La acumulacion prolongada de cambios en `develop` difiere la integracion y detona cascadas de conflictos masivos al consolidar releases.

### B. Desarrollo Basado en Tronco (Trunk-Based Development)
El estandar hegemonico actual exige:
1. **Ramas efimeras (Short-lived branches):** Vida util medida en **horas o maximo 1-2 dias**.
2. **Incrementos logicos pequenos:** Cambios atomicos que ideales no superen las **300 a 400 lineas de codigo (LOC)**.
3. **Integracion frecuente hacia `main`:** Fusionar constantemente incrementos probados y funcionales.
4. **Patrones de desacoplamiento despliegue/lanzamiento:**
   - **Banderas de caracteristicas (Feature Flags / Feature Toggles):** El codigo incompleto o experimental se fusiona en produccion desactivado logicamente en tiempo de ejecucion.
   - **Ramificacion por abstraccion (Branch by Abstraction):** Introducir una interfaz abstracta intermedia para migrar modulos gradualmente sin romper llamadas existentes en `main`.
