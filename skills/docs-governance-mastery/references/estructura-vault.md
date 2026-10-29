# Estructura Canonica del Vault de Documentacion

Estructura obligatoria para `docs/` segun Guia Maestra de Arquitectura:

```text
docs/
├── .obsidian/                     # Ajustes vault (Dataview, Templater, DBML ERD)
├── _plantillas/                   # Plantillas maestras
│   ├── PLANTILLA-ADR.md
│   ├── PLANTILLA-Actor.md
│   ├── PLANTILLA-CU.md
│   ├── PLANTILLA-DS-CU.md
│   └── PLANTILLA-RN.md
├── adr/                           # Registros Nygard (Backend)
│   ├── ADR-000-historico-decisiones.md
│   ├── ADR-001-stack-tecnologico.md
│   └── frontend/                  # Registros Nygard (Frontend)
│       └── ADR-F001-stack-frontend.md
├── arquitectura/                  # arc42 estructurado en 12 secciones
│   ├── capitulo-01-introduccion-y-metas.md
│   ├── capitulo-02-restricciones.md
│   ├── capitulo-03-contexto-y-alcance.md
│   ├── capitulo-04-estrategia-solucion.md
│   ├── capitulo-05-vista-de-bloques/
│   │   ├── capa-de-aplicacion/
│   │   │   ├── catalogo-de-usecases.md
│   │   │   ├── ports-de-persistencia.md
│   │   │   └── vocabulario-de-errores.md
│   │   ├── modelo-de-dominio.md   # Modelo tactico DDD
│   │   ├── modelo-relacional.md   # Documentacion de persistencia
│   │   ├── Modelo_Dominio.drawio  # Editable vectorial opcional
│   │   ├── relacional.dbml        # Esquema DBML formal (version CAS)
│   │   └── relacional.svg         # Esquema renderizado
│   ├── capitulo-06-vista-de-ejecucion.md
│   ├── capitulo-07-vista-de-despliegue.md
│   ├── capitulo-08-conceptos-transversales.md
│   ├── capitulo-09-decisiones.md
│   ├── capitulo-10-requerimientos-de-calidad.md
│   ├── capitulo-11-riesgos-y-deuda-tecnica.md
│   ├── capitulo-12-glosario.md
│   ├── actores/                   # Fichas ACT-NNN.md
│   ├── diagramas-secuencia/       # DS-CU-NNN.md (Mermaid Clean Architecture)
│   ├── dto/                       # CATALOGO-DTO.md (Reconciliado RFC 9457)
│   ├── procesos/                  # Macroprocesos PB-NNN.md
│   └── reglas/                    # Reglas de negocio RN-XNN.md con ^ancla
├── auditorias/                    # Reportes AUDIT-NNN.md (Matriz D1-D10)
├── guia/                          # Marco Diataxis
│   ├── explicacion/
│   ├── how-to/
│   ├── referencia/
│   │   ├── casos-de-uso/          # CU-NNN.md
│   │   └── inicio.md              # MOC de referencia
│   └── tutoriales/
├── AGENTS.md                      # Manifiesto de gobernanza para LLMs
├── glosario.md                    # Lenguaje ubicuo unificado
├── README.md                      # Entrada principal Git
├── ROADMAP-V1.md                  # Hitos de entrega y versiones
└── TODO.md                        # Tablero dinamico Dataview
```
