#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const sourcePath = 'src/design-engine/shortcuts/semanticShortcuts.ts'
const manifestPath = '.ai/manifests/unocss-semantic-shortcuts.json'
const htmlDataPath = '.vscode/unocss-semantic-shortcuts.html-data.json'
const snippetsPath = '.vscode/unocss-semantic-shortcuts.code-snippets'

function ensureParent(relPath) {
  fs.mkdirSync(path.dirname(path.join(cwd, relPath)), { recursive: true })
}

function readShortcutNames() {
  const absoluteSource = path.join(cwd, sourcePath)
  if (!fs.existsSync(absoluteSource)) {
    console.log(`[UNOCSS] skipped: ${sourcePath} not present in workspace root`)
    return []
  }
  const source = fs.readFileSync(absoluteSource, 'utf8')
  const names = []
  const keyPattern = /^\s*(?:\[['"]([^'"]+)['"]\]|['"]([^'"]+)['"]|([A-Za-z][\w-]*))\s*:/gm
  let match

  while ((match = keyPattern.exec(source)) !== null) {
    const name = match[1] ?? match[2] ?? match[3]
    if (name && !names.includes(name)) {
      names.push(name)
    }
  }

  return names.sort((a, b) => a.localeCompare(b))
}

function writeJson(relPath, payload) {
  ensureParent(relPath)
  fs.writeFileSync(path.join(cwd, relPath), `${JSON.stringify(payload, null, 2)}\n`)
}

const shortcuts = readShortcutNames()
const internalShortcuts = new Set(['glass-base'])
const description = name =>
  internalShortcuts.has(name)
    ? `INTERNAL shortcut from ${sourcePath}: ${name}. Do not use directly in templates; use public glass-* wrappers.`
    : `UnoCSS semantic shortcut generated from ${sourcePath}: ${name}`

writeJson(manifestPath, {
  schemaVersion: 1,
  generatedBy: 'scripts/generate-unocss-ide-data.mjs',
  source: sourcePath,
  count: shortcuts.length,
  shortcuts: shortcuts.map(name => ({
    name,
    description: description(name),
  })),
})

writeJson(htmlDataPath, {
  version: 1.1,
  globalAttributes: [
    {
      name: 'class',
      values: shortcuts.map(name => ({
        name,
        description: description(name),
      })),
    },
  ],
})

writeJson(
  snippetsPath,
  Object.fromEntries(
    shortcuts.map(name => [
      `UnoCSS semantic shortcut: ${name}`,
      {
        scope: 'vue,html,javascriptreact,typescriptreact',
        prefix: name,
        body: name,
        description: description(name),
      },
    ])
  )
)

console.log(`[UNOCSS] ${manifestPath} (${shortcuts.length} shortcuts)`)
console.log(`[UNOCSS] ${htmlDataPath}`)
console.log(`[UNOCSS] ${snippetsPath}`)
