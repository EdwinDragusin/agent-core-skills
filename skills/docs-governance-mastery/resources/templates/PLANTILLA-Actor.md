---
aliases:
  - Administrador
id: ACT-001
modulo: Identidad y Seguridad
nombre: Administrador
tags:
  - actor/administrador
---

# Actor: Administrador

## Definicion del Rol
Rol interno con permisos elevados para gestion y configuracion.

---

## Credenciales y Acceso
- **Canal de Ingreso**: Portal Web de Gestion.
- **Mecanismo de Autenticacion**: Usuario/email + contrasena con Argon2id.
- **Sesion**: JWT Bearer + verificacion en bitacora o tabla de sesiones.

---

## Matriz de Responsabilidades y Casos de Uso
| Caso de Uso | Descripcion de la Operacion | Nivel de Acceso |
|---|---|---|
| [[CU-001-nombre-caso-de-uso\|CU-001]] | Gestion de recursos principales | Total |
