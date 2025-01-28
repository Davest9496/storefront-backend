import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  ignores: ['dist/**', 'node_modules/**'],
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parser: tseslint.parser,
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  },
});
