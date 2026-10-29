# Contratos en APIs Publicas y Documentacion Modular (FSD y Arquitecturas Basadas en Capas)

En arquitecturas modulares (como Feature-Sliced Design, Clean Architecture o librerias por capas), el codigo se organiza en rebanadas (*slices*) y modulos cohesivos. La documentacion in-code debe explicitar la **API publica** y los limites de cada segmento.

---

## 1. Principios de Documentacion Modular

1. **El Principio del "Por Que":** La estructura modular ya hace que el "Como" tecnico sea evidente. Los comentarios deben centrarse en el contexto de negocio, los trade-offs y la razon de diseno.
2. **Contratos Explicitos en `index.ts`:** Cada modulo o *slice* debe exponer su funcionalidad exclusivamente a traves de un archivo barril (`index.ts`) debidamente documentado.
3. **Props de Componentes Reutilizables:** Toda interfaz de propiedades de componentes base debe documentar el proposito de cada prop, estados interactivos y consideraciones de accesibilidad.
4. **Excepciones Arquitectonicas Vinculadas a ADRs:** Desviaciones temporales o acoplamientos excepcionales deben etiquetarse formalmente con `// TODO(arquitectura)` vinculando al registro de decision correspondiente.

---

## 2. Patrones de Documentacion

### A. API Publica de Modulo o Slice (`index.ts`)

```typescript
/**
 * Modulo: Autenticacion de Usuarios (features/auth)
 * 
 * Expone la funcionalidad de inicio de sesion, verificacion de credenciales,
 * gestion de tokens de sesion y guardias de navegacion.
 */

export { LoginForm } from "./ui/LoginForm.tsx";
export { AuthGuard } from "./ui/AuthGuard.tsx";
export { useAuthSession } from "./model/useAuthSession.ts";
export type { AuthCredentials, UserSession } from "./model/types.ts";
```

### B. Interfaces de Props en Componentes Reutilizables

```typescript
/** Propiedades del componente Button con soporte para accesibilidad y estados de carga */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  /** Indica si la accion esta en progreso; muestra spinner y bloquea interaccion */
  isLoading?: boolean;
  /** Identificador semantico para pruebas automatizadas */
  testId?: string;
}

/** Variantes visuales y dimensionales del sistema de diseno */
interface ButtonVariants {
  /** Variante cromatica: 'primary', 'secondary', 'outline', 'destructive' */
  variant?: "primary" | "secondary" | "outline" | "destructive";
  /** Escala dimensional: 'sm' (compacto), 'md' (estandar), 'lg' (prominente) */
  size?: "sm" | "md" | "lg";
}
```

### C. Excepciones Arquitectonicas Temporales

```typescript
// TODO(arquitectura): Importacion cruzada temporal entre modulos de igual jerarquia.
// Ver justificacion tecnica y plan de mitigacion en docs/adr/ADR-015-cross-slice-auth.md
```
