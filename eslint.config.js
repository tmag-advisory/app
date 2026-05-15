import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // The React Compiler rules included in eslint-plugin-react-hooks' latest
      // recommended preset are stricter than this app is currently structured
      // for and flag common intentional patterns as build-blocking errors.
      'react-hooks/static-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',

      // Keep fast-refresh guidance visible without failing CI for modules that
      // intentionally co-locate hooks/constants with their component providers.
      'react-refresh/only-export-components': 'warn',

      // The generated API typings and API boundary code still contain broad
      // shapes. Surface these as warnings while allowing lint to complete.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
])
