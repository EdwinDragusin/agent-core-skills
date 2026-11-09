# Protocolo de Medicion de Linea Base y Politica de Cobertura

Este documento establece la metodologia para medir la linea base de cobertura de pruebas, la determinacion de umbrales bloqueantes y la aplicacion estricta de la politica de no regresion (Ratchet Policy).

---

## 1. Medicion de la Linea Base de Cobertura

Al adoptar el estandar en un repositorio (nuevo o preexistente), el umbral de cobertura no se inventa de forma arbitraria; se mide empiricamente sobre el estado real de la suite de pruebas.

### Procedimiento de Medicion

1. **Limpiar perfiles previos:**
   ```bash
   rm -rf cov_profile cov.lcov
   ```
2. **Ejecutar suite completa recolectando perfiles:**
   ```bash
   # En backend:
   deno test --coverage=cov_profile tests/
   # En frontend (o monorepo):
   deno test --coverage=cov_profile front/
   ```
3. **Generar reporte consolidado:**
   ```bash
   deno coverage cov_profile
   ```
   Tambien se puede exportar en formato LCOV para inspeccion visual:
   ```bash
   deno coverage cov_profile --lcov > cov.lcov
   ```
4. **Extraer metricas por dimension:**
   Registrar con precision los valores porcentuales obtenidos para:
   - Cobertura de lineas (lines).
   - Cobertura de funciones (functions).
   - Cobertura de ramas (branches / statements).

---

## 2. Fijacion del Umbral Bloqueante

Una vez obtenidas las metricas de la linea base:

1. **Redondeo Conservador:**
   Fijar el umbral en la configuracion de CI (`ci.yml` o scripts de verificacion) en el valor medido, restando un maximo de 0.5% para tolerar variaciones menores de punto flotante.
   - *Ejemplo:* Si la medicion real es 82.47% en lineas y 79.10% en funciones, fijar los umbrales minimos en 82.00% y 78.50% respectivamente.
2. **Configuracion en Pipeline de CI:**
   Configurar el paso de cobertura en `.github/workflows/ci.yml` para exigir la bandera de umbral minimo:
   ```bash
   deno coverage cov_profile --lines=82 --functions=78
   ```
   Si el resultado cae por debajo de este valor, el comando debe finalizar con codigo de salida distinto de cero (exit 1), fallando el job y bloqueando el PR.

---

## 3. Politica de Trinquete (Ratchet Policy)

El principio de calidad innegociable exige que la cobertura solo puede aumentar, nunca disminuir:

### Reglas Cardinales
1. **Prohibido Bajar Umbrales:** Jamas se autoriza un commit o PR que reduzca el umbral de cobertura previamente consolidado en `main`.
2. **Consolidacion Automatica al Alza:**
   Cuando una nueva funcionalidad o refactorizacion eleva la cobertura global del proyecto (ejemplo: de 82% a 85%), el autor del PR debe actualizar la configuracion de CI fijando el nuevo valor (85%) como nuevo piso innegociable.
3. **Codigo Nuevo 100% Probado:**
   Todo nuevo caso de uso, servicio o entidad de dominio debe introducir pruebas unitarias exhaustivas para no diluir el promedio global.

---

## 4. Manejo de Exclusiones y Deuda Tecnica

En proyectos existentes con modulos heredados dificiles de probar:

1. **Aislamiento Explicito:**
   No se debe reducir el umbral general del proyecto para ocultar zonas sin cobertura. En su lugar, delimitar rutas de exclusion en la configuracion de coverage si son archivos de configuracion, migraciones o scripts generados.
2. **Registro de Deuda en ADR:**
   Cualquier modulo o componente excluido de la cobertura minima debe estar respaldado por un Architecture Decision Record (`ADR-NNN`) que justifique el motivo tecnico y establezca un plan de amortizacion de la deuda tecnica.
