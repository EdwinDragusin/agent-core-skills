# Topología del Ciclo de Vida: Trunk-Based Development

### A. Superación del Modelo Clásico GitFlow
GitFlow (Driessen, 2010) introdujo una arquitectura rígida basada en dos ramas perennes (`main` y `develop`) combinadas con ramas transitorias (`feature`, `release`, `hotfix`). Aunque apto para software de escritorio con ciclos de distribución trimestrales, GitFlow genera cuellos de botella severos en entornos web/cloud modernos con despliegue continuo (Continuous Delivery). La acumulación prolongada de cambios en `develop` difiere la integración y detona cascadas de conflictos masivos al consolidar releases.

### B. Desarrollo Basado en Tronco (Trunk-Based Development)
El estándar hegemónico actual exige:
1. **Ramas efímeras (Short-lived branches):** Vida útil medida en **horas o máximo 1-2 días**.
2. **Incrementos lógicos pequeños:** Cambios atómicos que ideales no superen las **300 a 400 líneas de código (LOC)**.
3. **Integración frecuente hacia `main`:** Fusionar constantemente incrementos probados y funcionales.
4. **Patrones de desacoplamiento despliegue/lanzamiento:**
   - **Banderas de características (Feature Flags / Feature Toggles):** El código incompleto o experimental se fusiona en producción desactivado lógicamente en tiempo de ejecución.
   - **Ramificación por abstracción (Branch by Abstraction):** Introducir una interfaz abstracta intermedia para migrar módulos gradualmente sin romper llamadas existentes en `main`.
