#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const distDir = join(root, 'apps/desktop/dist')
const maxBytes = Number(process.env.CCD_DESKTOP_BUNDLE_MAX_BYTES ?? 2_500_000)

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = join(dir, entry.name)
    return entry.isDirectory() ? walk(absolute) : [absolute]
  })
}

if (!existsSync(distDir)) {
  console.error('Desktop size check failed: apps/desktop/dist does not exist. Run pnpm --filter @ccd/desktop build first.')
  process.exit(1)
}

const files = walk(distDir).filter(file => statSync(file).isFile())
const total = files.reduce((sum, file) => sum + statSync(file).size, 0)
const leakedDemoFiles = files.filter(file => /example|playground|mock/i.test(relative(distDir, file)))

if (leakedDemoFiles.length > 0) {
  console.error('Desktop size check failed: demo/example artifacts leaked into desktop dist:')
  leakedDemoFiles.forEach(file => console.error(`- ${relative(root, file)}`))
  process.exit(1)
}

if (total > maxBytes) {
  console.error(`Desktop size check failed: ${total} bytes > ${maxBytes} bytes`)
  process.exit(1)
}

console.log(`Desktop size check passed: ${total} bytes <= ${maxBytes} bytes`)
