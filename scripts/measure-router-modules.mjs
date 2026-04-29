import fs from 'node:fs'
import { performance } from 'node:perf_hooks'
import fg from 'fast-glob'

const MODULE_GLOB = 'src/router/modules/**/*.ts'
const ITERATIONS = 1000
const MANIFEST_REVIEW_THRESHOLD_MS = 5

function toModuleName(path) {
  return path
    .replace(/^src\/router\/modules\//, '')
    .replace(/\.(ts|js|vue)$/, '')
    .replace(/\/index$/, '')
}

const files = fg.sync(MODULE_GLOB, { onlyFiles: true }).sort()
const totalBytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0)

const start = performance.now()
for (let i = 0; i < ITERATIONS; i += 1) {
  files.map(toModuleName)
}
const elapsed = performance.now() - start
const avgMs = elapsed / ITERATIONS
const recommendation =
  avgMs > MANIFEST_REVIEW_THRESHOLD_MS
    ? 'review virtual manifest generation before adding more route modules'
    : 'keep import.meta.glob eager route modules; virtual manifest not justified'

console.log(
  JSON.stringify(
    {
      files: files.length,
      totalBytes,
      iterations: ITERATIONS,
      avgNormalizeMs: Number(avgMs.toFixed(4)),
      thresholdMs: MANIFEST_REVIEW_THRESHOLD_MS,
      recommendation,
    },
    null,
    2
  )
)
