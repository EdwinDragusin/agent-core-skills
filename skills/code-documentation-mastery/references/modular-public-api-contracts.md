# Contratos en APIs Públicas y Documentación Modular (FSD y Arquitecturas Basadas en Capas)

En arquitecturas modulares (como Feature-Sliced Design, Clean Architecture o librerías por capas), el código se organiza en rebanadas (*slices*) y módulos cohesivos. La documentación in-code debe explicitar la **API pública** y los límites de cada segmento.

---

## 1. Principios de Documentación Modular

1. **El Principio del "Por Qué":** La estructura modular ya hace que el "Cómo" técnico sea evidente. Los comentarios deben centrarse en el contexto de negocio, los trade-offs y la razón de diseño.
2. **Contratos Explícitos en `index.ts`:** Cada módulo o *slice* debe exponer su funcionalidad exclusivamente a través de un archivo barril (`index.ts`) debidamente documentado.
3. **Props de Componentes Reutilizables:** Toda interfaz de propiedades de componentes base debe documentar el propósito de cada prop, estados interactivos y consideraciones de accesibilidad.
4. **Excepciones Arquitectónicas Vinculadas a ADRs:** Desviaciones temporales o acoplamientos excepcionales deben etiquetarse formalmente con `// TODO(arquitectura)` vinculando al registro de decisión correspondiente.

---

## 2. Patrones de Documentación

### A. API Pública de Módulo o Slice (`index.ts`)

```typescript
/**
 * Modulo: Autenticación de Usuarios (features/auth)
 * 
 * Expone la funcionalidad de inicio de sesión, verificación de credenciales,
 * gestión de tokens de sesión y guardias de navegación.
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
  /** Indica si la acción está en progreso; muestra spinner y bloquea interacción */
  isLoading?: boolean;
  /** Identificador semántico para pruebas automatizadas */
  testId?: string;
}

/** Variantes visuales y dimensionales del sistema de diseño */
interface ButtonVariants {
  /** Variante cromática: 'primary', 'secondary', 'outline', 'destructive' */
  variant?: "primary" | "secondary" | "outline" | "destructive";
  /** Escala dimensional: 'sm' (compacto), 'md' (estándar), 'lg' (prominente) */
  size?: "sm" | "md" | "lg";
}
```

### C. Excepciones Arquitectónicas Temporales

```typescript
// TODO(arquitectura): Importación cruzada temporal entre módulos de igual jerarquía.
// Ver justificación técnica y plan de mitigación en docs/adr/ADR-015-cross-slice-auth.md
```
