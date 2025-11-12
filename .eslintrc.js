module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier', // Должен быть последним, чтобы перезаписать конфликтующие правила
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['node'],
  settings: {
    node: {
      version: '>=14.0.0',
    },
  },
  rules: {
    // Общие правила
    'no-console': 'off', // Разрешаем console.log для Node.js
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',

    // Правила для Node.js
    'node/no-unpublished-require': 'off', // Отключаем для dev зависимостей
    'node/no-missing-require': 'error',
    'node/no-extraneous-require': 'error',
    'node/no-process-exit': 'off', // Разрешаем process.exit для критических ошибок
    'node/no-unsupported-features/es-syntax': ['error', { version: '>=14.0.0' }],

    // Стиль кода
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-throw-literal': 'error',
  },
  overrides: [
    {
      files: ['*.test.js', '*.spec.js'],
      env: {
        jest: true,
      },
    },
  ],
};
