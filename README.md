# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Requirements

Vite and its React plugin require Node.js 20.19 or later in the 20.x series,
or Node.js 22.12 or later.

## Styles

`src/main.tsx` loads modern-normalize before `src/index.css`, which imports the
styles in `src/styles/`. The reset adds a few defaults; `global.css` defines the
light-mode colors, spacing, typography, and focus styles; and `layout.css` owns
the single-column page layout. Shared controls and component styles live in
`elements.css`, `header.css`, `footer.css`, and `financial.css`.

Use the semantic color tokens for UI styles, and reserve the status colors for
actual assessments rather than general chart categories. Chart colors currently
remain in their components.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Linting

`npm run lint` uses `.oxlintrc.json` to enable React rules and exclude generated
files in `dist`. See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules)
for the full list of rules and categories.
