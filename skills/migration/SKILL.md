---
name: migration
description: Ejecuta migraciones reversibles y sin tiempo de inactividad (Zero-Downtime) mediante el patron Expand-Migrate-Contract para esquemas de base de datos (DBML/SQL), contratos de API, configuraciones y dependencias.
---

# Migration — Transiciones Compatibles y Patron Expand/Contract

Toda modificacion de esquema de base de datos en produccion, contrato de API publica o dependencia central debe ser **compatible hacia atras durante la transicion** y poseer una ruta de rollback probada antes de ejecutarse.

## 1. El Patron Expand-Migrate-Contract (3 Fases)

Prohibido renombrar o eliminar directamente una columna, tabla o campo de API en un solo paso si existen consumidores o instancias en ejecucion:

1. **Fase 1 — EXPAND (Aditiva y Segura):**
   - Agrega la nueva columna (nullable o con `DEFAULT` no bloqueante) o el nuevo campo en el DTO sin eliminar el anterior.
   - Configura **Dual-Write** en el codigo: escribe simultaneamente en el campo viejo y en el nuevo; sigue leyendo del viejo (o del nuevo con fallback al viejo).
2. **Fase 2 — MIGRATE (Backfill en Lotes):**
   - Rellena los registros historicos en lotes pequeños controlados (`LIMIT 1000`) con pausas o transaccion por lote para no bloquear tablas con locks exclusivos largos.
   - Verifica paridad de datos (conteo de nulos = 0 y checksums iguales entre columna vieja y nueva).
   - Cambia las lecturas para consumir exclusivamente el campo nuevo.
3. **Fase 3 — CONTRACT (Limpieza Diferida):**
   - Una vez confirmado en produccion que ningun consumidor lee ni escribe el campo antiguo, elimina la escritura dual en codigo y posteriormente ejecuta el `DROP COLUMN` o retiro del endpoint deprecado.

## 2. Checklist de Seguridad antes de Ejecutar Migracion

- **Operaciones Peligrosas en PostgreSQL/SQL:** Usa `CREATE INDEX CONCURRENTLY` para no bloquear escrituras; agrega restricciones `NOT NULL` o `FOREIGN KEY` primero como `NOT VALID` y luego ejecuta `VALIDATE CONSTRAINT`.
- **Prueba de Ida y Vuelta (Up -> Down -> Up):** Ejecuta en entorno de prueba la migracion hacia adelante, verifica los datos, ejecuta el script de rollback (`down`), comprueba que el estado previo se restaura sin perdida, y vuelve a aplicar (`up`).
- **Sincronizacion Documental:** Actualiza el bloque ```` ```dbml ```` en `docs/arquitectura/04-modelo-de-datos-y-contratos.md` via MCP `obsidian`.
