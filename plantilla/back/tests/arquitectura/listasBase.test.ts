import { assert, assertEquals, assertThrows } from "@std/assert";
import {
  auditarTrinqueteListasBase,
  estandarConfig,
  filtrarConListaBase,
  limpiarRegistroUsoListasBase,
  type ListaBase,
  normalizarRutaListaBase,
} from "../../../estandar.config.ts";

Deno.test("Arquitectura - Autoverificacion sintetica del mecanismo de lista base con trinquete", () => {
  const usoSimulado = new Map<string, Set<string>>();

  function simularEjecucion(
    id: string,
    violaciones: { ruta: string; detalle: string }[],
    config: Record<string, ListaBase>,
  ) {
    const lista = config[id];
    const usadas = new Set<string>();
    const restantes = violaciones.filter((v) => {
      if (!lista) return true;
      const coincide = lista.entradas.some(
        (e) => normalizarRutaListaBase(e.ruta) === normalizarRutaListaBase(v.ruta),
      );
      if (coincide) {
        usadas.add(normalizarRutaListaBase(v.ruta));
      }
      return !coincide;
    });
    usoSimulado.set(id, usadas);
    return restantes;
  }

  // 1. Config vacia -> pasa sin errores y no descarta violaciones
  assertEquals(auditarTrinqueteListasBase({}), []);

  // 2. Caso valido: 1 violacion congelada con tope 1 y todo presente -> filtra la violacion y pasa trinquete
  const configValida: Record<string, ListaBase> = {
    "back/aliases": {
      tope: 1,
      entradas: [
        {
          ruta: "src/aplicacion/usecases/LegadoUseCase.ts",
          todo: "TODO(#todo/arquitectura): migrar import relativo a alias @dominio",
        },
      ],
    },
  };
  const violacionesReales = [
    { ruta: "src/aplicacion/usecases/LegadoUseCase.ts", detalle: "import ../dominio" },
    { ruta: "src/aplicacion/usecases/NuevoUseCase.ts", detalle: "import ../dominio" },
  ];
  limpiarRegistroUsoListasBase();
  const filtradas = filtrarConListaBase("back/aliases-synth", violacionesReales, {
    "back/aliases-synth": configValida["back/aliases"],
  });
  // La violacion en lista base se descarta; la violacion nueva real permanece
  assertEquals(filtradas.length, 1);
  assertEquals(filtradas[0].ruta, "src/aplicacion/usecases/NuevoUseCase.ts");

  usoSimulado.clear();
  simularEjecucion("back/aliases", [violacionesReales[0]], configValida);
  assertEquals(auditarTrinqueteListasBase(configValida, usoSimulado), []);

  // 3. Caso invalido (a): entradas.length > tope (verificacion estatica pura)
  const configSuperaTope: Record<string, ListaBase> = {
    "back/aliases": {
      tope: 1,
      entradas: [
        { ruta: "src/a.ts", todo: "TODO: corregir a" },
        { ruta: "src/b.ts", todo: "TODO: corregir b" },
      ],
    },
  };
  const erroresSupera = auditarTrinqueteListasBase(configSuperaTope);
  assertEquals(erroresSupera.length, 1);
  assert(erroresSupera[0].includes("superando el tope permitido de 1"));

  // 4. Caso invalido (b): entradas.length < tope -> exige "baja el tope a N" (verificacion estatica pura)
  const configDebajoTope: Record<string, ListaBase> = {
    "back/aliases": {
      tope: 2,
      entradas: [{ ruta: "src/a.ts", todo: "TODO: corregir a" }],
    },
  };
  const erroresDebajo = auditarTrinqueteListasBase(configDebajoTope);
  assertEquals(erroresDebajo.length, 1);
  assert(erroresDebajo[0].includes("baja el tope a 1"));

  // 5. Caso invalido (c): entrada sin todo no vacio (verificacion estatica pura)
  const configSinTodo: Record<string, ListaBase> = {
    "back/aliases": {
      tope: 1,
      entradas: [{ ruta: "src/a.ts", todo: "   " }],
    },
  };
  const erroresSinTodo = auditarTrinqueteListasBase(configSinTodo);
  assertEquals(erroresSinTodo.length, 1);
  assert(erroresSinTodo[0].includes("no tiene un 'todo' no vacio"));

  // 6. Caso invalido (d): entrada muerta (no corresponde a ninguna violacion real activa)
  const configEntradaMuerta: Record<string, ListaBase> = {
    "back/aliases": {
      tope: 1,
      entradas: [{ ruta: "src/yaCorregido.ts", todo: "TODO: ya fue corregido" }],
    },
  };
  usoSimulado.clear();
  simularEjecucion("back/aliases", [], configEntradaMuerta);
  const erroresMuerta = auditarTrinqueteListasBase(configEntradaMuerta, usoSimulado);
  assertEquals(erroresMuerta.length, 1);
  assert(erroresMuerta[0].includes("Entrada muerta"));

  // Y directamente en filtrarConListaBase lanza error con "Entrada muerta"
  limpiarRegistroUsoListasBase();
  assertThrows(
    () => filtrarConListaBase("back/aliases", [], configEntradaMuerta),
    Error,
    "Entrada muerta",
  );
  limpiarRegistroUsoListasBase();
});

Deno.test("Arquitectura - Trinquete de listasBase en estandar.config.ts (back)", () => {
  const errores = auditarTrinqueteListasBase(
    estandarConfig.listasBase,
    undefined,
    "back/",
  );

  assertEquals(
    errores,
    [],
    `Violaciones del trinquete en estandar.config.ts (listasBase back):\n${errores.join("\n")}`,
  );
});
