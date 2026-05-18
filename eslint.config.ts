import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import fs from 'node:fs'
import path from 'node:path'
import tseslint from 'typescript-eslint'
import vueEslintParser from 'vue-eslint-parser'
// @ts-ignore local runtime ESLint rule module does not publish TS declarations
import localArchitectureRules from './scripts/eslint-rules/no-hardcoded-colors.mjs'

// Auto-Import Shield: 禁止手动导入 Vue 组合式 API（允许 import type）
const VUE_AUTO_IMPORT_FORBIDDEN_VALUE_IMPORTS = [
  // Reactivity
  'ref',
  'shallowRef',
  'triggerRef',
  'customRef',
  'computed',
  'reactive',
  'shallowReactive',
  'readonly',
  'shallowReadonly',
  'markRaw',
  'toRaw',
  'toRef',
  'toRefs',
  'unref',
  'isRef',
  'isReactive',
  'isReadonly',
  'isProxy',
  // Watch
  'watch',
  'watchEffect',
  'watchPostEffect',
  'watchSyncEffect',
  // Lifecycle
  'onBeforeMount',
  'onMounted',
  'onBeforeUpdate',
  'onUpdated',
  'onBeforeUnmount',
  'onUnmounted',
  'onActivated',
  'onDeactivated',
  'onErrorCaptured',
  'onRenderTracked',
  'onRenderTriggered',
  'onServerPrefetch',
  // Scope / scheduling
  'nextTick',
  'effectScope',
  'getCurrentScope',
  'onScopeDispose',
  // DI
  'provide',
  'inject',
  // Component instance utils (常见误手导入)
  'getCurrentInstance',
  'useAttrs',
  'useSlots',
] as const

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
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'public/**', 'legacy/**', '*.d.ts'],
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
        allowDefaultProject: true,
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
  // [待评估] body/formatter 返回模板字符串反模式：no-restricted-syntax 可检测
  // `return \`<tag>${x}</tag>\`` 等写法，但需评估误报率（如合法模板字符串、纯文本返回）。
  // 暂不启用，由 .ai/rules/core 与 .ai/rules/components 的 TSX 约束统一覆盖。
  //
  // 8.1 针对 TS/TSX 的规则 (开启严格检查)
  {
    name: 'app/auto-import-shield',
    files: ['**/*.{ts,mts,cts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue',
              importNames: [...VUE_AUTO_IMPORT_FORBIDDEN_VALUE_IMPORTS],
              message:
                'Auto-Import Shield: Vue 组合式 API 由 unplugin-auto-import 全局提供，请删除该手动导入（类型请使用 import type）。',
              // ✅ 关键：允许 `import type { Ref } from 'vue'`
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/auto-import-shield-js',
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue',
              importNames: [...VUE_AUTO_IMPORT_FORBIDDEN_VALUE_IMPORTS],
              message:
                'Auto-Import Shield: Vue 组合式 API 由 unplugin-auto-import 全局提供，请删除该手动导入。',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/monorepo-boundaries',
    files: ['apps/**/*.{ts,tsx,vue,js,jsx,mjs}', 'packages/**/*.{ts,tsx,vue,js,jsx,mjs}'],
    plugins: {
      boundaries,
    },
    settings: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'boundaries/elements': [
        { type: 'core', pattern: 'packages/core/src/**' },
        { type: 'web-demo', pattern: 'apps/web-demo/src/**' },
        { type: 'desktop-adapters', pattern: 'apps/desktop/src/adapters/**' },
        { type: 'desktop', pattern: 'apps/desktop/src/**' },
      ],
    },
    rules: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: { type: 'core' },
              disallow: { to: { type: ['web-demo', 'desktop', 'desktop-adapters'] } },
            },
            {
              from: { type: 'web-demo' },
              disallow: { to: { type: ['desktop', 'desktop-adapters'] } },
            },
            { from: { type: 'desktop' }, disallow: { to: { type: 'web-demo' } } },
            { from: { type: 'desktop-adapters' }, disallow: { to: { type: 'web-demo' } } },
          ],
        },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@ccd/web-demo',
              message: 'Cross-app package imports are forbidden.',
            },
            {
              name: '@ccd/desktop',
              message: 'Cross-app package imports are forbidden.',
            },
          ],
          patterns: [
            {
              group: ['@ccd/core/*', '**/packages/core/src/**', '**/apps/**'],
              message: 'Use the @ccd/core public export entry only; deep imports are forbidden.',
            },
            {
              group: ['../apps/**', '../../apps/**', '../../../apps/**'],
              message: 'Cross-app imports are forbidden.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/core-runtime-isolation',
    files: ['packages/core/**/*.{ts,tsx,js,jsx,mjs}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'fs', message: 'Core must not import Node runtime APIs.' },
            { name: 'path', message: 'Core must not import Node runtime APIs.' },
            { name: 'process', message: 'Core must not import Node runtime APIs.' },
            { name: '@tauri-apps/api', message: 'Core must not import Tauri runtime APIs.' },
          ],
          patterns: [
            {
              group: ['node:*', '@tauri-apps/*', '../apps/**', '../../apps/**', '../../../apps/**'],
              message: 'Core must stay framework and runtime agnostic.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'process',
        'localStorage',
        'sessionStorage',
        'navigator',
        'fetch',
        'XMLHttpRequest',
        'console',
        'crypto',
        'setTimeout',
        'setInterval',
      ],
    },
  },
  {
    name: 'app/desktop-tauri-adapter-boundary',
    files: ['apps/desktop/src/**/*.{ts,tsx,vue,js,jsx,mjs}'],
    ignores: ['apps/desktop/src/adapters/**/*.{ts,tsx,vue,js,jsx,mjs}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@tauri-apps/*'],
              message: 'Tauri APIs must be encapsulated by apps/desktop/src/adapters.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="invoke"]',
          message: 'invoke() calls must stay inside apps/desktop/src/adapters.',
        },
      ],
    },
  },
  {
    name: 'app/ts-custom-rules',
    files: ['**/*.{ts,mts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'off', // 允许 @ts-ignore 等，解决 components.d.ts 的报错

      // ✅ 核心修改：全面忽略所有以 _ 开头的未使用变量、参数和错误捕获
      '@typescript-eslint/no-unused-vars': [
        'error',
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
  {
    name: 'app/design-token-color-guard',
    files: ['src/**/*.{vue,ts,tsx,js,jsx}'],
    plugins: {
      'app-architecture': localArchitectureRules,
    },
    rules: {
      'app-architecture/no-hardcoded-colors': 'error',
    },
  },

  // 8.2 针对 Vue 的规则
  {
    name: 'app/vue-custom-rules',
    files: ['**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-undef': 'off',
      'vue/script-setup-uses-vars': 'error',

      // ✅ 核心修改：放宽组件命名限制
      // 理由：设计系统和自动生成组件中，index.vue 或单词组件名很常见
      'vue/multi-word-component-names': 'off',
    },
  },

  // 8.3 基础设施边界：全局 no-explicit-any 为 error；目标白名单仅保留 typeCasters / adapters / http，其余边界待迁移为 unknown 后移除
  {
    name: 'app/no-explicit-any-infra-overrides',
    files: [
      'src/utils/typeCasters.ts',
      'src/adapters/**/*.{ts,tsx}',
      'src/utils/http/**/*.{ts,tsx}',
      // 以下为临时保留，待迁移为 unknown 后从白名单移除
      'src/hooks/modules/useChartTheme/**/*.{ts,tsx}',
      'build/**/*.ts',
      '**/*.config.ts',
      '**/*.d.ts',
      'src/hooks/modules/useLocale.ts',
      'src/components/CScrollbar/**/*.ts',
      'src/constants/**/*.ts',
      'src/views/**/useChartOptions.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
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
              '^(@|vue/|app-architecture/|/.*|no-|prefer-|eqeqeq|curly|VITE_|__.*__|drop_|AtRule|content-type|access-control-allow-origin|access-control-allow-methods|access-control-allow-headers|Content-Type|Access-Control-Allow-Origin|Access-Control-Allow-Methods|Access-Control-Allow-Headers|^[0-9]+$|^[a-z-]+$|^-[a-z-]+$|CustomScrollbar|zh-CN|en-US|zh-TW)',
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

  // 10. Prettier 兼容 (基础配置)
  eslintConfigPrettier,

  // 11. Vue 模板格式规则（覆盖部分被 Prettier 关闭的 Vue 规则）
  {
    name: 'app/vue-formatting-rules',
    files: ['**/*.vue'],
    rules: {
      // 单行元素内容必须换行（改为 warn，避免阻塞 Prettier 格式化）
      'vue/singleline-html-element-content-newline': [
        'warn',
        {
          ignoreWhenNoAttributes: true,
          ignoreWhenEmpty: true,
          ignores: [
            'pre',
            'textarea',
            'code',
            'td',
            'th',
            'span', // 内联文本标签，允许单行
            'p', // 段落标签，内容通常较短时允许单行
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6', // 标题标签，短标题允许单行
            'div', // 容器标签，简单内容允许单行
            'label', // 表单标签，短文本允许单行
            'button', // 按钮标签，短文本允许单行
          ],
        },
      ],
      // 多行元素内容前后必须换行（改为 warn，避免阻塞 Prettier 格式化）
      'vue/multiline-html-element-content-newline': [
        'warn',
        {
          ignoreWhenEmpty: true,
          ignores: [
            'pre',
            'textarea',
            'code',
            'td',
            'th',
            'span', // 内联文本标签，允许单行
            'p', // 段落标签，内容通常较短时允许单行
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6', // 标题标签，短标题允许单行
            'div', // 容器标签，简单内容允许单行
            'label', // 表单标签，短文本允许单行
            'button', // 按钮标签，短文本允许单行
          ],
        },
      ],
      // 核心修改：完全交由 Prettier 处理，关闭此规则避免与 htmlWhitespaceSensitivity: "css" 发生冲突
      'vue/html-closing-bracket-newline': 'off',
    },
  }
)
