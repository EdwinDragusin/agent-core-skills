# Configuracion de Infraestructura JSDoc y ESLint

## Instalacion y Script NPM/Deno

```bash
# Nunca instalar globalmente; garantiza entorno deterministico en CI.
npm install --save-dev jsdoc
```

En `package.json`:

```json
{
  "scripts": {
    "docs": "jsdoc -c jsdoc.json",
    "docs:md": "jsdoc2md --files src/**/*.js > docs/API.md"
  }
}
```

## Archivo de Configuracion `jsdoc.json`

```json
{
  "source": {
    "include": ["src"],
    "exclude": ["node_modules", "dist"],
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "(^|\\/|\\\\)_"
  },
  "opts": {
    "destination": "./docs/api",
    "recurse": true,
    "template": "node_modules/clean-jsdoc-theme",
    "tutorials": "./docs/tutoriales"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "useLongnameInNav": true,
    "theme_opts": {
      "title": "API Sistema de Examenes de Ingreso — Gobierno de Hidalgo",
      "search": true,
      "darkMode": true
    }
  }
}
```

## Verificacion Estatica con ESLint Flat Config (v9+)

### Configuracion Base (`eslint.config.js`)

```javascript
import jsdocPlugin from "eslint-plugin-jsdoc";

export default [
  // TypeScript puro: "flat/recommended-typescript-error"
  // JavaScript puro: "flat/recommended-error"
  jsdocPlugin.configs["flat/recommended-typescript-error"],
  {
    plugins: { jsdoc: jsdocPlugin },
    rules: {
      // Cobertura obligatoria solo en elementos exportados
      "jsdoc/require-jsdoc": ["error", {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true,
        },
        contexts: [
          "TSInterfaceDeclaration",
          "TSTypeAliasDeclaration",
          "TSEnumDeclaration",
        ],
      }],

      // Paridad transaccional de parametros
      "jsdoc/require-param": ["error", { checkDestructuredRoots: false }],
      "jsdoc/check-param-names": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-type": "error",

      // Valores de retorno
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-returns-type": "error",

      // Metadatos y tipos
      "jsdoc/check-values": "error",
      "jsdoc/check-types": "error",
      "jsdoc/check-tag-names": ["error", {
        definedTags: ["ui5-experimental-since", "internal"],
      }],

      // Calidad narrativa: prohibir docs que solo repiten el nombre
      "jsdoc/informative-docs": "error",

      // Ciclo de vida
      "jsdoc/check-syntax": "error",
    },
  },
];
```

### En proyectos TypeScript puro (TSDoc)

Desactivar etiquetas de tipo redundantes cuando TypeScript las infiere:

```javascript
"jsdoc/require-param-type": "off",
"jsdoc/require-returns-type": "off",
```
