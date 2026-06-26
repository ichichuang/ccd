#!/usr/bin/env node
/**
 * Governance guard for wiki/generated/web-demo-ui-inventory.md.
 *
 * The web-demo UI inventory has no code generator; it is maintained by hand from
 * the live route source of truth. Nothing in the governance gate previously
 * validated its content, so it silently drifted (GOV-01: 200 stale `/example`
 * references for a route surface that was retired and rebuilt).
 *
 * This check derives the current top-level route sections from source and asserts
 * the committed inventory stays in sync:
 *   A. it contains zero references to the retired `/example` route surface;
 *   B. it covers every current top-level route family (dashboard, architecture,
 *      runtime, ui, system, desktop, showcase);
 *   C. every route path it cites resolves to a top-level section that still exists
 *      in the live route source (so a future retired section is caught generically).
 *
 * Read-only: it never writes. Run via `pnpm wiki:ui-inventory:check`; also wired
 * into `pnpm governance:gate`.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const INVENTORY = 'wiki/generated/web-demo-ui-inventory.md'
const ROUTE_MODULES_DIR = 'apps/web-demo/src/router/modules'
const SHOWCASE_CATALOG = 'apps/web-demo/src/views/showcase/data/showcaseCatalog.ts'
const ROUTER_CONSTANTS = 'apps/web-demo/src/constants/router.ts'

// Top-level families the inventory must always cover for AI maintenance.
const REQUIRED_SECTIONS = [
  '/dashboard',
  '/architecture',
  '/runtime',
  '/ui',
  '/system',
  '/desktop',
  '/showcase',
]

function read(rel) {
  return readFileSync(path.join(root, rel), 'utf8')
}

/** First path segment, e.g. `/ui/charts` -> `/ui`. Null for non-section tokens. */
function topSegment(token) {
  const match = /^\/([a-z0-9][a-z0-9-]*)/.exec(token)
  return match ? `/${match[1]}` : null
}

/** Derive the set of live top-level route sections from source files. */
function liveSections() {
  const sections = new Set()
  const addFrom = text => {
    for (const m of text.matchAll(/path:\s*'(\/[^']*)'/g)) {
      const seg = topSegment(m[1])
      if (seg) sections.add(seg)
    }
    for (const m of text.matchAll(/path:\s*`(\/[^`]*)`/g)) {
      const seg = topSegment(m[1])
      if (seg) sections.add(seg)
    }
  }

  // Route modules (architecture/runtime/ui/system/desktop have literal top paths).
  for (const file of readdirSync(path.join(root, ROUTE_MODULES_DIR))) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue
    addFrom(read(path.join(ROUTE_MODULES_DIR, file)))
  }
  // Showcase catalog (root, groups, leaves — literal and template paths).
  addFrom(read(SHOWCASE_CATALOG))
  // Route constants (root, login, register, dashboard, error pages — literal values).
  for (const m of read(ROUTER_CONSTANTS).matchAll(/:\s*'(\/[^']*)'/g)) {
    const seg = topSegment(m[1])
    if (seg) sections.add(seg)
  }
  return sections
}

/**
 * Inline-code route tokens cited in the inventory, with fenced blocks removed.
 * Only path-shaped inline code is considered (lowercase segments, digits, `/`, `-`),
 * so ordinary prose such as `` `dashboard`/console modules `` is not misread as a path.
 */
function inventoryRouteTokens(markdown) {
  const withoutFences = markdown.replace(/```[\s\S]*?```/g, '')
  const tokens = new Set()
  for (const m of withoutFences.matchAll(/`(\/[a-z0-9][a-z0-9/-]*)`/g)) {
    tokens.add(m[1])
  }
  return tokens
}

function main() {
  const markdown = read(INVENTORY)
  const live = liveSections()
  const tokens = inventoryRouteTokens(markdown)
  const citedSections = new Set()
  for (const token of tokens) {
    const seg = topSegment(token)
    if (seg) citedSections.add(seg)
  }

  const failures = []

  // A. No retired `/example` route surface (the GOV-01 regression).
  const exampleHits = (markdown.match(/\/example\b/g) || []).length
  if (exampleHits > 0) {
    failures.push(`inventory still references the retired \`/example\` surface (${exampleHits} hit(s))`)
  }

  // B. Every current top-level family is represented.
  for (const required of REQUIRED_SECTIONS) {
    if (!citedSections.has(required)) {
      failures.push(`inventory is missing current route family ${required}`)
    }
    if (!live.has(required)) {
      failures.push(`expected family ${required} is not present in live route source (update this guard)`)
    }
  }

  // C. Every cited top-level section still exists in the live route source.
  for (const seg of [...citedSections].sort()) {
    if (!live.has(seg)) {
      failures.push(`inventory cites \`${seg}\` which is not a live route section`)
    }
  }

  if (failures.length > 0) {
    console.error(`[wiki:ui-inventory] ${failures.length} finding(s) in ${INVENTORY}:`)
    for (const failure of failures) console.error(`- ${failure}`)
    console.error(
      '\nRefresh wiki/generated/web-demo-ui-inventory.md from the live route source ' +
        '(router modules + showcaseCatalog.ts + constants/router.ts) and re-run this check.'
    )
    process.exit(1)
  }

  console.log(
    `[wiki:ui-inventory] OK — ${citedSections.size} cited section(s) all live, ` +
      `0 \`/example\` references, ${REQUIRED_SECTIONS.length} families covered.`
  )
}

main()
