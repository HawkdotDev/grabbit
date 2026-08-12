import type { Linter } from 'eslint'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

const config: Linter.Config[] = [
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  ...(tseslint.configs.recommended as Linter.Config[]),
  eslintPluginReact.configs.flat.recommended as Linter.Config,
  eslintPluginReact.configs.flat['jsx-runtime'] as Linter.Config,
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks as Record<string, unknown>,
      'react-refresh': eslintPluginReactRefresh as Record<string, unknown>
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      'react/prop-types': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    }
  },
  eslintConfigPrettier as Linter.Config,
  {
    rules: {
      'react/prop-types': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    }
  }
]

export default config
