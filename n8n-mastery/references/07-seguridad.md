# 07 · Seguridad y Zero Trust en n8n

## CVEs Documentados: Vulnerabilidades Criticas

### CVE-2025-68613 — Sandbox Escape (CVSS 9.9)

**Vector**: evaluacion de expresiones en el subsistema de mapeo parametrico.

**Mecanismo**: un actor con acceso al disenio de flujos incrusta codigo JavaScript que burla el sandbox de la biblioteca evaluadora → acceso pleno al entorno Node.js del servidor.

**Impacto**:
- Ejecucion Remota de Codigo (RCE) completa.
- Secuestro del sistema operativo anfitron.
- Exfiltracion del repositorio criptografico de secretos.
- Acceso ilimitado a redes subyacentes.

**Mitigacion inicial**: sanadores sobre el AST para bloquear llamadas a funciones globales.

---

### CVE-2026-25049 — Bypass de Mitigacion de Sandbox

**Vector**: evasion del interceptor de funciones implementado como respuesta a CVE-2025-68613.

**Carga util documentada**:
```javascript
// Patron IIFE + destructuracion para eludir heuristica del interceptor
const { constructor: C } = (() => {})();
const proceso = C('return process')();
// proceso.env ahora contiene todos los secretos del servidor
```

**Tecnicas usadas**:
- Expresiones de Funciones Invocadas Inmediatamente (IIFE) como funciones flecha anonimas.
- Desestructuracion de objetos nativos para extraer constructores.
- Acceso encadenado al contexto global irrestricto.

---

### Vulnerabilidad de Derivacion Criptografica (GitGuardian)

- Dependencias defectuosas del nucleo limitaban la entropia efectiva del token secreto.
- En escenarios con usuarios OIDC, comprometer `N8N_ENCRYPTION_KEY` permitia:
  - Falsificacion directa de sesiones administrativas.
  - Sin necesidad de descifrado colateral de credenciales de IdP.

---

## Estrategia de Defensa: Zero Trust Multicapa

### Principio Base
No confiar en que el sandbox del codigo de la aplicacion sea la ultima linea de defensa. Asumir eventualidad de escape criptografico exitoso.

### Capa 1: Hardening de Workers (Queue Mode)

```yaml
# docker-compose.yml — worker con red restringida
services:
  n8n-worker:
    image: n8nio/n8n
    command: worker
    environment:
      - EXECUTIONS_MODE=queue
    networks:
      - internal    # SIN acceso a internet abierta
    # Solo tunel proxy definido hacia servicios autorizados
```

- Contenedores de workers: **sin acceso saliente irrestricto a internet**.
- Solo tuneles proxy estrictamente definidos hacia APIs autorizadas.
- Contencion determinista del blast radius ante RCE.

### Capa 2: Gobierno de Acceso al Lienzo

- **Prohibir edicion manual directa** en instancia de produccion.
- Despliegues exclusivamente via Git o herramientas de API automatizadas.
- Reducir superficie de ataque de cuentas con permisos administrativos.

```
# Flujo seguro de despliegue
Desarrollador → Pull Request en Git → Review → CI/CD pipeline → API REST n8n
                                                                (nunca acceso directo al lienzo de produccion)
```

### Capa 3: Gestion Criptografica Estricta

**Rotacion ante cualquier exposicion del repositorio**:
1. Sanear `N8N_ENCRYPTION_KEY` — generar nueva clave de 256 bits.
2. Rotar TODAS las API keys, tokens RSA y secretos almacenados en la BD de credenciales.
3. Revocar sesiones activas.
4. Auditar logs de acceso para detectar acceso previo no autorizado.

### Capa 4: Segregacion de Permisos MCP

```json
// config MCP — principio de minimo privilegio
{
  "n8n-mcp": {
    "permissions": ["read:workflows", "read:executions"],
    // NO incluir: write:workflows, manage:credentials, activate:workflows
    "allowedWorkflowIds": ["id1", "id2"]  // scope acotado si es posible
  }
}
```

---

## Checklist de Seguridad para Produccion

| Control | Estado Esperado |
|---|---|
| Version de n8n actualizada a la ultima estable | Siempre parcheado |
| `N8N_ENCRYPTION_KEY` generada con entropia real (no predecible) | 256 bits aleatorios |
| Acceso al lienzo de produccion solo via CI/CD | Sin edicion manual directa |
| Workers en red interna sin acceso irrestricto a internet | Restringido a proxies definidos |
| Tokens MCP con permisos minimos de solo lectura | Aplicado |
| Rotacion periodica de credenciales en BD n8n | Al menos trimestral |
| Audit logs de operaciones administrativas habilitados | Habilitado y monitorado |
| Flujos generados por IA revisados antes de activacion | Revision humana obligatoria |
| `N8N_BASIC_AUTH_ACTIVE=true` o SSO configurado | Nunca instancia sin autenticacion |

---

## Actualizaciones de Seguridad

Monitorear activamente:
- https://github.com/n8n-io/n8n/releases (changelog oficial)
- https://nvd.nist.gov/ (buscar CVE n8n)
- Canal `#security` en el Discord oficial de n8n

Politica recomendada: actualizar dentro de 72h ante cualquier CVE de severidad critica o alta.
