import { createGenerator } from '@unocss/core'

import unoConfig from '../../uno.config.ts'

const REQUIRED_CLASSES = [
  'text-primary',
  'text-foreground',
  'text-muted-foreground',
  'text-danger',
  'text-success',
  'text-warn',
  'text-info',
  'bg-primary',
  'bg-sidebar',
  'bg-sidebar-primary',
  'text-sidebar-primary',
  'text-sidebar-primary-foreground',
  'border-sidebar-primary',
  'hover:bg-sidebar-accent',
  'hover:text-sidebar-accent-foreground',
  'ring-primary',
  'border-primary',
]

function escapeSelectorClass(className) {
  return className.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')
}

function hasGeneratedRule(css, className) {
  const escaped = escapeSelectorClass(className)
  return css.includes(`.${escaped}`)
}

const uno = await createGenerator(unoConfig)
const { css } = await uno.generate(REQUIRED_CLASSES.join(' '), { preflights: false })

const rows = REQUIRED_CLASSES.map(className => ({
  className,
  generated: hasGeneratedRule(css, className),
}))

const classColumnWidth = Math.max('class name'.length, ...rows.map(row => row.className.length))
console.log(`${'class name'.padEnd(classColumnWidth)} | generated`)
console.log(`${'-'.repeat(classColumnWidth)} | ---------`)
for (const row of rows) {
  console.log(`${row.className.padEnd(classColumnWidth)} | ${row.generated ? 'yes' : 'no'}`)
}

const missing = rows.filter(row => !row.generated)
if (missing.length > 0) {
  console.error(`\nMissing UnoCSS token classes: ${missing.map(row => row.className).join(', ')}`)
  process.exit(1)
}
