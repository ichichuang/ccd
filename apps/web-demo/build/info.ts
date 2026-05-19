import pc from 'picocolors'
import type { Plugin } from 'vite'
import { brand } from '../src/constants/brand'
import { __APP_INFO__, getPackageSize } from './utils'

export function viteBuildInfo(): Plugin {
  let config: { command: string }
  let startTime: number
  let endTime: number
  let outDir: string

  return {
    name: 'vite:buildInfo',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      outDir = resolvedConfig.build?.outDir ?? 'dist'
    },
    buildStart() {
      const pkg = __APP_INFO__.pkg as Record<string, unknown> & {
        name?: string
        version?: string
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }
      const vueVersion = pkg.dependencies?.vue ?? pkg.devDependencies?.vue ?? 'Unknown'
      const unocssVersion = pkg.dependencies?.unocss ?? pkg.devDependencies?.unocss
      const unocssLine = unocssVersion ? `🎨 UnoCSS: ${unocssVersion}\n` : ''

      console.log(
        pc.bold(
          pc.green(`🎉 欢迎使用 ${brand.name}
📦 版本: ${pkg.version}
⚡ 基于 Vue ${vueVersion} + Vite 构建
🛠️ UI 架构: PrimeVue + UnoCSS
${unocssLine}🕒 构建时间: ${__APP_INFO__.lastBuildTime}
`)
        )
      )

      if (config.command === 'build') {
        startTime = Date.now()
      }
    },
    closeBundle() {
      if (config.command === 'build') {
        endTime = Date.now()
        getPackageSize({
          folder: outDir,
          callback: (size: string) => {
            const duration = ((endTime - startTime) / 1000).toFixed(2)
            console.log(
              pc.bold(pc.magenta('🎉 构建完成！\n')) +
                pc.bold(
                  pc.cyan(`📦 打包大小: ${pc.green(size)}
⏰ 构建耗时: ${pc.green(duration + 's')}
📁 输出目录: ${outDir}
`)
                )
            )
          },
        })
      }
    },
  }
}
