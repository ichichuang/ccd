/**
 * 国际化选项工具函数
 * 用于在组件中获取带国际化标签的选项
 */

/**
 * 获取国际化的尺寸选项
 */
export const useI18nSizeOptions = () => {
  const { $t } = useLocale()

  return computed(() => [
    { label: $t('common.systemOptions.size.compact'), value: 'compact' },
    { label: $t('common.systemOptions.size.comfortable'), value: 'comfortable' },
    { label: $t('common.systemOptions.size.loose'), value: 'loose' },
  ])
}

/**
 * 获取国际化的间距选项
 */
export const useI18nPaddingOptions = () => {
  const { $t } = useLocale()

  return computed(() => [
    { label: $t('common.systemOptions.padding.sm'), key: 'sm', value: 8 },
    { label: $t('common.systemOptions.padding.md'), key: 'md', value: 12 },
    { label: $t('common.systemOptions.padding.lg'), key: 'lg', value: 16 },
  ])
}

/**
 * 获取国际化的圆角选项
 */
export const useI18nRoundedOptions = () => {
  const { $t } = useLocale()

  return computed(() => [
    { label: $t('common.systemOptions.rounded.sharp'), key: 'sharp', value: 0 },
    { label: $t('common.systemOptions.rounded.smooth'), key: 'smooth', value: 6 },
    { label: $t('common.systemOptions.rounded.round'), key: 'round', value: 12 },
    { label: $t('common.systemOptions.rounded.soft'), key: 'soft', value: 24 },
  ])
}

/**
 * 获取国际化的字体大小选项
 */
export const useI18nFontSizeOptions = () => {
  const { $t } = useLocale()

  return computed(() => [
    { label: $t('common.systemOptions.fontSize.xs'), key: 'xs', value: 14 },
    { label: $t('common.systemOptions.fontSize.sm'), key: 'sm', value: 14 },
    { label: $t('common.systemOptions.fontSize.md'), key: 'md', value: 15 },
    { label: $t('common.systemOptions.fontSize.lg'), key: 'lg', value: 16 },
    { label: $t('common.systemOptions.fontSize.xl'), key: 'xl', value: 18 },
    { label: $t('common.systemOptions.fontSize.xls'), key: 'xls', value: 20 },
    { label: $t('common.systemOptions.fontSize.xxl'), key: 'xxl', value: 22 },
    { label: $t('common.systemOptions.fontSize.xxxl'), key: 'xxxl', value: 24 },
  ])
}

/**
 * 获取国际化的主题模式选项
 */
export const useI18nModeOptions = () => {
  const { $t } = useLocale()

  return computed(() => [
    { label: $t('common.systemOptions.themeMode.light'), value: 'light' },
    { label: $t('common.systemOptions.themeMode.dark'), value: 'dark' },
    { label: $t('common.systemOptions.themeMode.auto'), value: 'auto' },
  ])
}
