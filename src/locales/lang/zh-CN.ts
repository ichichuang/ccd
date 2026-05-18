/**
 * 中文语言包 (zh-CN)
 *
 * 结构说明：
 * - core: 业务核心文案（桌面端/主分支共用）
 * - example: 示例文案（桌面端同步时可安全剥离）
 */
import zhCNCore from '@/locales/lang/core/zh-CN'
import zhCNExample from '@/locales/lang/example/zh-CN'
import { mergeLocale } from '@/locales/lang/utils/mergeLocale'

const zhCN = mergeLocale(zhCNCore, zhCNExample)

export { zhCN }
export default zhCN
