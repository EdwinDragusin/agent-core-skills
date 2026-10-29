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

## 1. Definicion Institucional del Rol
*(Descripcion en lenguaje claro del rol humano dentro de la organizacion).*
Servidor publico o usuario responsable de la gestion, configuracion y dictaminacion de los procesos del sistema. Actua como autoridad operativa en el servicio.

### Proposito en la Organizacion
- Asegurar la continuidad y correcta administracion de los expedientes.
- Garantizar el apego a la normatividad institucional y atencion al ciudadano.

### Flujo Tipico de Trabajo Diario
1. Ingresa a la plataforma al inicio de su jornada laboral.
2. Consulta el tablero de solicitudes o expedientes pendientes.
3. Revisa y dictamina las evaluaciones asignadas.
4. Emite los reportes de resultados correspondientes.

---

## 2. Matriz de Responsabilidades y Casos de Uso
| Caso de Uso | Descripcion en Lenguaje Comun | Nivel de Acceso |
|---|---|---|
| [[CU-001-nombre-caso-de-uso\|CU-001]] | Alta y configuracion de nuevos expedientes | Total |

---

## 3. Especificacion Tecnica de Acceso y Seguridad (Para Ingenieria)
- **Canal de Ingreso**: Portal Web de Gestion Administrativa (SPA independiente).
- **Mecanismo de Autenticacion**: Correo institucional y contrasena robusta con hashing Argon2id.
- **Sesion y Token**: JWT firmado con verificacion de no revocacion en tabla de sesiones.
- **Politica RBAC**: Rol `ADMINISTRADOR` verificado en interceptores de API backend.
