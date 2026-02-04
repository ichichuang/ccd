import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import fs from 'node:fs'
import path from 'node:path'
import tseslint from 'typescript-eslint'
import vueEslintParser from 'vue-eslint-parser'

// 1. 自动导入生成的 ESLint 配置
// ----------------------------------------------------------------------
const autoImportEslintConfigPath = path.resolve(process.cwd(), '.eslintrc-auto-import.json')
let autoImportGlobals: Record<string, 'readonly' | 'writable' | 'off'> = {}

try {
  if (fs.existsSync(autoImportEslintConfigPath)) {
    const raw = fs.readFileSync(autoImportEslintConfigPath, 'utf-8')
    const parsed = JSON.parse(raw)
    autoImportGlobals = parsed.globals || {}
  }
} catch (_error) {
  console.warn('⚠️ 读取 .eslintrc-auto-import.json 失败，自动导入规则可能失效')
}

// 2. 配置主体
// ----------------------------------------------------------------------
export default tseslint.config(
  // 全局忽略
  {
    name: 'app/global-ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'public/**', '*.d.ts'],
  },
  {
    // ... 其他配置
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/*.min.js',
      '**/public',
      'docs/**',
      // [NEW] 忽略自动生成的类型定义文件
      'src/types/components.d.ts',
      'src/types/auto-imports.d.ts',
      'src/components.d.ts', // 视具体生成位置而定，看你的配置是生成在 src 下还是 src/types 下
      'src/auto-imports.d.ts',
    ],
  },

  // 扩展推荐配置
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // 3. 全局基础设置 (移除 projectService，回归纯粹的语法解析)
  // ----------------------------------------------------------------------
  {
    name: 'app/globals-setup',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...autoImportGlobals,
      },
    },
  },

  // 4. 【新增】仅对 TS/TSX 文件启用类型感知 Linting
  // ----------------------------------------------------------------------
  // 我们把 projectService 限制在纯 TS 文件中，避免它干扰 Vue 的解析
  {
    name: 'app/type-aware-linting',
    files: ['**/*.{ts,mts,cts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 5. Node 环境专用配置
  // ----------------------------------------------------------------------
  {
    name: 'app/node-scripts',
    files: ['build/**', '*.config.ts', '*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // 6. Vue 特殊解析配置 (关闭类型感知，确保 TSX 正常解析)
  // ----------------------------------------------------------------------
  {
    name: 'app/vue-parser-setup',
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueEslintParser as any,
      parserOptions: {
        // 使用对象映射，明确 TSX 处理方式
        parser: {
          ts: tseslint.parser,
          tsx: tseslint.parser,
          js: 'espree',
          jsx: 'espree',
        },
        // ✅ 必须开启 JSX 支持
        ecmaFeatures: {
          jsx: true,
        },
        // 基础配置
        sourceType: 'module',
        ecmaVersion: 'latest',
        // ❌ 移除 tsconfigRootDir 和 extraFileExtensions
        // 让 Vue 解析完全脱离 tsconfig，避免 projectService 误判
      },
    },
    rules: {
      'vue/script-setup-uses-vars': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // 7. TSX 专项配置 (补充支持)
  // ----------------------------------------------------------------------
  {
    name: 'app/tsx-support',
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // 8. 自定义业务规则
  // ----------------------------------------------------------------------
  // 8.1 针对 TS/TSX 的规则 (开启严格检查)
  {
    name: 'app/ts-custom-rules',
    files: ['**/*.{ts,mts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off', // 允许 @ts-ignore 等，解决 components.d.ts 的报错

      // ✅ 核心修改：全面忽略所有以 _ 开头的未使用变量、参数和错误捕获
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // 8.2 针对 Vue 的规则
  {
    name: 'app/vue-custom-rules',
    files: ['**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
      'vue/script-setup-uses-vars': 'error',

      // ✅ 核心修改：放宽组件命名限制
      // 理由：设计系统和自动生成组件中，index.vue 或单词组件名很常见
      'vue/multi-word-component-names': 'off',
    },
  },

  // 9. 【新增】TS 命名规范 (仅针对 TS 文件，排除 Vue)
  // ----------------------------------------------------------------------
  // 必须把需要类型信息的规则限制在 TS 文件中，否则 Vue 解析器会报错
  {
    name: 'app/ts-naming-rules',
    files: ['**/*.{ts,mts,cts,tsx}'], // 👈 注意：这里不包含 .vue
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          filter: { regex: '^(__.*__|VITE_.*)', match: false },
        },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'method', format: ['camelCase'] },
        {
          selector: 'property',
          format: ['camelCase', 'snake_case', 'PascalCase'],
          leadingUnderscore: 'allow',
          filter: {
            regex:
              '^(@|vue/|/.*|no-|prefer-|eqeqeq|curly|VITE_|__.*__|drop_|AtRule|content-type|access-control-allow-origin|access-control-allow-methods|access-control-allow-headers|Content-Type|Access-Control-Allow-Origin|Access-Control-Allow-Methods|Access-Control-Allow-Headers|^[0-9]+$|^[a-z-]+$|^-[a-z-]+$|CustomScrollbar|zh-CN|en-US|zh-TW)',
            match: false,
          },
        },
      ],
    },
  },
  {
    name: 'app/declaration-files',
    files: ['**/*.d.ts'],
    rules: {
      // 声明文件中的定义通常不直接在当前文件引用，关闭此检查
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // 10. Prettier 兼容 (最后加载)
  eslintConfigPrettier
)
