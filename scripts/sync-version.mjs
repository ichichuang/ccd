#!/usr/bin/env node
/**
 * Version Sync Pipeline
 * - SSOT: package.json → version
 * - Sync targets: src-tauri/tauri.conf.json, src-tauri/Cargo.toml
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const PACKAGE_JSON_PATH = join(ROOT, 'package.json')
const TAURI_CONF_PATH = join(ROOT, 'src-tauri', 'tauri.conf.json')
const CARGO_TOML_PATH = join(ROOT, 'src-tauri', 'Cargo.toml')
const RELEASE_MANIFEST_PATH = join(ROOT, '.release-please-manifest.json')

function readSourceVersion() {
  const raw = readFileSync(PACKAGE_JSON_PATH, 'utf-8')
  const { version } = JSON.parse(raw)
  if (!version) {
    throw new Error('[version-sync] package.json 中未找到 version 字段')
  }
  return version
}

function syncTauriConf(version) {
  const raw = readFileSync(TAURI_CONF_PATH, 'utf-8')
  const json = JSON.parse(raw)
  const prev = json.version
  json.version = version
  writeFileSync(TAURI_CONF_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
  return prev
}

function syncCargoToml(version) {
  const raw = readFileSync(CARGO_TOML_PATH, 'utf-8')
  const pattern = /^version\s*=\s*"[^"]*"/m
  const matched = raw.match(pattern)
  if (!matched) {
    throw new Error('[version-sync] Cargo.toml 中未找到 version 字段')
  }
  const prev = matched[0].match(/"([^"]*)"/)[1]
  const updated = raw.replace(pattern, `version = "${version}"`)
  writeFileSync(CARGO_TOML_PATH, updated, 'utf-8')
  return prev
}

function syncReleaseManifest(version) {
  if (!existsSync(RELEASE_MANIFEST_PATH)) {
    return null
  }
  const raw = readFileSync(RELEASE_MANIFEST_PATH, 'utf-8')
  const json = JSON.parse(raw)
  const prev = json['.']
  json['.'] = version
  writeFileSync(RELEASE_MANIFEST_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
  return prev
}

function main() {
  try {
    const version = readSourceVersion()
    const hasTauri = existsSync(TAURI_CONF_PATH) && existsSync(CARGO_TOML_PATH)

    if (!hasTauri) {
      console.log(
        [
          `[version-sync] SSOT: package.json → v${version}`,
          `[version-sync] ⏭️  Skipped: Tauri workspace not found.`,
        ].join('\n')
      )
      return
    }

    const prevTauri = syncTauriConf(version)
    const prevCargo = syncCargoToml(version)
    const prevManifest = syncReleaseManifest(version)

    const logs = [
      `[version-sync] SSOT: package.json → v${version}`,
      `[version-sync] ✔ src-tauri/tauri.conf.json  ${prevTauri === version ? '(already aligned)' : `${prevTauri} → ${version}`}`,
      `[version-sync] ✔ src-tauri/Cargo.toml        ${prevCargo === version ? '(already aligned)' : `${prevCargo} → ${version}`}`,
    ]

    if (prevManifest !== null) {
      logs.push(
        `[version-sync] ✔ .release-please-manifest   ${prevManifest === version ? '(already aligned)' : `${prevManifest} → ${version}`}`
      )
    }

    logs.push(`[version-sync] Version aligned to v${version} across all workspaces.`)
    console.log(logs.join('\n'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[version-sync] 失败: ${message}`)
    process.exit(1)
  }
}

main()
