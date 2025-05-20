module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    'prettier',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  plugins: ['@tanstack/query'],
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/'],
    },
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/no-rest-destructuring': 'warn',
    '@tanstack/query/stable-query-client': 'error',

    'no-extra-boolean-cast': 'off',
    'no-unused-vars': 'off',
    'prefer-const': 'error',
    'no-floating-promises': 'off',
    'no-unsafe-argument': 'off',
    'no-irregular-whitespace': 'error',
    'no-trailing-spaces': 'error',
    'no-empty-function': 'error',
    'no-duplicate-imports': 'error',
    camelcase: 'off',
  },
}
