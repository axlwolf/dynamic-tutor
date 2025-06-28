module.exports = {
  preset: 'ts-jest/presets/js-with-babel', // Usar el preset para Babel
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest usará babel.config.js para la transpilación
        // y tsconfig.jest.json para el chequeo de tipos (si no se deshabilita)
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
    // Podríamos necesitar transformar algunos módulos de node_modules si son ESM puros
    // Ejemplo: '\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
  },
   // Ejemplo para transformar un módulo específico de node_modules:
  // transformIgnorePatterns: [
  //   '/node_modules/(?!(module-to-transform|another-module)/)',
  // ],
};
