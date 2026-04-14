#!/usr/bin/env node
/**
 * Desktop Config Sync Pipeline
 * - Dev Port SSOT: Vite development env (VITE_PORT)
 * - Sync targets: src-tauri/tauri.conf.json, .vscode/launch.json
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const TAURI_CONF_PATH = join(ROOT, 'src-tauri', 'tauri.conf.json')
const VSCODE_LAUNCH_PATH = join(ROOT, '.vscode', 'launch.json')

function readDesktopDevPort() {
  const env = loadEnv('development', ROOT, '')
  const rawPort = env.VITE_PORT ?? '8888'
  const port = Number(rawPort)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`[desktop-sync] 无效的 VITE_PORT: ${rawPort}`)
  }

  return port
}

function replaceUrlPort(rawUrl, port) {
  if (!rawUrl) {
    return `http://localhost:${port}`
  }

  try {
    const url = new URL(rawUrl)
    url.port = String(port)
    const pathname = url.pathname === '/' ? '' : url.pathname
    return `${url.protocol}//${url.host}${pathname}${url.search}${url.hash}`
  } catch {
    return `http://localhost:${port}`
  }
}

function syncTauriDevUrl(port) {
  if (!existsSync(TAURI_CONF_PATH)) return null

  const raw = readFileSync(TAURI_CONF_PATH, 'utf-8')
  const json = JSON.parse(raw)
  const prev = json.build?.devUrl ?? ''
  const next = replaceUrlPort(prev, port)

  json.build = json.build ?? {}
  json.build.devUrl = next

  writeFileSync(TAURI_CONF_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
  return { prev, next }
}

function syncVsCodeLaunchUrl(port) {
  if (!existsSync(VSCODE_LAUNCH_PATH)) return null

  const raw = readFileSync(VSCODE_LAUNCH_PATH, 'utf-8')
  const pattern = /("url"\s*:\s*")([^"]+)(")/
  const matched = raw.match(pattern)
  if (!matched) {
    throw new Error('[desktop-sync] .vscode/launch.json 中未找到调试 url 字段')
  }

  const prev = matched[2]
  const next = replaceUrlPort(prev, port)
  const updated = raw.replace(pattern, `$1${next}$3`)

  writeFileSync(VSCODE_LAUNCH_PATH, updated, 'utf-8')
  return { prev, next }
}

function main() {
  try {
    const port = readDesktopDevPort()
    const tauriResult = syncTauriDevUrl(port)
    const launchResult = syncVsCodeLaunchUrl(port)

    const logs = [`[desktop-sync] SSOT: development VITE_PORT -> ${port}`]

    if (tauriResult) {
      logs.push(
        `[desktop-sync] ✔ src-tauri/tauri.conf.json  ${tauriResult.prev === tauriResult.next ? '(already aligned)' : `${tauriResult.prev} -> ${tauriResult.next}`}`
      )
    } else {
      logs.push('[desktop-sync] ⏭️  Skipped: src-tauri/tauri.conf.json not found.')
    }

    if (launchResult) {
      logs.push(
        `[desktop-sync] ✔ .vscode/launch.json        ${launchResult.prev === launchResult.next ? '(already aligned)' : `${launchResult.prev} -> ${launchResult.next}`}`
      )
    } else {
      logs.push('[desktop-sync] ⏭️  Skipped: .vscode/launch.json not found.')
    }

    console.log(logs.join('\n'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[desktop-sync] 失败: ${message}`)
    process.exit(1)
  }
}

main()
