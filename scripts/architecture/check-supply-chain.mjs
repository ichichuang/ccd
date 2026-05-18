#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { readPolicies, workspacePackages } from '../governance/policy-utils.mjs'

const root = process.cwd()
const policies = readPolicies('supply-chain', 'topology')
const supplyPolicy = policies['supply-chain']
const { topology } = policies
const governedPackages = workspacePackages(topology)
const findings = []

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

for (const packageInfo of governedPackages) {
  const packageDir = packageInfo.path
  const manifestPath = join(root, packageDir, 'package.json')
  const manifest = readJson(manifestPath)
  for (const scriptName of supplyPolicy.forbiddenLifecycleScripts) {
    if (manifest.scripts?.[scriptName]) findings.push(`${packageDir}: lifecycle script "${scriptName}" is forbidden`)
  }
  const allowedRuntimeDeps = new Set(supplyPolicy.allowedRuntimeDependencies[manifest.name] ?? [])
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    if (!allowedRuntimeDeps.has(dependency)) findings.push(`${packageDir}: unapproved runtime dependency "${dependency}"`)
  }
}

const rootManifest = readJson(join(root, 'package.json'))
for (const scriptName of supplyPolicy.forbiddenLifecycleScripts) {
  if (rootManifest.scripts?.[scriptName]) findings.push(`package.json: lifecycle script "${scriptName}" is forbidden`)
}

const runtimeOwners = new Map()
for (const packageInfo of governedPackages) {
  const packageDir = packageInfo.path
  const manifest = readJson(join(root, packageDir, 'package.json'))
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    if (supplyPolicy.singletonRuntimeDependencies.includes(dependency)) {
      const owners = runtimeOwners.get(dependency) ?? []
      owners.push(manifest.name)
      runtimeOwners.set(dependency, owners)
    }
  }
}

mkdirSync(dirname(join(root, 'docs/generated/sbom.json')), { recursive: true })
writeFileSync(
  join(root, 'docs/generated/sbom.json'),
  `${JSON.stringify({ schemaVersion: 1, generatedBy: 'scripts/architecture/check-supply-chain.mjs', policyVersion: readJson(join(root, '.ai/governance/policies/version.json')).policyVersion, packages: governedPackages.map(packageInfo => readJson(join(root, packageInfo.path, 'package.json'))) }, null, 2)}\n`
)

if (findings.length > 0) {
  console.error('Supply chain validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Supply chain validation passed.')
