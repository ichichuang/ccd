import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const SKILL_ROOTS = [
  { root: '.ai/skills/core', layer: 'core', syncTargets: ['codex', 'cursor'] },
  { root: '.ai/skills/codex', layer: 'codex', syncTargets: ['codex'] },
  { root: '.ai/skills/cursor', layer: 'cursor', syncTargets: ['cursor'] },
]

export const SKILL_ROUTING_MANIFEST = '.ai/manifests/skill-routing.json'

const TRANSIENT_DIRS = new Set(['__pycache__'])
const TRANSIENT_FILE_SUFFIXES = ['.pyc']

const toPosixPath = relPath => relPath.split(path.sep).join(path.posix.sep)

const shouldIgnoreFile = relPath => {
  const base = path.basename(relPath)
  if (base === '.DS_Store') return true
  return TRANSIENT_FILE_SUFFIXES.some(suffix => base.endsWith(suffix))
}

const hashBuffer = buffer => crypto.createHash('sha256').update(buffer).digest('hex')

const hashFile = absPath => hashBuffer(fs.readFileSync(absPath))

const hashDirectory = absRoot => {
  const files = []

  const walk = (currentAbs, currentRel = '') => {
    for (const entry of fs.readdirSync(currentAbs, { withFileTypes: true })) {
      if (entry.isDirectory() && TRANSIENT_DIRS.has(entry.name)) continue

      const nextAbs = path.join(currentAbs, entry.name)
      const nextRel = currentRel ? path.join(currentRel, entry.name) : entry.name

      if (entry.isDirectory()) {
        walk(nextAbs, nextRel)
        continue
      }

      if (shouldIgnoreFile(nextRel)) continue
      files.push([toPosixPath(nextRel), nextAbs])
    }
  }

  walk(absRoot)
  files.sort(([a], [b]) => a.localeCompare(b))

  const hash = crypto.createHash('sha256')
  for (const [relPath, absPath] of files) {
    hash.update(relPath)
    hash.update('\0')
    hash.update(fs.readFileSync(absPath))
    hash.update('\0')
  }
  return hash.digest('hex')
}

export const scanSkillDirectories = cwd => {
  const skills = []
  const seenNames = new Map()

  for (const { root, layer, syncTargets } of SKILL_ROOTS) {
    const absRoot = path.join(cwd, root)
    if (!fs.existsSync(absRoot)) continue

    const entries = fs
      .readdirSync(absRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))

    for (const entry of entries) {
      if (seenNames.has(entry.name)) {
        throw new Error(`duplicate skill name "${entry.name}" under ${root} and ${seenNames.get(entry.name)}`)
      }

      const relPath = toPosixPath(path.join(root, entry.name))
      seenNames.set(entry.name, relPath)
      skills.push({
        name: entry.name,
        relPath,
        layer,
        syncTargets,
      })
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export const generateSkillsLock = cwd => {
  const entries = {}

  for (const skill of scanSkillDirectories(cwd)) {
    entries[skill.name] = {
      source: `repo:${skill.relPath}`,
      sourceType: 'local',
      layer: skill.layer,
      syncTargets: skill.syncTargets,
      computedHash: hashDirectory(path.join(cwd, skill.relPath)),
    }
  }

  entries['skill-routing'] = {
    source: `repo:${SKILL_ROUTING_MANIFEST}`,
    sourceType: 'local',
    kind: 'manifest',
    computedHash: hashFile(path.join(cwd, SKILL_ROUTING_MANIFEST)),
  }

  return {
    version: 2,
    skills: Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b))),
  }
}

export const stringifySkillsLock = lock => `${JSON.stringify(lock, null, 2)}\n`

export const readSkillRoutingManifest = cwd =>
  JSON.parse(fs.readFileSync(path.join(cwd, SKILL_ROUTING_MANIFEST), 'utf8'))

export const collectRouteSkillTargets = routing => {
  const targets = new Set()

  for (const skill of routing?.default_route?.skills ?? []) {
    targets.add(skill)
  }

  for (const route of routing?.routes ?? []) {
    for (const skill of route.skills ?? []) {
      targets.add(skill)
    }
  }

  return [...targets].sort()
}

export const validateSkillRoutingTargets = cwd => {
  const routing = readSkillRoutingManifest(cwd)
  const knownTargets = new Set(scanSkillDirectories(cwd).map(skill => skill.relPath))
  const invalidTargets = []

  for (const target of collectRouteSkillTargets(routing)) {
    const absTarget = path.join(cwd, target)
    const stat = fs.lstatSync(absTarget, { throwIfNoEntry: false })
    if (!stat || !stat.isDirectory() || !knownTargets.has(target)) {
      invalidTargets.push(target)
    }
  }

  return invalidTargets
}
