#!/usr/bin/env node
/**
 * Drift Checker — 漂移检测器 (v0.5.1)
 * 1. 扫描 apps/web-demo/src/views 下所有含 data-archetype 的 .vue，若同目录有 page.state.ts 则比对
 * 2. Style Guard：扫描 src 下所有 .vue 的 <style> 块，禁止 hex/rgb/rgba/hsl/hsla（排除注释）
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'apps', 'web-demo', 'src')
const VIEWS_DIR = join(ROOT, 'apps', 'web-demo', 'src', 'views')
const BUILD_SYSTEM_MD = join(ROOT, 'docs', 'ai-specs', 'BUILD_SYSTEM.md')
const VITE_CONFIG = join(ROOT, 'apps', 'web-demo', 'vite.config.ts')
const BUILD_PLUGINS = join(ROOT, 'apps', 'web-demo', 'build', 'plugins.ts')
const PRIMEVUE_RESOLVER_BOUNDARY = join(
  ROOT,
  'apps',
  'web-demo',
  'build',
  'resolvers',
  'primevue.ts'
)

/** 禁止：十六进制颜色 #fff, #ff0000, #ff0000ff */
const HEX_REGEX = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
/** 禁止：raw rgb/rgba/hsl/hsla(数字...) — 允许 rgb(var( 等 */
const RAW_RGB_REGEX = /rgb\(\s*\d+/g
const RAW_RGBA_REGEX = /rgba\(\s*\d+/g
const RAW_HSL_REGEX = /hsl\(\s*\d+/g
const RAW_HSLA_REGEX = /hsla\(\s*\d+/g
const RAW_PALETTE_CLASS_REGEX =
  /(?:^|\s)(?:[\w!:-]+:)*(?:text|bg|border|ring|from|via|to|decoration|accent|outline|divide|placeholder|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-|\/|!|\s|$)/
const UNO_ARBITRARY_COLOR_REGEX =
  /(?:text|bg|border|ring|from|via|to|decoration|accent|outline|divide|placeholder|caret)-\[#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/

const STATE_FILE = 'page.state.ts'

const ARCHETYPE_REGEX = /archetype:\s*['"`]([^'"`]+)['"`]/
const DATA_ARCHETYPE_REGEX = /data-archetype\s*=\s*["']([^"']+)["']/

function walkVueFiles(dir, base = '') {
  const files = []
  try {
    const names = readdirSync(dir, { withFileTypes: true })
    for (const e of names) {
      const rel = base ? `${base}/${e.name}` : e.name
      if (e.isDirectory()) {
        files.push(...walkVueFiles(join(dir, e.name), rel))
      } else if (e.name.endsWith('.vue')) {
        files.push(rel)
      }
    }
  } catch {
    // ignore
  }
  return files
}

function walkFilesByExtension(dir, extensions, base = '') {
  const files = []
  try {
    const names = readdirSync(dir, { withFileTypes: true })
    for (const e of names) {
      const rel = base ? `${base}/${e.name}` : e.name
      if (e.isDirectory()) {
        files.push(...walkFilesByExtension(join(dir, e.name), extensions, rel))
      } else if (extensions.some(ext => e.name.endsWith(ext))) {
        files.push(rel)
      }
    }
  } catch {
    // ignore
  }
  return files
}

function extractStyleBlocks(content) {
  const blocks = []
  const styleRegex = /<style[\s\S]*?>([\s\S]*?)<\/style>/gi
  let m
  while ((m = styleRegex.exec(content)) !== null) {
    const startLine = 1 + (content.slice(0, m.index).match(/\n/g) || []).length
    blocks.push({ content: m[1], startLine })
  }
  return blocks
}

/** 移除 CSS 注释，避免误报（保留换行以维持行号） */
function stripCssComments(block) {
  return block.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
}

function checkStyleDrift(filePath, content) {
  const errors = []
  const blocks = extractStyleBlocks(content)
  for (const { content: block, startLine } of blocks) {
    const blockNoComments = stripCssComments(block)
    const lines = blockNoComments.split('\n')
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]
      const lineNum = startLine + j
      const hexMatches = line.match(HEX_REGEX)
      if (hexMatches?.length) {
        errors.push(`${filePath}:${lineNum} - Style Drift: hex color "${hexMatches[0]}" detected. Use Design Tokens or UnoCSS classes instead of hardcoded colors.`)
      }
      if (line.match(RAW_RGB_REGEX) && !line.includes('rgb(var(')) {
        errors.push(`${filePath}:${lineNum} - Style Drift: raw rgb() detected. Use rgb(var(--token)) or Design Tokens instead.`)
      }
      if (line.match(RAW_RGBA_REGEX) && !line.includes('rgba(var(')) {
        errors.push(`${filePath}:${lineNum} - Style Drift: raw rgba() detected. Use rgb(var(--token) / 0.5) or Design Tokens instead.`)
      }
      if (line.match(RAW_HSL_REGEX) && !line.includes('hsl(var(')) {
        errors.push(`${filePath}:${lineNum} - Style Drift: raw hsl() detected. Use Design Tokens instead.`)
      }
      if (line.match(RAW_HSLA_REGEX) && !line.includes('hsla(var(')) {
        errors.push(`${filePath}:${lineNum} - Style Drift: raw hsla() detected. Use Design Tokens instead.`)
      }
    }
  }
  return errors
}

function checkClassColorDrift(filePath, content) {
  const errors = []
  const classAttrRegex = /\b(?:class|className)\s*=\s*(["'`])([\s\S]*?)\1/g
  let match
  while ((match = classAttrRegex.exec(content)) !== null) {
    const value = match[2]
    const lineNum = 1 + (content.slice(0, match.index).match(/\n/g) || []).length
    if (RAW_PALETTE_CLASS_REGEX.test(value)) {
      errors.push(`${filePath}:${lineNum} - Class Color Drift: raw palette color class detected. Use semantic color tokens.`)
    }
    if (UNO_ARBITRARY_COLOR_REGEX.test(value)) {
      errors.push(`${filePath}:${lineNum} - Class Color Drift: arbitrary hex color class detected. Use semantic color tokens.`)
    }
  }
  return errors
}

function extractArchetypeFromState(content) {
  const m = content.match(ARCHETYPE_REGEX)
  return m ? m[1].trim() : null
}

function extractDataArchetypeFromVue(content) {
  const m = content.match(DATA_ARCHETYPE_REGEX)
  return m ? m[1].trim() : null
}

function checkChunkGroupsDrift() {
  const errors = []
  if (!existsSync(BUILD_SYSTEM_MD) || !existsSync(VITE_CONFIG)) {
    return errors
  }

  const doc = readFileSync(BUILD_SYSTEM_MD, 'utf-8')
  const config = readFileSync(VITE_CONFIG, 'utf-8')

  const docMatches = Array.from(doc.matchAll(/-\s+\*\*(vendor-[^*]+)\*\*/g))
  const docChunks = new Set(
    docMatches
      .map((m) => m[1].trim())
      .map((name) => name.replace(/:$/, ''))
  )

  const configMatches = Array.from(config.matchAll(/['"](vendor-[^'"]+)['"]/g))
  const configChunks = new Set(configMatches.map((m) => m[1].trim()))

  if (!docChunks.size && !configChunks.size) {
    return errors
  }

  for (const name of configChunks) {
    if (!docChunks.has(name)) {
      errors.push(
        `BUILD_SYSTEM.md vs vite.config.ts 漂移: codeSplitting chunk group 中存在 "${name}"，但文档 §5.1 未记录，请同步更新文档或配置。`
      )
    }
  }

  for (const name of docChunks) {
    if (!configChunks.has(name)) {
      errors.push(
        `BUILD_SYSTEM.md vs vite.config.ts 漂移: 文档 §5.1 中存在 "${name}"，但 vite.config.ts codeSplitting chunk group 未使用，请同步更新文档或配置。`
      )
    }
  }

  return errors
}

function checkBuildPluginsDrift() {
  const errors = []
  if (!existsSync(BUILD_PLUGINS)) {
    return errors
  }

  const content = readFileSync(BUILD_PLUGINS, 'utf-8')

  if (content.includes('AutoImport({')) {
    const hasStoreGroups =
      content.includes("'src/stores/modules/system'") &&
      content.includes("'src/stores/modules/session'") &&
      content.includes("'src/stores/modules/ui'") &&
      content.includes("'src/hooks/**/*'")

    if (!hasStoreGroups) {
      errors.push(
        'apps/web-demo/build/plugins.ts: AutoImport.dirs 需显式包含 "src/stores/modules/system"、"src/stores/modules/session"、"src/stores/modules/ui" 与 "src/hooks/**/*"。'
      )
    }
  }

  if (content.includes('Components({')) {
    if (!content.includes("dirs: ['src/components']")) {
      errors.push('apps/web-demo/build/plugins.ts: Components.dirs 应为 ["src/components"]。')
    }
    if (
      !content.includes(
        'exclude: [/[\\\\/]node_modules[\\\\/]/, /[\\\\/]\\.git[\\\\/]/, /[\\\\/]src[\\\\/]layouts[\\\\/]/]'
      )
    ) {
      errors.push(
        'apps/web-demo/build/plugins.ts: Components.exclude 需包含 src/layouts 目录，防止布局组件被自动导入。'
      )
    }
    if (!content.includes('createPrimeVueComponentResolver()')) {
      errors.push(
        'apps/web-demo/build/plugins.ts: Components.resolvers 需包含 createPrimeVueComponentResolver() 以保持 PrimeVue 组件按需引入。'
      )
    }
    if (!existsSync(PRIMEVUE_RESOLVER_BOUNDARY)) {
      errors.push('apps/web-demo/build/resolvers/primevue.ts: PrimeVue resolver boundary 缺失。')
    } else {
      const resolverBoundaryContent = readFileSync(PRIMEVUE_RESOLVER_BOUNDARY, 'utf-8')
      if (
        !resolverBoundaryContent.includes("from '@primevue/auto-import-resolver'") ||
        !resolverBoundaryContent.includes('PrimeVueResolver()')
      ) {
        errors.push(
          'apps/web-demo/build/resolvers/primevue.ts: PrimeVue resolver boundary 必须集中调用 PrimeVueResolver()。'
        )
      }
    }
  }

  return errors
}

function main() {
  const errors = []

  // ---------- 1. Archetype drift (all .vue with data-archetype) ----------
  const vueFiles = walkVueFiles(VIEWS_DIR)
  for (const rel of vueFiles) {
    const absPath = join(VIEWS_DIR, rel)
    const dir = join(VIEWS_DIR, dirname(rel))
    const statePath = join(dir, STATE_FILE)
    if (!existsSync(statePath)) continue

    const vueContent = readFileSync(absPath, 'utf-8')
    const uiArchetype = extractDataArchetypeFromVue(vueContent)
    if (!uiArchetype) continue

    const stateContent = readFileSync(statePath, 'utf-8')
    const stateArchetype = extractArchetypeFromState(stateContent)
    if (!stateArchetype) {
      errors.push(`[apps/web-demo/src/views/${rel}]: 同目录 page.state.ts 中未找到 archetype`)
      continue
    }
    if (stateArchetype !== uiArchetype) {
      errors.push(
        `[apps/web-demo/src/views/${rel}]: 结构漂移 — page.state.ts archetype="${stateArchetype}" vs data-archetype="${uiArchetype}"`
      )
    }
  }

  // ---------- 2. Style Guard (hardcoded colors in <style>) ----------
  const srcVueFiles = walkVueFiles(SRC_DIR)
  for (const rel of srcVueFiles) {
    const absPath = join(SRC_DIR, rel)
    const content = readFileSync(absPath, 'utf-8')
    const styleErrors = checkStyleDrift(`apps/web-demo/src/${rel}`, content)
    errors.push(...styleErrors)
    errors.push(...checkClassColorDrift(`apps/web-demo/src/${rel}`, content))
  }

  for (const rel of walkFilesByExtension(SRC_DIR, ['.tsx'])) {
    const absPath = join(SRC_DIR, rel)
    const content = readFileSync(absPath, 'utf-8')
    errors.push(...checkClassColorDrift(`apps/web-demo/src/${rel}`, content))
  }

  // ---------- 3. Build System vs vite.config.ts (Rolldown codeSplitting groups) ----------
  const chunkGroupErrors = checkChunkGroupsDrift()
  errors.push(...chunkGroupErrors)

  // ---------- 4. AutoImport / Components vs build plugin config ----------
  const buildPluginsErrors = checkBuildPluginsDrift()
  errors.push(...buildPluginsErrors)

  if (errors.length > 0) {
    console.error('❌ Drift Check 失败:\n')
    errors.forEach((e) => console.error('  ' + e))
    if (errors.some((e) => e.includes('Style Drift'))) {
      console.error('\nStyle Drift: Use Design Tokens or UnoCSS classes instead of hardcoded colors.')
    } else {
      console.error('\n请基于 page.state.ts 同步 index.vue 的 data-archetype。')
    }
    globalThis.process.exit(1)
  }

  console.log('✅ Drift Check 通过: 所有 data-archetype 与 page.state.ts 一致，无 Style Drift')
}

main()
