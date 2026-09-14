# Divergencia por Dominio Arquitectonico y Jerarquia de Monorepositorios

## 1. El Ecosistema Frontend: Prioridad Visual y Componentizacion

En repositorios orientados a interfaces de usuario (UI/UX), la documentacion debe mitigar la abstraccion mediante evidencia visual inmediata antes de profundizar en la sintaxis.

### Requisitos Mandatorios para Frontend

1. **Evidencia Visual Inmediata**:
   - Capturas de pantalla de alta fidelidad de las vistas principales.
   - Demostraciones animadas (GIFs o videos en bucle) para interacciones complejas, transiciones y flujos criticos.
   - Enlace directo a despliegues de demostracion en vivo (ej. Vercel, Netlify, Cloudflare Pages o ambiente de staging).
2. **Justificacion del Stack Tecnologico de UI**:
   - Decision de framework y version (React 19, Next.js, Vue, Vite).
   - Sistema de tipado y modo estricto (TypeScript).
   - Solucion de gestion de estado (Zustand, Redux Toolkit, Context API, Jotai).
   - Enfoque de estilos y diseño (Tailwind CSS, CSS Modules, Styled Components, tokens de diseño).
3. **Aislamiento de Componentes (Storybook y equivalentes)**:
   - Integracion documentada con herramientas de desarrollo en aislamiento (Storybook).
   - Uso de `@storybook/addon-docs` o `storybook-readme` para compilar tablas de propiedades (`props`), variantes visuales y estados de componentes (loading, empty, error).
   - Comandos explicitos para ejecutar el catalogo de componentes (`pnpm storybook`, `deno task storybook`).

---

## 2. El Ecosistema Backend: Infraestructura, Topologia y Contratos

Los entornos backend priorizan la resiliencia operativa, los flujos transaccionales y los contratos rigurosos de red.

### Requisitos Mandatorios para Backend

1. **Orquestacion de Infraestructura y Contenedores**:
   - Comandos deterministas de Docker y Docker Compose (`docker compose up -d`) para garantizar paridad entre entornos local, staging y produccion.
   - Instrucciones explicitas para bases de datos locales, motores auxiliares (Redis, Gotenberg, Mailer) y servicios de almacenamiento.
2. **Gestion Estricta de Variables de Entorno**:
   - Tabla descriptiva de variables de entorno indicando: Nombre, Obligatoriedad, Tipo/Default y Proposito.
   - Sincronizacion obligatoria 1:1 con un archivo `.env.example` en la raiz del modulo.
3. **Migraciones y Ciclo de Vida de Datos**:
   - Comandos para generacion, aplicacion y rollback de migraciones de base de datos (`drizzle-kit`, `prisma`, `knex`).
   - Comandos para siembra de datos base y escenarios de desarrollo (`seed`, `bootstrap`).
4. **Contratos de Integracion de API**:
   - Superficie de la API (REST, GraphQL, gRPC, WebSockets).
   - Ejemplos reproducibles de llamadas de red utilizando `curl` con cabeceras y payloads realistas.
   - Esquemas de autenticacion explicados (Bearer JWT HS256/RS256, OAuth2, API Keys).
5. **Topologia y Delegacion a ARCHITECTURE.md**:
   - Si la topologia excede dos capas o involucra buses de eventos y microservicios, el README debe resumir el flujo y delegar el diseño exhaustivo a un archivo `ARCHITECTURE.md` o al vault de arquitectura (`docs/`).

---

## 3. Jerarquia Documental en Monorepositorios

Cuando el repositorio alberga multiples aplicaciones y librerias compartidas (Deno Workspaces, Turborepo, Nx, Bazel), la documentacion debe articularse en una topologia de tres niveles:

| Nivel Jerarquico | Ubicacion | Rol y Alcance de la Documentacion |
| ---------------- | --------- | --------------------------------- |
| Nivel 1: Raiz (Root) | `/` (Raiz del monorepo) | Mapa ontologico global del sistema. Proposito del negocio, gobernanza, convenciones globales, configuracion del orquestador (Nx, Turborepo, Deno), politicas de cache distribuido, comandos de ejecucion transversal y flujo de CI basado en cambios afectados (`nx affected`, scripts raiz). |
| Nivel 2: Aplicaciones | `/apps/*` o `back/`, `front/*` | Manual de ejecucion aislado. Instrucciones estrictamente necesarias para levantar la aplicacion especifica (portal web, servicio API, worker). Omite el contexto global irrelevante para evitar sobrecarga cognitiva. |
| Nivel 3: Paquetes Compartidos | `/packages/*` o `shared/` | Reutilizacion de codigo. Sigue principios de Atomic Design (atomos, moleculas, utilerias). Documenta la API publica exportada, tipos TypeScript, dependencias permitidas y garantia de cero dependencias circulares. |

---

## 4. Desacoplamiento: README vs. Documentacion de Producto

Un antipatrón frecuente es transformar el `README.md` en un manual de usuario integral de miles de lineas.

- **README.md**: Puerta de entrada operativa enfocada en el desarrollador o contribuidor. Su meta es el onboarding rapido, clonado, compilacion, ejecucion de pruebas y entendimiento arquitectonico sintetico.
- **Documentacion de Producto (`/docs/`, SSGs)**: Manuales de usuario finales, tutoriales extensos paso a paso, especificaciones formales de requerimientos (arc42), matrices de casos de uso y politicas legales completas deben residir en `/docs/` o compilarse mediante generadores de sitios estaticos (Docusaurus, MkDocs, Astro, Obsidian Vault). El README debe contener enlaces claros hacia esta documentacion, sin duplicar su contenido.
