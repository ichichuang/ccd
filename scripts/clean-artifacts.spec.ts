import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

type CleanArtifactsModule = {
  cleanPaths: (paths: string[], options?: { root?: string; cwd?: string }) => void
  cleanWorkspaceBuildArtifacts: (root?: string) => void
}

const { cleanPaths, cleanWorkspaceBuildArtifacts } = (await import(
  new URL('./clean-artifacts.mjs', import.meta.url).href
)) as CleanArtifactsModule

const tempRoots: string[] = []

function createTempRoot() {
  const root = join(tmpdir(), `ccd-clean-artifacts-${process.pid}-${tempRoots.length}`)
  rmSync(root, { recursive: true, force: true })
  mkdirSync(root, { recursive: true })
  tempRoots.push(root)
  return root
}

function touch(path: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, 'artifact', 'utf-8')
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('clean-artifacts', () => {
  it('removes explicit paths relative to the provided cwd', () => {
    const root = createTempRoot()
    const packageDir = join(root, 'packages/example')
    const distFile = join(packageDir, 'dist/index.js')
    const tmpFile = join(root, 'node_modules/.tmp/example.tsbuildinfo')
    touch(distFile)
    touch(tmpFile)

    cleanPaths(['dist', '../../node_modules/.tmp/example.tsbuildinfo'], {
      root,
      cwd: packageDir,
    })

    expect(existsSync(join(packageDir, 'dist'))).toBe(false)
    expect(existsSync(tmpFile)).toBe(false)
  })

  it('removes workspace build artifacts without deleting unrelated files', () => {
    const root = createTempRoot()
    const appDist = join(root, 'apps/web-demo/dist/index.html')
    const packageDist = join(root, 'packages/core/dist/index.js')
    const tmpFile = join(root, 'node_modules/.tmp/core.tsbuildinfo')
    const sourceFile = join(root, 'packages/core/src/index.ts')
    touch(appDist)
    touch(packageDist)
    touch(tmpFile)
    touch(sourceFile)

    cleanWorkspaceBuildArtifacts(root)

    expect(existsSync(join(root, 'apps/web-demo/dist'))).toBe(false)
    expect(existsSync(join(root, 'packages/core/dist'))).toBe(false)
    expect(existsSync(join(root, 'node_modules/.tmp'))).toBe(false)
    expect(existsSync(sourceFile)).toBe(true)
  })

  it('rejects paths outside the repository root', () => {
    const root = createTempRoot()
    const packageDir = join(root, 'packages/example')
    mkdirSync(packageDir, { recursive: true })

    expect(() =>
      cleanPaths(['../../../outside-artifact'], {
        root,
        cwd: packageDir,
      })
    ).toThrow(/outside repository root/)
  })
})
