# Jerarquía de Excepciones, Tipado y Causalidad en Deno 2.x y Clean Architecture

El entorno Deno 2.x proporciona constructores de errores nativos basados en clases que permiten bifurcación de tipos precisa y diagnósticos inmediatos.

---

## 1. Desambiguación de Permisos en Deno 2.0 (`NotCapable` vs `PermissionDenied`)

En Deno 1.x, tanto la falta de permisos de ejecución `--allow-*` como la falta de permisos en el sistema de archivos del sistema operativo emitían `Deno.errors.PermissionDenied`. 

Deno 2.0 introduce `Deno.errors.NotCapable` para separar explícitamente ambos escenarios:

| Excepción Deno | Origen del Error | Causa Raíz |
| :--- | :--- | :--- |
| `Deno.errors.NotCapable` | Flags de ejecución de Deno | El proceso no fue iniciado con los permisos requeridos (ej. faltó `--allow-net` o `--allow-read`). |
| `Deno.errors.PermissionDenied` | Sistema Operativo Host | El proceso tiene el permiso de Deno, pero el usuario del sistema operativo carece de privilegios sobre el archivo/recurso. |

---

## 2. Patrón de Excepciones Personalizadas con Causalidad y Limpieza de Stack

```typescript
/**
 * Clase base para todas las excepciones de dominio del sistema
 */
export class ExcepcionDominio extends Error {
  public readonly codigo: string;
  public readonly timestamp: Date;
  public readonly detallesValidacion?: Array<{ name: string; reason: string }>;

  constructor(
    codigo: string,
    mensaje: string,
    opciones?: {
      cause?: unknown;
      detallesValidacion?: Array<{ name: string; reason: string }>;
    }
  ) {
    super(mensaje, { cause: opciones?.cause });
    this.name = "ExcepcionDominio";
    this.codigo = codigo;
    this.timestamp = new Date();
    this.detallesValidacion = opciones?.detallesValidacion;

    // Omite el constructor en la traza de pila de V8 para mayor claridad operativa
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExcepcionDominio);
    }
  }
}
```

---

## 3. Manejo de Recursos con Bloques Try/Finally y Protocolo `using` (Explicit Resource Management)

Para prevenir bloqueos de recursos, conexiones huérfanas o fugas de descriptores de archivos, Deno soporta el estándar ECMAScript de gestión explícita de recursos:

```typescript
// Patron 1: Protocolo Disposable (Symbol.dispose / Symbol.asyncDispose)
export class ConexionTransaccional implements AsyncDisposable {
  private activa = true;

  async [Symbol.asyncDispose]() {
    if (this.activa) {
      console.log("Liberando conexion y revirtiendo estado pendiente.");
      await this.rollback();
    }
  }

  async commit() {
    this.activa = false;
  }

  async rollback() {
    this.activa = false;
  }
}

// Uso seguro con 'await using'
export async function procesarTransaccion() {
  await using tx = new ConexionTransaccional();
  // Si ocurre una excepcion aqui, tx[Symbol.asyncDispose]() se invoca automaticamente
  // garantizando el rollback inmediato sin depender de un bloque catch manual.
}
```

---

## 4. Anti-patrones de Manejo de Excepciones vs Patrones Canónicos

### Anti-patrón 1: Captura y Silenciamiento (Empty Catch / CWE-390)
```typescript
// INCORRECTO: Silencia el error y deja el sistema en estado inconsistente
try {
  await guardarEnBaseDeDatos(datos);
} catch (e) {
  // Sin accion, no se relanza ni se registra
}

// CORRECTO: Manejo explicito, registro seguro y relanzamiento tipado
try {
  await guardarEnBaseDeDatos(datos);
} catch (error) {
  throw new ExcepcionDominio(
    "ERROR_PERSISTENCIA",
    "No fue posible guardar el registro de postulacion",
    { cause: error }
  );
}
```

### Anti-patrón 2: Pérdida de la Causa Raíz
```typescript
// INCORRECTO: Se pierde el error original de la base de datos
try {
  await repo.ejecutar();
} catch (err) {
  throw new Error("Fallo la consulta");
}

// CORRECTO: Preservacion del arbol de causa
try {
  await repo.ejecutar();
} catch (err) {
  throw new Error("Fallo la consulta", { cause: err });
}
```

### Anti-patrón 3: Retorno de Mensajes de Base de Datos al Cliente
```typescript
// INCORRECTO: Fuga de esquema y estructura de BD
catch (err: any) {
  return c.json({ error: err.message }, 500); // ej. "duplicate key value violates unique constraint 'usuarios_email_key'"
}

// CORRECTO: Mapeo a excepcion de dominio
catch (err: any) {
  if (err.code === "23505") { // Codigo Postgres de unique violation
    throw new ExcepcionDominio("CORREO_DUPLICADO", "El correo electronico ya se encuentra registrado.");
  }
  throw err;
}
```
