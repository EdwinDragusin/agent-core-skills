---
id: HOWTO-002
tipo: how-to
titulo: "Como configurar y diagnosticar los hooks de git y convenciones de commit"
modulo: Gobernanza y Calidad
tags:
  - diataxis/how-to
  - git
  - githooks
  - convenciones
  - calidad
---

# Como configurar y diagnosticar los hooks de git y convenciones de commit

Esta guia describe el procedimiento operativo para instalar, verificar y diagnosticar los hooks automatizados de Git (`commit-msg` y `pre-push`) en el repositorio local, garantizando el cumplimiento estricto del estandar institucional de Conventional Commits y la higiene estatica del codigo antes de subir cambios.

---

## 1. Proposito de los Hooks de Git

El repositorio incluye dos hooks versionados en la carpeta `.githooks/`:

1. **`commit-msg`**:
   - Se ejecuta automaticamente en cada invocacion de `git commit`.
   - Invoca el validador `scripts/hooks/validar-commit.ts` pasando la ruta del archivo que contiene el mensaje preparado.
   - Si el mensaje no cumple la convencion en su asunto, supera los 100 caracteres, contiene acentos, emojis o lineas de atribucion prohibidas (tales como `Co-Authored-By` o `Generated with`), el hook rechaza el commit con codigo de salida `1` e imprime el motivo exacto del fallo.

2. **`pre-push`**:
   - Se ejecuta automaticamente antes de enviar ramas o commits al repositorio remoto (`git push`).
   - Lee las referencias enviadas por standard input (`<local_ref> <local_sha> <remote_ref> <remote_sha>`).
   - **Prohibicion de push a main**: Rechaza cualquier intento de push directo hacia la rama `main`, exigiendo integracion exclusiva via Pull Request.
   - **Validacion de rama**: Invoca `scripts/hooks/validar-rama.ts` para asegurar que la rama local cumpla con `<tipo>/<descripcion-kebab-case>`.
   - **Prohibicion de `--force`**: Valida que `remote_sha` sea ancestro de `local_sha` mediante `git merge-base --is-ancestor`, cancelando pushes que no sean fast-forward.
   - **Higiene estatica**: Invoca `deno task ci:rapido` para verificar formateo (`fmt:check`) y linter (`lint`) en backend (`back/`) y frontend (`front/`), impidiendo el envio de codigo que no cumple los estandares estaticos.

---

## 2. Instalacion Local de los Hooks

Para activar los hooks en tu entorno de trabajo local, ejecuta:

```bash
deno task hooks:install
```

Este comando configura la directiva `core.hooksPath` de Git para utilizar el directorio `.githooks` del repositorio:

```bash
git config core.hooksPath .githooks
```

### 2.1 Verificacion de la Instalacion

Comprueba que Git reconozca la ruta configurada:

```bash
git config --get core.hooksPath
```

Salida esperada:
```text
.githooks
```

### 2.2 Desactivacion Temporal

Si requieres restablecer los hooks a la configuracion por defecto de Git:

```bash
git config --unset core.hooksPath
```

---

## 3. Especificacion de Conventional Commits

Todo mensaje de commit debe cumplir con la siguiente estructura:

```text
<tipo>(<alcance>): <descripcion>
```

### 3.1 Reglas Obligatorias

- **Tipos Permitidos**:
  - `feat`: Nuevas caracteristicas o funcionalidades.
  - `fix`: Correccion de fallos o errores.
  - `docs`: Modificaciones exclusivamente en documentacion.
  - `test`: Adicion o modificacion de pruebas.
  - `refactor`: Cambios de codigo que no alteran comportamiento ni reparan fallos.
  - `chore`: Tareas de mantenimiento, dependencias o configuracion de herramientas.
  - `style`: Ajustes de formato o estilo que no afectan el significado del codigo.
  - `perf`: Optimizaciones de rendimiento.
  - `ci`: Modificaciones en pipelines, workflows o scripts de integracion continua.
  - `build`: Cambios en empaquetado o dependencias externas.
  - `schema`: Cambios en esquemas de base de datos o migraciones.
  - `revert`: Reversion de commits previos.
- **Alcance (`<alcance>`)**:
  - Obligatorio en todos los commits ordinarios.
  - Solo caracteres alfanumericos en minusculas y guiones, admitiendo jerarquia simple con barra (`/`).
  - Ejemplos: `(ci)`, `(validar-commit)`, `(front/auth)`, `(back/persistencia)`.
- **Descripcion**:
  - Debe iniciar en minuscula o digito numerico.
  - Sin acentos agudos, dieresis ni letra ene en el mensaje de commit (`a`, `e`, `i`, `o`, `u`, `u`, `n`).
  - Prohibicion total de emojis o pictogramas en cualquier posicion del mensaje.
- **Longitud**:
  - Maximo 100 caracteres en la primera linea (linea de asunto).
- **Prohibicion de Lineas de Atribucion**:
  - Prohibicion absoluta de lineas que comiencen con `Co-Authored-By:` o que contengan la expresion `Generated with` (sin distincion de mayusculas y minusculas), tanto en el asunto como en el cuerpo del commit.
- **Mensajes Exentos**:
  - Mensajes generados automaticamente por Git que inicien con `Merge `, `Revert "`, `fixup! ` o `squash! ` son aceptados sin validar formato convencional.

---

## 4. Matriz de Ejemplos

| Mensaje | Estado | Motivo |
|---|---|---|
| `feat(ci): implementar validador de mensajes` | Valido | Formato, longitud y caracteres correctos |
| `fix(front/auth): corregir refresco de sesion` | Valido | Alcance compuesto valido y descripcion en minusculas |
| `chore(ci): configurar tareas de hooks en deno.json` | Valido | Formato valido sin caracteres prohibidos |
| `Merge pull request #12 from usuario/rama` | Valido | Mensaje nativo de merge exento |
| `Agrega cosas` | Invalido | Falta tipo, alcance y dos puntos |
| `feat: agregar validador` | Invalido | Falta el alcance entre parentesis |
| `feat(ci): Agregar validador` | Invalido | Descripcion inicia con letra mayuscula |
| `feat(ci): validacion con acento en accion` | Invalido | Contiene caracteres con acento |
| `feat(ci): diseno con letra no permitida` | Invalido | Contiene caracter prohibido |
| `custom(ci): tipo desconocido` | Invalido | Tipo no admitido en el catalogo |
| `feat(ci): ` + 95 caracteres adicionales | Invalido | Supera el limite de 100 caracteres |
| `feat(ci): registrar tarea` + cuerpo con `Co-Authored-By` | Invalido | Linea de coautoria prohibida en el mensaje |
| `feat(ci): registrar tarea` + cuerpo con `Generated with` | Invalido | Expresion de generacion asistida no permitida |

---

## 5. Diagnostico y Resolucion de Rechazos

### 5.1 Rechazo por `commit-msg`

Si un commit no cumple las reglas, la consola muestra:

```text
[ERROR COMMIT]: "Agrega cosas"
  Motivo: El formato no cumple la convencion: tipo(alcance): descripcion en minusculas.
Tipos validos: feat, fix, docs, test, refactor, chore, style, perf, ci, build, schema, revert.
Ejemplo valido: chore(ci): configurar tareas de hooks y scripts
```

**Solucion**:
1. Ejecuta nuevamente `git commit` proporcionando un asunto valido:
   ```bash
   git commit -m "feat(ci): implementar validador de mensajes de commit"
   ```
2. Si requieres corregir el mensaje del commit mas reciente:
   ```bash
   git commit --amend -m "feat(ci): asunto corregido en minusculas"
   ```

### 5.2 Rechazo por `pre-push`

Si `git push` se cancela por proteccion de rama o integridad de historial:

1. **Push directo a main**:
   ```text
   [ERROR PRE-PUSH]: Prohibido push directo a main. Todo cambio debe integrarse mediante Pull Request.
   ```
   **Solucion**: Crear una rama de trabajo dedicada (`git checkout -b feat/mi-funcionalidad`) y enviar los cambios a dicha rama.

2. **Push no fast-forward (--force)**:
   ```text
   [ERROR PRE-PUSH]: Push no fast-forward rechazado (--force esta estrictamente prohibido).
   ```
   **Solucion**: Incorporar los cambios remotos actualizados mediante `git pull --rebase origin <rama>` antes de volver a enviar.

3. **Nombre de rama no valido**:
   ```text
   [ERROR RAMA]: El nombre de rama "..." no cumple con el formato obligatorio: <tipo>/<descripcion-kebab-case>.
   ```
   **Solucion**: Renombrar la rama local segun la convencion (`git branch -m <tipo>/<descripcion-kebab-case>`).

4. **Errores de formato o lint**:
   ```text
   Task fmt:check failed...
   ```
   **Solucion**: Ejecutar `deno task fmt`, `deno task lint` y verificar con `deno task ci:rapido`.

---

## 6. Validacion Automatizada en Pipeline de CI

Adicionalmente a los hooks locales, el archivo `.github/workflows/ci.yml` ejecuta el job `convenciones` en cada Pull Request hacia `main`. Este job valida todos los commits de la rama mediante:

```bash
git log --no-merges --format=%B%x00 origin/${{ github.base_ref }}..HEAD | deno run --allow-read scripts/hooks/validar-commit.ts --stdin-mensajes
```

El modo `--stdin-mensajes` recibe los mensajes completos delimitados por el caracter NUL (`\0`), permitiendo evaluar tanto la linea de asunto como la ausencia de atribuciones prohibidas en el cuerpo de cada commit. El modo `--stdin` permanece disponible para flujos que procesan unicamente lineas individuales de asunto.

Si cualquier commit de la rama contiene errores de formato o lineas de atribucion, el pipeline falla de forma preventiva impidiendo la integracion.
