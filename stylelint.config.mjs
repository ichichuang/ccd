/**
 * Stylelint 配置
 * 标准 SCSS 规则 + Prettier 兼容
 * 覆盖 src 下的 css/scss/vue 样式
 */
import postcssHtml from 'postcss-html'

export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/target/**',
    '**/*.min.css',
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: postcssHtml,
    },
  ],
  rules: {
    // Vue SFC 的 :deep() 为合法选择器
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['deep', 'global', 'slotted'] },
    ],
    // 放宽 class 命名：支持 BEM (block__element--modifier)、animate.css 等
    'selector-class-pattern': null,
    // 放宽 keyframe 命名：允许 camelCase（如 nprogressPulse）
    'keyframes-name-pattern': null,
    // 允许空 style 块（Vue 中常见占位）
    'no-empty-source': null,
  },
}
