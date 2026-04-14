import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const force = process.argv.includes('--force')

const adapters = [
  { linkPath: '.cursor/rules', target: '../.ai/rules' },
  { linkPath: '.cursor/skills', target: '../.ai/skills/cursor' },
  { linkPath: '.claude/skills', target: '../.ai/skills/claude' },
  { linkPath: 'repair_list.txt', target: '.ai/runtime/repair_list.txt' },
  { linkPath: 'skills-lock.json', target: '.ai/manifests/skills-lock.json' },
]

const ensureDir = p => fs.mkdirSync(path.dirname(path.join(cwd, p)), { recursive: true })

const ensureSymlink = ({ linkPath, target }) => {
  const absLink = path.join(cwd, linkPath)
  ensureDir(linkPath)

  if (fs.existsSync(absLink) || fs.lstatSync(absLink, { throwIfNoEntry: false })) {
    const st = fs.lstatSync(absLink)
    if (st.isSymbolicLink()) {
      const current = fs.readlinkSync(absLink)
      if (current === target) {
        console.log(`[OK] ${linkPath} -> ${target}`)
        return
      }
      if (!force) {
        console.log(`[WARN] ${linkPath} points to ${current}, expected ${target}. Use --force to fix.`)
        return
      }
      fs.rmSync(absLink, { force: true })
    } else {
      if (!force) {
        console.log(`[WARN] ${linkPath} exists and is not a symlink. Use --force to replace.`)
        return
      }
      fs.rmSync(absLink, { recursive: true, force: true })
    }
  }

  fs.symlinkSync(target, absLink)
  console.log(`[FIXED] ${linkPath} -> ${target}`)
}

console.log('AI adapter sync')
console.log('===============')
for (const adapter of adapters) {
  ensureSymlink(adapter)
}
