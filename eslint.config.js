import vitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import storybook from "eslint-plugin-storybook";
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      //
      'dist',
      'coverage',
      // '.storybook',
      'vitest.shims.d.ts',
      'vitest.workspace.ts',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      // Remove ...tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // other options...
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },


  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      // Add the react-x and react-dom plugins
      'react-x': reactX,
      'react-dom': reactDom,
    },
    rules: {
      // other rules...
      // Enable its recommended typescript rules
      ...reactX.configs['recommended-typescript'].rules,
      ...reactDom.configs.recommended.rules,
      // Put rules you want to override here
      'react-dom/no-dangerously-set-innerhtml': 'warn',
      // Put rules you want to override here
      'react-x/no-class-component': 'warn',
    },
  },
  {
    files: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
      'test/**/*.ts',
      'test/**/*.tsx',
    ],
    plugins: {
      vitest,
    },
    rules: {
      // disable `any` checks in tests
      // '@typescript-eslint/no-unsafe-assignment': 'off',
      ...vitest.configs.recommended.rules,
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },

  /**
   * storybookjs/eslint-plugin-storybook: 🎗Official ESLint plugin for Storybook
   * https://github.com/storybookjs/eslint-plugin-storybook
   */
  storybook.configs["flat/recommended"] /* Storybook's recommended rules */,

  // prettier/eslint-config-prettier: Turns off all rules that are unnecessary or might conflict with Prettier.
  // https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#cli-helper-tool
  //
  // With the new ESLint “flat config” format, you can control what things override what yourself.
  // One way of solving the above conflict is to reorder the config objects so that eslint-config-prettier is last:
  eslintConfigPrettier, // eslint-config-prettier last
);
