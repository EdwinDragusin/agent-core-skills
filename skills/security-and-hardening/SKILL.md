---
name: security-and-hardening
description: "Endurece contra OWASP Top 10: validacion en fronteras, authn/sesiones, inyecciones, secretos, PII y dependencias."
---

# Security and Hardening - Seguridad por Diseno y Auditoria OWASP

Complementa `exception-resilience-mastery` (que gobierna OWASP A10:2025 Fail-Closed, API7:2023 y RFC 9457) cubriendo los controles preventivos de seguridad en **Fase 2, 3A, 3B y 4**.

## 1. Controles Innegociables por Superficie

| Superficie | Regla de Hardening Obligatoria |
| :--- | :--- |
| **Entradas de Usuario** | **Nunca confies en el cliente.** Valida esquema, tipo, longitud maxima y rango en el backend antes de tocar la capa de aplicacion. Rechaza campos desconocidos (*strict schemas*). |
| **Consultas a Base de Datos** | **100% Parametrizadas.** Prohibido concatenar o interpolar strings en consultas SQL, Cypher o NoSQL. |
| **Autenticacion y Sesiones** | Hashing de contrasenas con Argon2id o bcrypt (factor >= 12). Tokens de sesion en cookies `HttpOnly; Secure; SameSite=Lax/Strict`. Comparacion de firmas/hashes en tiempo constante (`timingSafeEqual`). |
| **Autorizacion (BOLA / IDOR)** | Verifica la propiedad del recurso en **cada** caso de uso filtrando por el `usuarioId` o `tenantId` autenticado en la misma consulta de base de datos, nunca solo ocultando botones en la UI. |
| **Salida en Frontend (XSS)** | Prohibido usar `dangerouslySetInnerHTML`, `v-html` o `innerHTML` con datos de usuario sin sanitizacion estricta con lista blanca (DOMPurify). |
| **Peticiones Salientes (SSRF)** | Si el backend recibe una URL externa, valida protocolo (`https`), resuelve el DNS y bloquea rangos de IP privados/loopback (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.169.254`). |
| **Secretos y Credenciales** | Cero credenciales, API keys o tokens hardcodeados en codigo, tests, notas de Obsidian o historial Git. Todo secreto se inyecta por variables de entorno validadas al arranque. |
| **Dependencias (Supply Chain)** | En Fase 2 (`ponytail`), instala el minimo de paquetes externos. Fija versiones exactas en el lockfile y verifica ausencia de CVEs criticos. |
