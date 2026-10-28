# Presentación de Errores y Experiencia de Usuario (UI/UX) en Frontend

La presentación de errores en la interfaz de usuario debe balancear la claridad cognitiva, la accesibilidad (a11y) y la orientación hacia la auto-recuperación del usuario.

---

## 1. Mapeo de `invalid_params` a Formularios Accesibles

Cuando el backend devuelve un error 422/400 con `invalid_params`, la UI debe vincular cada error al campo correspondiente:

```tsx
import React from "react";

interface CampoFormularioProps {
  id: string;
  etiqueta: string;
  valor: string;
  error?: string;
  onChange: (valor: string) => void;
}

export const CampoTextoAccesible: React.FC<CampoFormularioProps> = ({
  id,
  etiqueta,
  valor,
  error,
  onChange,
}) => {
  const tieneError = Boolean(error);
  const errorId = `${id}-mensaje-error`;

  return (
    <div className="grupo-formulario">
      <label htmlFor={id} className="etiqueta-formulario">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={tieneError}
        aria-describedby={tieneError ? errorId : undefined}
        className={`input-base ${tieneError ? "input-con-error" : ""}`}
      />
      {tieneError && (
        <span id={errorId} className="mensaje-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
```

---

## 2. Componente de Fallo con Trace ID Copiable para Soporte Técnico

```tsx
import React, { useState } from "react";

interface BannerErrorProps {
  titulo: string;
  detalle: string;
  instanceTraceId: string;
  onReintentar?: () => void;
}

export const BannerErrorProblemDetails: React.FC<BannerErrorProps> = ({
  titulo,
  detalle,
  instanceTraceId,
  onReintentar,
}) => {
  const [copiado, setCopiado] = useState(false);

  const copiarTraceId = async () => {
    await navigator.clipboard.writeText(instanceTraceId);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="alerta-error-contenedor" role="region" aria-label="Notificacion de error">
      <h3 className="alerta-error-titulo">{titulo}</h3>
      <p className="alerta-error-detalle">{detalle}</p>

      <div className="alerta-error-footer">
        <span className="codigo-referencia">
          Referencia tecnica: <code>{instanceTraceId}</code>
        </span>
        <button
          type="button"
          onClick={copiarTraceId}
          className="boton-secundario-sm"
          aria-label="Copiar codigo de referencia para soporte tecnico"
        >
          {copiado ? "Copiado al portapapeles" : "Copiar codigo"}
        </button>

        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="boton-primario-sm"
          >
            Reintentar operacion
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 3. Error Boundary Granular en React

Evita que una falla no capturada en un componente hijo colapse toda la aplicación (pantalla blanca):

```tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  tieneError: boolean;
  error?: Error;
}

export class BoundaryErrorGranular extends Component<Props, State> {
  public override state: State = {
    tieneError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { tieneError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Fallo capturado en BoundaryErrorGranular:", error, errorInfo);
  }

  public override render() {
    if (this.state.tieneError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="estado-vacio-error">
          <h4>No fue posible cargar esta seccion</h4>
          <p>Ocurrio un problema al renderizar el contenido.</p>
          <button
            type="button"
            onClick={() => this.setState({ tieneError: false })}
            className="boton-reintento"
          >
            Intentar nuevamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```
