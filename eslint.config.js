import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**'] },
  // The build scripts run under Node rather than in a browser.
  {
    files: ['scripts/**/*.mjs', '*.config.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
];
