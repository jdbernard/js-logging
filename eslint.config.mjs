import importPlugin from 'eslint-plugin-import'
import tsParser from '@typescript-eslint/parser'
import eslintJs from '@eslint/js'
import eslintTs from 'typescript-eslint'

const tsFiles = ['src/**/*.ts']

const customTypescriptConfig = {
  files: tsFiles,
  plugins: {
    import: importPlugin,
    'import/parsers': tsParser,
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', { avoidEscape: true }],
  },
}

const recommendedTypeScriptConfigs = [
  ...eslintTs.configs.recommended.map((config) => ({
    ...config,
    files: tsFiles,
  })),
  ...eslintTs.configs.stylistic.map((config) => ({
    ...config,
    files: tsFiles,
  })),
]

export default [
  {
    ignores: [
      'docs/*',
      'build/*',
      'lib/*',
      'dist/*',
    ],
  }, // global ignores
  eslintJs.configs.recommended,
  ...recommendedTypeScriptConfigs,
  customTypescriptConfig,
]
