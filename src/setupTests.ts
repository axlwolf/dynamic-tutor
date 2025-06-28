// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mockear import.meta.env para las pruebas de Jest
// Esto permite que código como import.meta.env.VITE_API_KEY funcione en las pruebas
Object.defineProperty(global, 'importMetaEnv', {
  value: {
    VITE_GEMINI_API_KEY: 'test_api_key_from_setup',
    // Agrega otras variables de entorno que necesites mockear aquí
  },
  writable: true, // Necesario si alguna prueba intenta modificarlo (aunque no debería)
});

// Para que `import.meta.env` funcione directamente en los módulos de prueba,
// necesitamos adjuntarlo al objeto `import.meta` si es posible, o mockearlo
// de una manera que ts-jest/babel puedan transformarlo.
// La forma más común es que el código fuente use una función capturable:
// src/config.ts: export const getEnv = () => import.meta.env;
// Y luego mockear esa función.
// Sin embargo, para acceso directo a import.meta.env, el transformador AST
// o configurar tsconfig para ts-jest para permitir `import.meta` y luego
// mockear el objeto `env` en `import.meta` es más directo.

// Dado que estamos usando ts-jest, y `import.meta` es una característica del lenguaje,
// necesitamos asegurarnos que `ts-jest` lo transforma de una manera que podamos mockear `env`.
// El siguiente es un mock más directo para `import.meta` que es compatible con Jest.
// Este mock se aplicará globalmente a todos los archivos de prueba.

jest.mock('vite', () => ({
    ...jest.requireActual('vite'),
    loadEnv: jest.fn().mockReturnValue({ VITE_GEMINI_API_KEY: 'test_api_key_from_vite_mock' })
  }), { virtual: true });

// La forma más simple de mockear `import.meta.env` es redefinir `import.meta`
// Esto es un hack, pero funciona en el entorno de Jest.
// ESTE ES EL MÉTODO QUE VAMOS A USAR:
if (typeof global.import === 'undefined') {
  (global as any).import = {};
}
if (typeof global.import.meta === 'undefined') {
  (global as any).import.meta = {};
}
(global as any).import.meta.env = {
  VITE_GEMINI_API_KEY: 'mocked_gemini_api_key',
  // otras variables VITE_ que uses
};
