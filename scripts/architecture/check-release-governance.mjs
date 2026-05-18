#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { readPolicies, workspacePackages } from '../governance/policy-utils.mjs'

const root = process.cwd()
const { release, topology } = readPolicies('release', 'topology')
const findings = []

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

if (!existsSync(join(root, release.changesetConfig))) {
  findings.push(`${release.changesetConfig}: changeset configuration is required`)
}

const packages = workspacePackages(topology)
const packageNames = packages.map(item => item.name)
const unknownReleasePackages = release.releaseOrder.filter(name => !packageNames.includes(name))
for (const packageName of unknownReleasePackages) {
  findings.push(`releaseOrder references unknown package: ${packageName}`)
}

const topologyOrder = topology.releaseOrder.join(' -> ')
const releaseOrder = release.releaseOrder.join(' -> ')
if (releaseOrder !== topologyOrder) {
  findings.push(`release order must match topology: ${topologyOrder}`)
}

for (const packageInfo of packages) {
  const manifest = readJson(`${packageInfo.path}/package.json`)
  if (manifest.name !== packageInfo.name) {
    findings.push(`${packageInfo.path}/package.json: manifest name must be ${packageInfo.name}`)
  }
  if (packageInfo.publicApi && !manifest.exports?.['.']) {
    findings.push(`${packageInfo.path}/package.json: public package must expose explicit root export`)
  }
}

for (const criticalPackage of release.criticalPackages) {
  const packageInfo = packages.find(item => item.name === criticalPackage)
  if (!packageInfo) continue
  const manifest = readJson(`${packageInfo.path}/package.json`)
  if (manifest.private !== true) {
    findings.push(`${packageInfo.path}/package.json: critical packages must remain private until publication governance is explicit`)
  }
}

if (findings.length > 0) {
  console.error('Release governance validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Release governance validation passed.')
