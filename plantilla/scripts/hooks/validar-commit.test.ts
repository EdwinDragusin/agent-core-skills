function assertEquals<T>(actual: T, expected: T, mensaje?: string): void {
  if (actual !== expected) {
    throw new Error(
      mensaje ?? `Asercion fallida: esperado ${expected}, obtenido ${actual}`,
    );
  }
}

import {
  contieneEmoji,
  contieneLineaAtribucion,
  esMensajeExento,
  extraerAsuntoDeArchivo,
  REGEX_CONVENCIONAL,
  validarMensajeCommit,
  validarMensajeCompleto,
  validarTextoStdinMensajes,
} from "./validar-commit.ts";

Deno.test("REGEX_CONVENCIONAL valida correctamente la sintaxis base", () => {
  const casos: [string, boolean][] = [
    ["feat(ci): soporte para pipeline", true],
    ["fix(front/auth): corregir refresco de sesion", true],
    ["chore(validar-commit): agregar pruebas", true],
    ["docs(guia): actualizar manual", true],
    ["test(scripts): cobertura de validador", true],
    ["ci(actions): configurar runners", true],
    ["schema(db): migracion de tablas", true],
    ["feat(ci): 123 iniciar con numero", true],
    ["feat: sin alcance", false],
    ["feat(): alcance vacio", false],
    ["FEAT(ci): tipo en mayusculas", false],
    ["feat(CI): alcance en mayusculas", false],
    ["feat(ci): Mensaje con Mayuscula", false],
    ["custom(ci): tipo desconocido", false],
    ["feat(ci):", false],
  ];

  for (const [mensaje, esperado] of casos) {
    assertEquals(
      REGEX_CONVENCIONAL.test(mensaje),
      esperado,
      `Fallo en regex para: "${mensaje}"`,
    );
  }
});

Deno.test("contieneEmoji detecta caracteres fuera de BMP y dentro de BMP", () => {
  assertEquals(contieneEmoji("texto normal sin emojis"), false);
  assertEquals(contieneEmoji("texto con cohete \u{1F680}"), true);
  assertEquals(contieneEmoji("texto con estrella \u{2B50}"), true);
  assertEquals(contieneEmoji("texto con reloj \u{231A}"), true);
  assertEquals(contieneEmoji("texto con advertencia \u{26A0}\u{FE0F}"), true);
});

Deno.test("esMensajeExento identifica excepciones nativas de git", () => {
  assertEquals(
    esMensajeExento("Merge branch 'main' of github.com:org/repo"),
    true,
  );
  assertEquals(esMensajeExento('Revert "feat(ci): cambio anterior"'), true);
  assertEquals(esMensajeExento("fixup! feat(ci): ajuste rapido"), true);
  assertEquals(esMensajeExento("squash! feat(ci): colapsar commit"), true);
  assertEquals(esMensajeExento("feat(ci): commit regular"), false);
});

Deno.test("extraerAsuntoDeArchivo descarta comentarios y lineas vacias", () => {
  const contenidoConComentarios = `
# Esto es un comentario de git
# Otra linea de ayuda

feat(ci): mensaje real tras comentarios
# Comentario posterior
`;
  assertEquals(
    extraerAsuntoDeArchivo(contenidoConComentarios),
    "feat(ci): mensaje real tras comentarios",
  );

  const contenidoVacio = `
# Solo comentarios
# Nada mas
`;
  assertEquals(extraerAsuntoDeArchivo(contenidoVacio), null);
});

Deno.test("validarMensajeCommit valida casos de la matriz de reglas", () => {
  const casos: {
    nombre: string;
    mensaje: string;
    valido: boolean;
  }[] = [
    {
      nombre: "caso valido estandar",
      mensaje: "feat(ci): agregar script de validacion",
      valido: true,
    },
    {
      nombre: "alcance compuesto con barra a/b",
      mensaje: "fix(front/auth): corregir refresco de sesion",
      valido: true,
    },
    {
      nombre: "alcance con guiones",
      mensaje: "chore(validar-commit): agregar pruebas unitarias",
      valido: true,
    },
    {
      nombre: "merge exento",
      mensaje: "Merge pull request #10 from rama",
      valido: true,
    },
    {
      nombre: "revert exento",
      mensaje: 'Revert "feat(ci): revertir commit previo"',
      valido: true,
    },
    {
      nombre: "fixup exento",
      mensaje: "fixup! feat(ci): corregir commit",
      valido: true,
    },
    {
      nombre: "squash exento",
      mensaje: "squash! feat(ci): fusionar commit",
      valido: true,
    },
    {
      nombre: "sin alcance",
      mensaje: "feat: agregar funcionalidad sin alcance",
      valido: false,
    },
    {
      nombre: "mayuscula inicial en descripcion",
      mensaje: "feat(ci): Agregar funcionalidad con mayuscula",
      valido: false,
    },
    {
      nombre: "acento agudo",
      mensaje: "feat(ci): acci\u00F3n no permitida",
      valido: false,
    },
    {
      nombre: "acento real comprobado",
      mensaje: "feat(ci): depuraci\u00F3n de hooks",
      valido: false,
    },
    {
      nombre: "letra ene comprobada",
      mensaje: "fix(ci): dise\u00F1o de pruebas",
      valido: false,
    },
    {
      nombre: "emoji",
      mensaje: "feat(ci): agregar hook exitoso \u{1F389}",
      valido: false,
    },
    {
      nombre: "tipo invalido",
      mensaje: "custom(ci): tipo no convencional",
      valido: false,
    },
    {
      nombre: "longitud mayor a 100 caracteres",
      mensaje: "feat(ci): " + "a".repeat(95),
      valido: false,
    },
    {
      nombre: "longitud exactamente 100 caracteres",
      // "feat(ci): " tiene 10 caracteres. Sumamos 90 'a' = 100
      mensaje: "feat(ci): " + "a".repeat(90),
      valido: true,
    },
    {
      nombre: "mensaje vacio",
      mensaje: "   ",
      valido: false,
    },
  ];

  for (const c of casos) {
    const res = validarMensajeCommit(c.mensaje);
    assertEquals(
      res.valido,
      c.valido,
      `Fallo en caso "${c.nombre}": "${c.mensaje}". Error: ${res.error}`,
    );
  }
});

Deno.test("contieneLineaAtribucion detecta lineas de atribucion prohibidas", () => {
  assertEquals(
    contieneLineaAtribucion("Co-Authored-By: Claude <noreply@anthropic.com>"),
    true,
  );
  assertEquals(
    contieneLineaAtribucion("co-authored-by: dev <dev@example.com>"),
    true,
  );
  assertEquals(
    contieneLineaAtribucion("CO-AUTHORED-BY: User <user@example.com>"),
    true,
  );
  assertEquals(
    contieneLineaAtribucion("Generated with Claude Code"),
    true,
  );
  assertEquals(
    contieneLineaAtribucion("generated with copilot"),
    true,
  );
  assertEquals(
    contieneLineaAtribucion("Este commit fue generated with ai"),
    true,
  );
  assertEquals(
    contieneLineaAtribucion("Cuerpo descriptivo normal sin atribucion"),
    false,
  );
});

Deno.test("validarMensajeCompleto rechaza atribuciones y acepta cuerpos normales", () => {
  // Rechazo por Co-Authored-By
  const conCoAuthoredBy = `feat(ci): agregar nuevo runner

Explicacion del cambio.

Co-Authored-By: Claude <noreply@anthropic.com>`;
  const resCoAuthored = validarMensajeCompleto(conCoAuthoredBy);
  assertEquals(resCoAuthored.valido, false);

  // Rechazo por co-authored-by en minusculas
  const conCoAuthoredMin = `fix(front/auth): refrescar token

co-authored-by: persona <p@example.com>`;
  const resCoAuthoredMin = validarMensajeCompleto(conCoAuthoredMin);
  assertEquals(resCoAuthoredMin.valido, false);

  // Rechazo por Generated with Claude Code
  const conGeneratedWith = `docs(guia): actualizar guia de hooks

Generated with Claude Code`;
  const resGenWith = validarMensajeCompleto(conGeneratedWith);
  assertEquals(resGenWith.valido, false);

  // Cuerpo normal aceptado
  const cuerpoNormal = `feat(ci): agregar nuevo runner

Este commit introduce el nuevo runner de integracion continua.
Se detallan los componentes afectados y el procedimiento de despliegue.`;
  const resNormal = validarMensajeCompleto(cuerpoNormal);
  assertEquals(resNormal.valido, true);

  // Comentarios (#) de git ignorados en la validacion
  const conComentariosGit = `feat(ci): soporte para pipeline

# Co-Authored-By: simulado dentro de plantilla git
Cuerpo valido sin atribuciones activas.`;
  const resComentarios = validarMensajeCompleto(conComentariosGit);
  assertEquals(resComentarios.valido, true);
});

Deno.test("validarTextoStdinMensajes valida lote con mensaje valido e invalido", () => {
  const msgValido =
    `feat(ci): mensaje valido en lote\n\nCuerpo explicativo normal.`;
  const msgInvalido =
    `feat(ci): mensaje invalido en lote\n\nCo-Authored-By: Alguien <alguien@ejemplo.com>`;
  const flujo = `${msgValido}\0${msgInvalido}\0`;

  const res = validarTextoStdinMensajes(flujo);
  assertEquals(res.valido, false);
  assertEquals(res.errores.length, 1);
  assertEquals(res.errores[0].asunto, "feat(ci): mensaje invalido en lote");

  // Caso donde todos son validos
  const msgValido2 = `fix(front): correccion de estilo\n\nSin atribuciones.`;
  const flujoValido = `${msgValido}\0${msgValido2}\0`;
  const resValido = validarTextoStdinMensajes(flujoValido);
  assertEquals(resValido.valido, true);
  assertEquals(resValido.errores.length, 0);
});
