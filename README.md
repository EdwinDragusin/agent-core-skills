# Agent Core Skills

[![CI](https://github.com/EdwinDragusin/agent-core-skills/actions/workflows/ci-governance.yml/badge.svg)](https://github.com/EdwinDragusin/agent-core-skills/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version: 3.0.0](https://img.shields.io/badge/version-3.0.0-blue.svg)](./plugin.json)

Plugin de gobernanza de ingenieria de software, reglas de arquitectura y catalogo de habilidades tecnicas complementarias a Superpowers.

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Instalacion](#instalacion)
- [Uso](#uso)
- [Regeneracion de la Plantilla](#regeneracion-de-la-plantilla)
- [Plugin Complementario: Extras](#plugin-complementario-extras)
- [Contribucion](#contribucion)
- [Licencia](#licencia)

## Descripcion

`agent-core-skills` provee un nucleo delgado de gobernanza para agentes de Inteligencia Artificial en entornos de desarrollo:
- Reglas permanentes en `rules/AGENTS.md` (modo Ponytail, Caveman, anti-emojis y compuertas de plan pre-fase).
- Instrucciones tecnicas de Clean Architecture, concurrencia optimista (CAS `version`), observabilidad tipada y Feature-Sliced Design (FSD).
- Catalogo de 17 skills de ingenieria (incluyendo `adoptar-estandar`).
- Delegacion del ciclo generico de desarrollo en el framework oficial de Superpowers.

> [!NOTE]
> Las herramientas de metodologia SDLC en 5 fases, agentes especializados y protocolo MCP dinamico residen en el repositorio complementario `agent-core-extras`.

## Instalacion

### En Antigravity (2 pasos)

1. Instalar Superpowers desde su marketplace oficial o directorio local:
```bash
agy plugin install superpowers@superpowers-marketplace
```

2. Instalar el nucleo de Agent Core Skills:
```bash
agy plugin install agent-core-skills@agent-core-skills-marketplace
```

### En Claude Code (1 paso)

Claude Code resuelve dependencias de marketplace automaticamente a traves de `.claude-plugin/plugin.json`:
```bash
claude plugin install agent-core-skills
```

## Uso

Una vez instalado, el agente carga automaticamente las directivas de `rules/AGENTS.md`.

Para auditar y transferir la infraestructura de calidad, hooks de Git y CI a un proyecto existente o nuevo:
```bash
/adoptar-estandar
```

El flujo ejecuta:
1. Auditoria de solo lectura contra `plantilla/MANIFIESTO.md`.
2. Plan de adopcion estructurado en olas independientes.
3. Verificacion por mutacion de cada mecanismo de proteccion.

## Regeneracion de la Plantilla

Para sincronizar o regenerar los mecanismos estandar desde el repositorio de referencia:
```bash
deno run -A scripts/extraer-plantilla.ts <ruta-repositorio-referencia>
```

El script copia y filtra las secciones de proyecto, garantizando idempotencia y verificando la ausencia de terminos de dominio especificos.

## Plugin Complementario: Extras

Para proyectos que requieran el pipeline SDLC orquestado en 5 fases, los 8 subagentes periciales y la integracion de servidores MCP (Obsidian, Codebase Memory, Playwright):
- Repositorio: [EdwinDragusin/agent-core-extras](https://github.com/EdwinDragusin/agent-core-extras)

## Contribucion

1. Todo cambio requiere una rama dedicada (`git checkout -b <tipo>/<descripcion>`).
2. Commits bajo formato Conventional Commits en espanol, minusculas, sin acentos y sin emojis.
3. Ejecutar las comprobaciones de gobernanza antes de enviar Pull Request:
```bash
powershell -ExecutionPolicy Bypass -File scripts/plugin-lint.ps1
deno run --allow-read ./scripts/validate_readme.ts ./README.md
```

## Licencia

Distribuido bajo la licencia MIT. Consulta [LICENSE](./LICENSE) para mas detalles.
SPDX-License-Identifier: MIT
