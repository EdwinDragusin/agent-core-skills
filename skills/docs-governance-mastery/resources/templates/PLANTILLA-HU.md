---
id: HISTORIAS-DE-USUARIO
titulo: "Catalogo Consolidado de Historias de Usuario"
tipo: especificacion-funcional
tags:
  - historias-usuario
  - bdd
  - requerimientos
---

# Catalogo Consolidado de Historias de Usuario

Este documento compila las Historias de Usuario del sistema bajo el formato bimodal accesible. Cada historia expresa la necesidad desde la perspectiva humana del rol, vinculada a sus Casos de Uso y formalizada mediante criterios de aceptacion Gherkin con anclas de bloque.

---

## Indice de Historias de Usuario
| ID | Titulo / Necesidad | Actor | Caso de Uso Vinculado |
|---|---|---|---|
| [[#^hu-001\|HU-001]] | Registro inicial de expediente | Administrador | [[CU-001-nombre-caso-de-uso\|CU-001]] |

---

## Detalle de Historias de Usuario

### HU-001: Registro inicial de expediente ^hu-001

#### Narrativa Bimodal
- **Como**: Administrador del servicio publico.
- **Quiero**: Registrar un nuevo expediente con los datos de identificacion del solicitante.
- **Para**: Iniciar formalmente su tramite de atencion dentro del marco normativo institucional.

#### Reglas de Negocio Vinculadas
- [[RN-X01-nombre-regla|RN-X01: Validacion de identidad unica]]

#### Criterios de Aceptacion (Formato Gherkin BDD)
```gherkin
Escenario: Registro exitoso de un nuevo expediente
  Dado que el Administrador ha iniciado sesion en el portal
  Y no existe un expediente previo registrado con el mismo identificador oficial
  Cuando ingresa los datos obligatorios del solicitante y confirma el alta
  Entonces el sistema registra el expediente en estado activo
  Y genera el comprobante de tramite para el solicitante
  Y emite un evento inmutable en la bitacora de auditoria. ^hu-001-exito

Escenario: Intento de registro con identificador duplicado
  Dado que existe previamente un expediente con el mismo identificador
  Cuando el Administrador intenta registrar un nuevo expediente con ese mismo dato
  Entonces el sistema detiene la operacion
  Y muestra un mensaje claro indicando que el registro ya existe en el padron
  Y no genera ningun cambio en el sistema. ^hu-001-duplicado
```
