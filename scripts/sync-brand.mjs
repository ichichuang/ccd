#!/usr/bin/env node
/**
 * Brand Sync Pipeline (metadata-first)
 * - SSOT: src/constants/brand.ts
 * - Sync targets: package.json, src-tauri/tauri.conf.json
 * - Asset check: public/face.png vs src/assets/images/face.png
 */

import { createHash } from 'node:crypto'
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const BRAND_TS_PATH = join(ROOT, 'src', 'constants', 'brand.ts')
const PACKAGE_JSON_PATH = join(ROOT, 'package.json')
const TAURI_CONF_PATH = join(ROOT, 'src-tauri', 'tauri.conf.json')
const CARGO_TOML_PATH = join(ROOT, 'src-tauri', 'Cargo.toml')
const CAPABILITIES_PATH = join(ROOT, 'src-tauri', 'capabilities', 'default.json')
const SOURCE_DIR = join(ROOT, 'src', 'assets', 'brand', 'source')
const SOURCE_LOGO_PATH = join(SOURCE_DIR, 'logo-source.png')
const SOURCE_LOGO_SQUARE_TEMP_PATH = join(SOURCE_DIR, 'logo-source.square-temp.png')
const PUBLIC_FAVICON_PATH = join(ROOT, 'public', 'face.png')
const APP_LOGO_PATH = join(ROOT, 'src', 'assets', 'images', 'face.png')
const SHOULD_SKIP_TAURI_ICON =
  process.env.SKIP_TAURI_ICON === '1' || process.env.SKIP_TAURI_ICON === 'true'
const HAS_TAURI_WORKSPACE = existsSync(TAURI_CONF_PATH) && existsSync(CARGO_TOML_PATH)

function assertStringField(target, key, { optional = false } = {}) {
  const value = target[key]
  if (optional && (value === undefined || value === null || value === '')) {
    return null
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`[brand-sync] brand.${key} 必须是非空字符串`)
  }
  return value
}

function readBrandSnapshot() {
  const raw = readFileSync(BRAND_TS_PATH, 'utf-8')
  const transpiled = ts.transpileModule(raw, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: BRAND_TS_PATH,
  })
  const sandbox = {
    exports: {},
    module: { exports: {} },
  }
  vm.runInNewContext(transpiled.outputText, sandbox, { filename: BRAND_TS_PATH })
  const brand = sandbox.exports.brand ?? sandbox.module.exports.brand

  if (!brand || typeof brand !== 'object') {
    throw new Error('[brand-sync] brand.ts 必须导出 brand 常量对象')
  }

  const snapshot = {
    id: assertStringField(brand, 'id', { optional: true }),
    name: assertStringField(brand, 'name'),
    displayName: assertStringField(brand, 'displayName'),
    description: assertStringField(brand, 'description'),
    author: assertStringField(brand, 'author'),
  }
  return snapshot
}

function syncPackageJson(brand) {
  const raw = readFileSync(PACKAGE_JSON_PATH, 'utf-8')
  const json = JSON.parse(raw)

  json.name = brand.name
  json.description = brand.description
  json.author = brand.author

  writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
}

function syncTauriConfig(brand) {
  if (!existsSync(TAURI_CONF_PATH)) return

  const raw = readFileSync(TAURI_CONF_PATH, 'utf-8')
  const json = JSON.parse(raw)

  json.identifier = brand.id
  json.productName = brand.name
  if (json.app?.windows?.[0]) {
    json.app.windows[0].title = brand.displayName
  }

  writeFileSync(TAURI_CONF_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
}

function digestFile(path) {
  const buf = readFileSync(path)
  return createHash('sha256').update(buf).digest('hex')
}

function checkAssets() {
  const reports = []
  const hasSourceLogo = existsSync(SOURCE_LOGO_PATH)

  if (!hasSourceLogo) {
    reports.push(
      '[brand-sync] 提示: 未检测到 src/assets/brand/source/logo-source.png，建议先建立品牌母版源头文件。'
    )
  }

  if (!existsSync(PUBLIC_FAVICON_PATH) || !existsSync(APP_LOGO_PATH)) {
    reports.push(
      '[brand-sync] 警告: 资产检查跳过（public/face.png 或 src/assets/images/face.png 不存在）。'
    )
    return { hasMismatch: false, reports }
  }

  const faviconDigest = digestFile(PUBLIC_FAVICON_PATH)
  const appLogoDigest = digestFile(APP_LOGO_PATH)

  if (faviconDigest !== appLogoDigest) {
    if (hasSourceLogo) {
      reports.push(
        '[brand-sync] 警告: public/face.png 与 src/assets/images/face.png 摘要不一致（可能由跨格式导致），已检测到 source/logo-source.png，按非阻塞处理。'
      )
      return { hasMismatch: false, reports }
    }

    if (!HAS_TAURI_WORKSPACE) {
      reports.push(
        '[brand-sync] 警告: 当前为无 Tauri workspace 的主分支环境，public/face.png 与 src/assets/images/face.png 摘要不一致按非阻塞处理。'
      )
      return { hasMismatch: false, reports }
    }

    reports.push(
      '[brand-sync] 警告: public/face.png 与 src/assets/images/face.png 文件摘要不一致，且 source/logo-source.png 缺失。'
    )
    return { hasMismatch: true, reports }
  }

  reports.push(
    '[brand-sync] 资产检查通过: public/face.png 与 src/assets/images/face.png 摘要一致。'
  )
  return { hasMismatch: false, reports }
}

function readImageSizeBySips(imagePath) {
  const output = execSync(`sips -g pixelWidth -g pixelHeight "${imagePath}"`, {
    cwd: ROOT,
    encoding: 'utf-8',
  })
  const widthMatch = output.match(/pixelWidth:\s*(\d+)/)
  const heightMatch = output.match(/pixelHeight:\s*(\d+)/)

  if (!widthMatch || !heightMatch) {
    throw new Error('[brand-sync] 无法读取 logo-source.png 的宽高信息。')
  }

  return {
    width: Number(widthMatch[1]),
    height: Number(heightMatch[1]),
  }
}

function prepareSquareLogoSource() {
  if (!existsSync(SOURCE_LOGO_PATH)) {
    throw new Error(
      '[brand-sync] 未检测到 src/assets/brand/source/logo-source.png，无法执行 tauri icon。'
    )
  }

  if (process.platform !== 'darwin') {
    console.warn('[brand-sync] 当前非 macOS 环境，跳过 sips 预处理，直接使用原图执行 tauri icon。')
    return SOURCE_LOGO_PATH
  }

  const { width, height } = readImageSizeBySips(SOURCE_LOGO_PATH)
  if (width === height) {
    return SOURCE_LOGO_PATH
  }

  const side = Math.min(width, height)
  // 采用中心裁剪生成临时正方形图，保留原始母版不变
  execSync(
    `sips -c ${side} ${side} "${SOURCE_LOGO_PATH}" --out "${SOURCE_LOGO_SQUARE_TEMP_PATH}"`,
    {
      cwd: ROOT,
      stdio: 'inherit',
    }
  )
  console.warn(
    `[brand-sync] 检测到 logo-source.png 非正方形(${width}x${height})，已生成临时正方形源: ${SOURCE_LOGO_SQUARE_TEMP_PATH}`
  )
  return SOURCE_LOGO_SQUARE_TEMP_PATH
}

function generateTauriIcons() {
  if (!HAS_TAURI_WORKSPACE) {
    console.warn('[brand-sync] 跳过 tauri icon：未检测到完整的 Tauri workspace。')
    return
  }

  if (SHOULD_SKIP_TAURI_ICON) {
    console.warn('[brand-sync] 已跳过 tauri icon 生成（SKIP_TAURI_ICON=1）。')
    return
  }

  if (!existsSync(SOURCE_LOGO_PATH)) {
    console.warn('[brand-sync] 跳过图标工厂：未检测到 src/assets/brand/source/logo-source.png。')
    return
  }

  const iconSourcePath = prepareSquareLogoSource()
  const iconSourceArg = iconSourcePath.startsWith(ROOT)
    ? iconSourcePath.slice(ROOT.length + 1)
    : iconSourcePath

  const tauriVersion = spawnSync('pnpm', ['exec', 'tauri', '--version'], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (tauriVersion.status !== 0) {
    console.warn('[brand-sync] 跳过 tauri icon：当前工作区未安装 Tauri CLI。')
    return
  }

  execSync(`pnpm tauri icon "${iconSourceArg}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  })
}

function syncCargoTomlMeta(brand) {
  if (!existsSync(CARGO_TOML_PATH)) return

  let raw = readFileSync(CARGO_TOML_PATH, 'utf-8')

  const descPattern = /^description\s*=\s*"[^"]*"/m
  if (descPattern.test(raw)) {
    raw = raw.replace(descPattern, `description = "${brand.description}"`)
  }

  const authorsPattern = /^authors\s*=\s*\[.*?\]/m
  if (authorsPattern.test(raw)) {
    raw = raw.replace(authorsPattern, `authors = ["${brand.author}"]`)
  }

  writeFileSync(CARGO_TOML_PATH, raw, 'utf-8')
}

function syncTauriCapabilities(brand) {
  if (!existsSync(CAPABILITIES_PATH)) return

  const raw = readFileSync(CAPABILITIES_PATH, 'utf-8')
  const json = JSON.parse(raw)

  json.description = `Minimum required permissions for ${brand.name}`

  writeFileSync(CAPABILITIES_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
}

function main() {
  try {
    const brand = readBrandSnapshot()
    syncPackageJson(brand)
    if (HAS_TAURI_WORKSPACE) {
      syncTauriConfig(brand)
      syncCargoTomlMeta(brand)
      syncTauriCapabilities(brand)
    }
    generateTauriIcons()

    const assetResult = checkAssets()
    const logs = [
      `[brand-sync] 已同步 package.json <- ${brand.name}/${brand.description}/${brand.author}`,
    ]
    if (HAS_TAURI_WORKSPACE && existsSync(TAURI_CONF_PATH)) {
      logs.push(
        `[brand-sync] 已同步 src-tauri/tauri.conf.json <- identifier=${brand.id}, productName=${brand.name}, window.title=${brand.displayName}`
      )
    }
    if (HAS_TAURI_WORKSPACE && existsSync(CARGO_TOML_PATH)) {
      logs.push(
        `[brand-sync] 已同步 src-tauri/Cargo.toml <- description=${brand.description}, authors=[${brand.author}]`
      )
    }
    if (HAS_TAURI_WORKSPACE && existsSync(CAPABILITIES_PATH)) {
      logs.push(
        `[brand-sync] 已同步 src-tauri/capabilities/default.json <- description for ${brand.name}`
      )
    }
    logs.push(...assetResult.reports)
    console.log(logs.join('\n'))

    if (assetResult.hasMismatch) {
      process.exit(1)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[brand-sync] 失败: ${message}`)
    process.exit(1)
  }
}

main()
