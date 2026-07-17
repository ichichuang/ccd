import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

export const SKILLS_LOCK_VERSION = 3
export const SKILL_ROUTING_MANIFEST = '.ai/manifests/skill-routing.json'
export const ROUTING_SCOPES_MANIFEST = '.ai/manifests/routing-scopes.json'
export const SKILL_ROOTS = [
  {
    id: 'codex',
    path: '.ai/skills/codex',
    layer: 'codex',
    discovery: 'immediate-child-directories',
    syncTargets: ['codex'],
    syncImplementations: ['codex-user-skills-v1'],
  },
  {
    id: 'core',
    path: '.ai/skills/core',
    layer: 'core',
    discovery: 'immediate-child-directories',
    syncTargets: ['codex'],
    syncImplementations: ['codex-user-skills-v1'],
  },
  {
    id: 'design',
    path: '.ai/skills/design',
    layer: 'design',
    discovery: 'immediate-child-directories',
    syncTargets: ['codex'],
    syncImplementations: ['codex-user-skills-v1'],
  },
]
export const PROJECT_UI = {
  id: 'project-ui',
  path: '.ai/skills/project-ui',
  layer: 'project',
  required: true,
  singleton: true,
  syncTargets: ['claude', 'codex'],
  syncImplementations: {
    claude: 'project-ui-claude-project-v1',
    codex: 'project-ui-codex-user-v1',
  },
}
export const PROJECT_UI_HASH_INVENTORY = Object.freeze([
  'SKILL.md',
  'references/accessibility.md',
  'references/component-priority.md',
  'references/interaction-motion.md',
  'references/layout-scroll.md',
  'references/page-archetypes.md',
  'references/platform-invariants.md',
  'references/product-language.md',
  'references/product-ui-profile.md',
  'references/tokens-unocss.md',
  'references/validation.md',
  'scripts/validate-semantic-quality.mjs',
])

const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdc',
  '.mjs',
  '.py',
  '.sh',
  '.ts',
  '.tsx',
  '.txt',
  '.vue',
  '.yaml',
  '.yml',
])
const TRANSIENT_DIRS = new Set(['__pycache__'])
const TRANSIENT_NAMES = new Set(['.DS_Store'])
const compareStrings = (left, right) =>
  Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'))
const toPosix = value => value.split(path.sep).join(path.posix.sep)
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex')

export class SkillLockError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'SkillLockError'
    this.code = code
    this.details = details
  }
}
const fail = (code, message, details = {}) => {
  throw new SkillLockError(code, message, details)
}
const runGit = (cwd, args) => {
  const result = spawnSync('git', args, { cwd, encoding: null, stdio: 'pipe' })
  if (result.error || result.status !== 0)
    fail('GIT_INDEX_READ_FAILED', 'git ' + args.join(' ') + ' failed', { status: result.status })
  return result.stdout
}
const isTransient = relPath => {
  const parts = relPath.split('/')
  return (
    parts.some(part => TRANSIENT_DIRS.has(part)) ||
    TRANSIENT_NAMES.has(parts.at(-1)) ||
    relPath.endsWith('.pyc')
  )
}
const normalizeMode = (mode, relPath) => {
  if (mode === '120000') fail('SOURCE_SYMLINK_ESCAPE', 'Tracked Skill symlink: ' + relPath)
  if (mode === '100755' || mode === '100644') return mode
  fail('UNSUPPORTED_SKILL_MODE', 'Unsupported tracked mode ' + mode + ': ' + relPath)
}
const assertNoSourceSymlink = (cwd, relPath) => {
  let current = path.resolve(cwd)
  for (const segment of relPath.split('/')) {
    current = path.join(current, segment)
    const stat = fs.lstatSync(current, { throwIfNoEntry: false })
    if (stat && stat.isSymbolicLink())
      fail('SOURCE_SYMLINK_ESCAPE', 'Skill source symlink: ' + relPath)
  }
}

export function trackedFileRecords(cwd) {
  const output = runGit(cwd, ['ls-files', '-s', '-z'])
  const records = []
  for (const raw of output.toString('utf8').split('\0')) {
    if (!raw) continue
    const match = raw.match(/^(\d{6}) ([a-f0-9]+) (\d)\t(.+)$/u)
    if (!match) fail('INVALID_GIT_INDEX_RECORD', 'Cannot parse Git index record')
    if (match[3] !== '0') fail('UNMERGED_SKILL_SOURCE', 'Unmerged tracked path: ' + match[4])
    records.push({ mode: match[1], objectId: match[2], path: toPosix(match[4]) })
  }
  return records.sort((left, right) => compareStrings(left.path, right.path))
}

export function normalizeTrackedContent(buffer, relPath) {
  const listedTextExtension = TEXT_EXTENSIONS.has(path.posix.extname(relPath).toLowerCase())
  if (!listedTextExtension && buffer.includes(0)) return { kind: 'binary', content: buffer }
  let text
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch (error) {
    fail('INVALID_UTF8_TEXT', 'Tracked text is not valid UTF-8: ' + relPath, {
      cause: String(error),
    })
  }
  return { kind: 'text', content: Buffer.from(text.replace(/\r\n/gu, '\n'), 'utf8') }
}

export function readNormalizedTrackedFile(cwd, record) {
  assertNoSourceSymlink(cwd, record.path)
  const absolute = path.join(cwd, record.path)
  const stat = fs.lstatSync(absolute, { throwIfNoEntry: false })
  if (!stat) fail('TRACKED_SKILL_FILE_MISSING', 'Tracked Skill file is missing: ' + record.path)
  if (!stat.isFile() || stat.isSymbolicLink())
    fail('INVALID_SKILL_FILE_TYPE', 'Invalid Skill source: ' + record.path)
  const normalized = normalizeTrackedContent(fs.readFileSync(absolute), record.path)
  return {
    mode: normalizeMode(record.mode, record.path),
    kind: normalized.kind,
    content: normalized.content,
  }
}

const describeSkill = (cwd, definition, id, relPath, records, syncTargets, syncImplementations) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) fail('INVALID_SKILL_ID', 'Invalid Skill ID: ' + id)
  const prefix = relPath + '/'
  const selected = records.filter(
    record => record.path.startsWith(prefix) && !isTransient(record.path)
  )
  if (!selected.some(record => record.path === relPath + '/SKILL.md'))
    fail('MISSING_SKILL_ENTRYPOINT', 'Missing SKILL.md: ' + relPath)
  const hash = crypto.createHash('sha256')
  const includedFiles = selected.map(record => {
    const relative = record.path.slice(prefix.length)
    const normalized = readNormalizedTrackedFile(cwd, record)
    hash.update(Buffer.from(relative, 'utf8'))
    hash.update('\0')
    hash.update(normalized.content)
    hash.update('\0')
    return {
      path: relative,
      mode: normalized.mode,
      kind: normalized.kind,
      size: normalized.content.length,
      sha256: sha256(normalized.content),
    }
  })
  const entrypoint = includedFiles.find(file => file.path === 'SKILL.md')
  const entrypointText = new TextDecoder('utf-8', { fatal: true }).decode(
    readNormalizedTrackedFile(
      cwd,
      selected.find(record => record.path === relPath + '/SKILL.md')
    ).content
  )
  const frontmatter = entrypointText.match(/^---\n([\s\S]*?)\n---(?:\n|$)/u)?.[1] ?? ''
  const declaredName = frontmatter.match(/^name:\s*([^\s]+)\s*$/mu)?.[1]
  if (!entrypoint || declaredName !== id)
    fail(
      'SKILL_FRONTMATTER_NAME_MISMATCH',
      'Skill frontmatter name does not match stable ID: ' + id
    )
  return {
    source: 'repo:' + relPath,
    sourceType: 'local',
    sourceFormat: 'directory',
    layer: definition.layer,
    kind: 'skill',
    syncTargets: [...syncTargets].sort(compareStrings),
    syncImplementations,
    includedFiles,
    excludedFiles: [],
    computedHash: hash.digest('hex'),
  }
}

export function scanSkillDirectories(cwd, { skillRoots = SKILL_ROOTS } = {}) {
  const records = trackedFileRecords(cwd)
  const discovered = []
  for (const definition of skillRoots) {
    const prefix = definition.path + '/'
    const ids = new Set()
    for (const record of records) {
      if (!record.path.startsWith(prefix)) continue
      const remainder = record.path.slice(prefix.length)
      const parts = remainder.split('/')
      if (parts.length === 2 && parts[1] === 'SKILL.md') ids.add(parts[0])
    }
    for (const id of [...ids].sort(compareStrings))
      discovered.push({ definition, id, relPath: definition.path + '/' + id })
  }
  if (records.some(record => record.path === PROJECT_UI.path + '/SKILL.md'))
    discovered.push({ definition: PROJECT_UI, id: PROJECT_UI.id, relPath: PROJECT_UI.path })
  const seen = new Map()
  for (const item of discovered.sort((left, right) => compareStrings(left.id, right.id))) {
    if (seen.has(item.id))
      fail(
        item.id === 'project-ui' ? 'DUPLICATE_PROJECT_UI_SINGLETON' : 'DUPLICATE_SKILL_ID',
        'Duplicate Skill ID: ' + item.id,
        { first: seen.get(item.id), second: item.relPath }
      )
    seen.set(item.id, item.relPath)
  }
  return discovered
}

const manifestDescriptor = (cwd, relPath) => {
  const absolute = path.join(cwd, relPath)
  const stat = fs.lstatSync(absolute, { throwIfNoEntry: false })
  if (!stat || !stat.isFile() || stat.isSymbolicLink())
    fail('MISSING_ROUTING_MANIFEST', 'Missing manifest: ' + relPath)
  const normalized = normalizeTrackedContent(fs.readFileSync(absolute), relPath)
  const mode = stat.mode & 0o111 ? '100755' : '100644'
  return {
    source: 'repo:' + relPath,
    sourceType: 'local',
    sourceFormat: 'file',
    kind: 'manifest',
    includedFiles: [
      {
        path: path.posix.basename(relPath),
        mode,
        kind: normalized.kind,
        size: normalized.content.length,
        sha256: sha256(normalized.content),
      },
    ],
    computedHash: sha256(normalized.content),
  }
}

export function generateSkillsLock(cwd, options = {}) {
  const records = trackedFileRecords(cwd)
  const skills = {}
  for (const item of scanSkillDirectories(cwd, options)) {
    const isProjectUi = item.id === PROJECT_UI.id
    const targets = isProjectUi ? PROJECT_UI.syncTargets : item.definition.syncTargets
    const implementations = isProjectUi
      ? PROJECT_UI.syncImplementations
      : { codex: 'codex-user-skills-v1' }
    skills[item.id] = describeSkill(
      cwd,
      item.definition,
      item.id,
      item.relPath,
      records,
      targets,
      implementations
    )
  }
  if (!skills['project-ui'])
    fail('MISSING_PROJECT_UI_LOCK', 'project-ui must be discovered exactly once')
  const projectUiPaths = skills['project-ui'].includedFiles.map(file => file.path)
  if (JSON.stringify(projectUiPaths) !== JSON.stringify(PROJECT_UI_HASH_INVENTORY))
    fail(
      'PROJECT_UI_FILE_INVENTORY_DRIFT',
      'project-ui tracked file inventory differs from the frozen twelve-path contract'
    )
  return {
    version: 3,
    generatedBy: 'scripts/skill-lock-utils.mjs',
    hashPolicy: {
      algorithm: 'sha256',
      pathEncoding: 'utf8',
      pathSeparator: '/',
      entryFraming: 'path+NUL+bytes+NUL',
      textDetection: 'listed-extension-or-no-NUL-byte',
      textNormalization: 'utf8-crlf-to-lf-preserve-final-newline',
      binaryNormalization: 'identity',
      excludedDirectories: ['__pycache__'],
      excludedSuffixes: ['.pyc'],
      symlinkPolicy: 'reject',
    },
    roots: SKILL_ROOTS,
    projectUi: PROJECT_UI,
    skills: Object.fromEntries(
      Object.entries(skills).sort(([left], [right]) => compareStrings(left, right))
    ),
    manifests: {
      'routing-scopes': manifestDescriptor(cwd, ROUTING_SCOPES_MANIFEST),
      'skill-routing': manifestDescriptor(cwd, SKILL_ROUTING_MANIFEST),
    },
  }
}

export const stringifySkillsLock = lock => JSON.stringify(lock, null, 2) + '\n'
export const readSkillRoutingManifest = cwd =>
  JSON.parse(fs.readFileSync(path.join(cwd, SKILL_ROUTING_MANIFEST), 'utf8'))
export const collectRouteSkillTargets = routing =>
  [
    ...new Set([
      ...(routing.fallback?.primarySkills ?? []),
      ...(routing.fallback?.supplementalSkills ?? []),
      ...(routing.routes ?? []).flatMap(route => [
        ...(route.primarySkills ?? []),
        ...(route.supplementalSkills ?? []),
      ]),
    ]),
  ].sort(compareStrings)

export function validateSkillRoutingTargets(cwd, { lock = null } = {}) {
  const routing = readSkillRoutingManifest(cwd)
  const skillsLock = lock ?? generateSkillsLock(cwd)
  const known = new Set(Object.keys(skillsLock.skills))
  return collectRouteSkillTargets(routing).filter(skillId => !known.has(skillId))
}

export function skillSourcePath(cwd, entry) {
  if (typeof entry?.source !== 'string' || !entry.source.startsWith('repo:'))
    fail('INVALID_SKILL_SOURCE', 'Unsupported Skill source')
  const relative = entry.source.slice(5)
  if (
    !relative ||
    path.posix.isAbsolute(relative) ||
    relative.includes('\\') ||
    relative.split('/').some(segment => segment === '.' || segment === '..')
  )
    fail('SOURCE_PATH_ESCAPE', 'Invalid Skill source: ' + entry.source)
  const root = path.resolve(cwd)
  const absolute = path.resolve(cwd, relative)
  if (absolute === root || !absolute.startsWith(root + path.sep))
    fail('SOURCE_PATH_ESCAPE', 'Skill source escapes repository: ' + entry.source)
  assertNoSourceSymlink(cwd, relative)
  return absolute
}
