#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()

export function readJsonFile(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

export function readPolicy(name) {
  return readJsonFile(`.ai/governance/policies/${name}.json`)
}

export function readPolicies(...names) {
  return Object.fromEntries(names.map(name => [name, readPolicy(name)]))
}

export function workspacePackages(topology = readPolicy('topology')) {
  return topology.packages
}

export function packageByName(name, topology = readPolicy('topology')) {
  return topology.packages.find(item => item.name === name)
}

export function patterns(values) {
  return values.map(value => new RegExp(value))
}
