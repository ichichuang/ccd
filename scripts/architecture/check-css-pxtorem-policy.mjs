#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const viteConfigPath = 'apps/web-demo/vite.config.ts'
const source = readFileSync(join(root, viteConfigPath), 'utf8')

const findings = []

function requireSource(pattern, message) {
  if (!pattern.test(source)) findings.push(`${viteConfigPath}: ${message}`)
}

function requireText(text, message) {
  if (!source.includes(text)) findings.push(`${viteConfigPath}: ${message}`)
}

requireSource(/isBuild\s*\?\s*\[/, 'postcss-pxtorem must run only during build')
requireSource(/postcssPxToRem\(/, 'postcss-pxtorem plugin must remain explicit and auditable')
requireSource(/exclude:\s*shouldExcludePxToRemFile/, 'postcss-pxtorem must use file-level exclusions')
requireSource(/PX_TO_REM_FILE_EXCLUDES/, 'file-level px-to-rem exclusions must be centralized')
requireSource(/node_modules/i, 'third-party node_modules CSS must be excluded')
requireText('packages[/\\\\](?:vue-ui|vue-primevue-adapter|vue-charts)', 'shared workspace package dist CSS must be excluded')
requireSource(/@primevue/i, 'PrimeVue CSS paths must be excluded')
requireSource(/@primeuix/i, 'PrimeUIX theme CSS paths must be excluded')
requireSource(/virtual:uno/i, 'virtual UnoCSS output must be excluded')
requireSource(/uno\\\.css/, 'generated UnoCSS output must be excluded')
requireSource(/selectorBlackList:\s*PX_TO_REM_SELECTOR_BLACKLIST/, 'selector blacklist must be centralized')
requireText('/^html$/', 'html selector must remain excluded from rem conversion')
requireText('/^:root$/', ':root selector must remain excluded from rem conversion')
requireSource(/!border-width/, 'border widths must stay pixel-accurate')

if (findings.length > 0) {
  console.error('CSS px-to-rem policy validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('CSS px-to-rem policy validation passed.')
