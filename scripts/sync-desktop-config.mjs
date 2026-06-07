#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const desktopEnvFiles = ['.env', '.env.development']
const tauriConfigPath = 'apps/desktop/src-tauri/tauri.conf.json'
const requiredDesktopFiles = [
  'apps/desktop/src-tauri/capabilities/default.json',
  tauriConfigPath,
]

function readText(relPath) {
  return fs.readFileSync(path.join(cwd, relPath), 'utf8')
}

function readJson(relPath) {
  return JSON.parse(readText(relPath))
}

function writeJson(relPath, value) {
  fs.writeFileSync(path.join(cwd, relPath), `${JSON.stringify(value, null, 2)}\n`)
}

function stripEnvValue(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function readEnvFile(relPath) {
  const absolutePath = path.join(cwd, relPath)
  if (!fs.existsSync(absolutePath)) return new Map()

  const values = new Map()
  readText(relPath)
    .split(/\r?\n/)
    .forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match) return
      values.set(match[1], stripEnvValue(match[2]))
    })

  return values
}

function readDesktopPort() {
  const values = new Map()

  desktopEnvFiles.forEach(relPath => {
    readEnvFile(relPath).forEach((value, key) => values.set(key, value))
  })

  const rawPort = values.get('VITE_DESKTOP_PORT')
  const port = Number(rawPort)

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    console.error('[desktop-config] VITE_DESKTOP_PORT must be an integer between 1 and 65535.')
    process.exit(1)
  }

  return port
}

function syncTauriDevUrl(desktopPort) {
  const tauriConfig = readJson(tauriConfigPath)
  const expectedDevUrl = `http://localhost:${desktopPort}`

  tauriConfig.build ??= {}
  if (tauriConfig.build.devUrl === expectedDevUrl) {
    console.log(`[desktop-config] Tauri devUrl already synchronized: ${expectedDevUrl}`)
    return
  }

  tauriConfig.build.devUrl = expectedDevUrl
  writeJson(tauriConfigPath, tauriConfig)
  console.log(`[desktop-config] synchronized Tauri devUrl: ${expectedDevUrl}`)
}

function runProjectDoctor() {
  const result = spawnSync('pnpm', ['project:doctor'], {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const missing = requiredDesktopFiles.filter(relPath => !fs.existsSync(path.join(cwd, relPath)))
if (missing.length > 0) {
  console.error('[desktop-config] desktop-scoped changes detected, but required Tauri config is missing:')
  missing.forEach(relPath => console.error(`  - ${relPath}`))
  process.exit(1)
}

const desktopPort = readDesktopPort()
syncTauriDevUrl(desktopPort)

console.log('[desktop-config] checked desktop config surfaces:')
requiredDesktopFiles.forEach(relPath => console.log(`  - ${relPath}`))
runProjectDoctor()
