import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'babel.config.js', 'jest.config.cjs'] }, // Añadido node_modules y archivos de config
  {
    // Configuración global para todos los archivos JS/TS
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
  // Configuración para archivos TypeScript y TSX
  {
    files: ['src/**/*.{ts,tsx}'], // Aplicar solo a archivos dentro de src
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked, // Usar type-aware linting
      // ...tseslint.configs.stylisticTypeChecked, // Opcional para reglas de estilo basadas en tipos
    ],
    languageOptions: {
      parser: tseslint.parser, // Asegurar que se usa el parser de TS
      parserOptions: {
        ecmaVersion: 'latest', // Usar 'latest' en lugar de un año específico
        sourceType: 'module',
        project: ['./tsconfig.app.json'], // Usar tsconfig.app.json para el código de la app en src/
        tsconfigRootDir: import.meta.dirname, // O __dirname si este archivo fuera CJS
      },
      globals: {
        ...globals.browser,
        ...globals.es2021, // Usar globals más recientes si es necesario
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin, // Asegurar que el plugin TS está referenciado
      'react': eslintPluginReact,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': eslintPluginJsxA11y,
    },
    rules: {
      // Reglas de typescript-eslint (ejemplos, ajustar según necesidad)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Puede ser muy verboso

      // Reglas de React
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReact.configs['jsx-runtime'].rules, // Para el nuevo runtime de JSX
      'react/prop-types': 'off', // No necesario con TypeScript

      // Reglas de React Hooks
      ...reactHooks.configs.recommended.rules,

      // Reglas de React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Reglas de Accesibilidad (jsx-a11y)
      ...eslintPluginJsxA11y.configs.recommended.rules,

      // Otras reglas personalizadas (ejemplos)
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }], // Permitir ciertos console
      'eqeqeq': ['error', 'always'],
    },
    settings: {
      react: {
        version: 'detect', // Detectar automáticamente la versión de React
      },
    },
  }
);
