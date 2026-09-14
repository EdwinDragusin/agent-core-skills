# Doc-Testing y Calidad Ejecutable de la Documentacion

## 1. El Principio de Documentacion como Codigo (Doc-Testing)

La regresion de documentacion ("documentation drift") ocurre cuando el codigo de produccion cambia pero los fragmentos de codigo ilustrativos del README permanecen intactos, convirtiendose en instrucciones falsas.

El doc-testing trata todo ejemplo de codigo en un archivo Markdown como una suite de aserciones ejecutables dentro de la canalizacion de CI/CD.

---

## 2. Ecosistema Python: Modulo doctest

En Python, el modulo estandar `doctest` extrae bloques de texto que emulan una sesion interactiva del interprete:

```python
"""
Ejemplo de doc-test:
>>> from mi_modulo import calcular_hash
>>> calcular_hash("admin")
'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
"""
```

### Ejecucion en CI
```bash
python -m doctest -v README.md
```
Si la salida en tiempo de ejecucion difiere un solo caracter de la transcripcion en el README, el pipeline de CI falla inmediatamente.

---

## 3. Ecosistema Rust: rustdoc y cargo test

Rust integra un compilador estricto para bloques de codigo en Markdown mediante `cargo test --doc`. Si un bloque carece de `fn main()`, `rustdoc` inyecta la envoltura automaticamente y somete el codigo al chequeo del borrow checker.

### Atributos Semanticos de Bloques en Rust

| Atributo en Markdown | Comportamiento del Analizador | Caso de Uso en Documentacion |
| -------------------- | ----------------------------- | ---------------------------- |
| ````rust`            | Compila y ejecuta normalmente verificando aserciones con `assert_eq!`. | Camino feliz (happy path) del paquete. |
| ````rust,should_panic` | Pasa si la compilacion es exitosa y el programa produce un panic en ejecucion. | Documentacion de entradas invalidas y manejo forzado de excepciones. |
| ````rust,no_run`     | Compila exitosamente pero omite la ejecucion. | Ejemplos que requieren servidores externos, sockets de red o bucles infinitos. |
| ````rust,compile_fail` | Pasa unicamente si el compilador arroja un error de tipado o borrow checker. | Demostracion intencional de violaciones de memoria o antipatrones. |

---

## 4. Ecosistema Deno y TypeScript: deno test --doc

En entornos Deno (como el presente monorepo), el motor soporta la verificacion nativa de fragmentos de codigo en Markdown:

```bash
deno test --doc README.md
```

### Requisitos para Bloques Ejecutables en Deno
- Los bloques deben indicar el lenguaje (`ts`, `js` o `typescript`).
- Los bloques que dependen de importaciones del proyecto deben usar los alias declarados en `deno.json` (`@dominio/`, `@aplicacion/`, `@infraestructura/`).
- Para bloques ilustrativos que no deben ejecutarse en pruebas automatizadas, se debe agregar el modificador `ignore`:
  ````markdown
  ```ts ignore
  // Codigo demostrativo no ejecutable
  ```
  ````

---

## 5. Criterios de Evaluacion en Auditoria

- Severidad Alta: Comandos o snippets en el README que arrojen errores de sintaxis o importaciones inexistentes al ejecutarse.
- Severidad Media: Ausencia de paso de doc-testing en la tuberia de CI (`.github/workflows/ci.yml` o `deno task ci`).
- Severidad Baja: Bloques de codigo sin declaracion de lenguaje (` ``` ` sin identificador `ts`, `bash`, `json`, `sql`).
