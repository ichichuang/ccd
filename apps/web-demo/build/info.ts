import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import pc from 'picocolors'
import type { Plugin } from 'vite'
import { brand } from '../src/constants/brand'
import { __APP_INFO__, getPackageSize, pathResolve } from './utils'

type DependencyMap = Record<string, string>

let catalogCache: DependencyMap | undefined

function readDefaultPnpmCatalog(): DependencyMap {
  if (catalogCache) return catalogCache

  const catalog: DependencyMap = {}

  try {
    const workspace = readFileSync(
      join(pathResolve('../../..', import.meta.url), 'pnpm-workspace.yaml'),
      'utf8'
    )
    const lines = workspace.split(/\r?\n/)
    const catalogStartIndex = lines.findIndex(line => line === 'catalog:')

    if (catalogStartIndex === -1) {
      catalogCache = catalog
      return catalog
    }

    for (const line of lines.slice(catalogStartIndex + 1)) {
      if (line.length > 0 && !line.startsWith('  ')) break

      const match = /^ {2}(.+?):\s+(.+)$/.exec(line)
      if (!match) continue

      const name = match[1].replace(/^['"]|['"]$/g, '')
      catalog[name] = match[2].trim()
    }
  } catch {
    catalogCache = catalog
    return catalog
  }

  catalogCache = catalog
  return catalog
}

function resolveDependencySpec(name: string, spec: string | undefined): string | undefined {
  if (!spec) return undefined
  if (spec === 'catalog:') return readDefaultPnpmCatalog()[name] ?? spec
  return spec
}

export function viteBuildInfo(): Plugin {
  let config: { command: string }
  let startTime: number
  let endTime: number
  let outDir: string
  let buildFailed = false

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
      const vueVersion =
        resolveDependencySpec('vue', pkg.dependencies?.vue ?? pkg.devDependencies?.vue) ?? 'Unknown'
      const unocssVersion = resolveDependencySpec(
        'unocss',
        pkg.dependencies?.unocss ?? pkg.devDependencies?.unocss
      )
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
        buildFailed = false
        startTime = Date.now()
      }
    },
    buildEnd(error) {
      if (error) buildFailed = true
    },
    closeBundle() {
      if (config.command === 'build' && !buildFailed) {
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
