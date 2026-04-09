#!/usr/bin/env node
/**
 * Brand Sync Pipeline (metadata-first)
 * - SSOT: src/constants/brand.ts
 * - Sync targets: package.json, src-tauri/tauri.conf.json
 * - Asset check: public/face.png vs src/assets/images/face.webp
 */

import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const BRAND_TS_PATH = join(ROOT, 'src', 'constants', 'brand.ts')
const PACKAGE_JSON_PATH = join(ROOT, 'package.json')
const TAURI_CONF_PATH = join(ROOT, 'src-tauri', 'tauri.conf.json')
const SOURCE_DIR = join(ROOT, 'src', 'assets', 'brand', 'source')
const SOURCE_LOGO_PATH = join(SOURCE_DIR, 'logo-source.png')
const SOURCE_LOGO_SQUARE_TEMP_PATH = join(SOURCE_DIR, 'logo-source.square-temp.png')
const PUBLIC_FAVICON_PATH = join(ROOT, 'public', 'face.png')
const APP_LOGO_PATH = join(ROOT, 'src', 'assets', 'images', 'face.webp')

/**
 * 从 brand.ts 提取指定键值（仅支持单引号字符串字面量，满足当前仓库格式）
 * @param {string} content
 * @param {string} key
 */
function pickStringLiteral(content, key) {
  const pattern = new RegExp(`${key}\\s*:\\s*'([^']*)'`)
  const matched = content.match(pattern)
  if (!matched) {
    throw new Error(`[brand-sync] 无法在 brand.ts 中解析字段: ${key}`)
  }
  return matched[1]
}

function readBrandSnapshot() {
  const raw = readFileSync(BRAND_TS_PATH, 'utf-8')
  const snapshot = {
    id: pickStringLiteral(raw, 'id'),
    name: pickStringLiteral(raw, 'name'),
    displayName: pickStringLiteral(raw, 'displayName'),
    description: pickStringLiteral(raw, 'description'),
    author: pickStringLiteral(raw, 'author'),
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
      '[brand-sync] 警告: 资产检查跳过（public/face.png 或 src/assets/images/face.webp 不存在）。'
    )
    return { hasMismatch: false, reports }
  }

  const faviconDigest = digestFile(PUBLIC_FAVICON_PATH)
  const appLogoDigest = digestFile(APP_LOGO_PATH)

  if (faviconDigest !== appLogoDigest) {
    if (hasSourceLogo) {
      reports.push(
        '[brand-sync] 警告: public/face.png 与 src/assets/images/face.webp 摘要不一致（可能由跨格式导致），已检测到 source/logo-source.png，按非阻塞处理。'
      )
      return { hasMismatch: false, reports }
    }

    reports.push(
      '[brand-sync] 警告: public/face.png 与 src/assets/images/face.webp 文件摘要不一致，且 source/logo-source.png 缺失。'
    )
    return { hasMismatch: true, reports }
  }

  reports.push('[brand-sync] 资产检查通过: public/face.png 与 src/assets/images/face.webp 摘要一致。')
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
    console.warn(
      '[brand-sync] 当前非 macOS 环境，跳过 sips 预处理，直接使用原图执行 tauri icon。'
    )
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
  if (!existsSync(SOURCE_LOGO_PATH)) {
    console.warn(
      '[brand-sync] 跳过图标工厂：未检测到 src/assets/brand/source/logo-source.png。'
    )
    return
  }

  const iconSourcePath = prepareSquareLogoSource()
  const iconSourceArg = iconSourcePath.startsWith(ROOT)
    ? iconSourcePath.slice(ROOT.length + 1)
    : iconSourcePath

  execSync(`pnpm tauri icon "${iconSourceArg}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  })
}

function main() {
  try {
    const brand = readBrandSnapshot()
    syncPackageJson(brand)
    syncTauriConfig(brand)
    generateTauriIcons()

    const assetResult = checkAssets()
    console.log(
      [
        `[brand-sync] 已同步 package.json <- ${brand.name}/${brand.description}/${brand.author}`,
        `[brand-sync] 已同步 src-tauri/tauri.conf.json <- identifier=${brand.id}, productName=${brand.name}, window.title=${brand.displayName}`,
        ...assetResult.reports,
      ].join('\n')
    )

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
