#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import { patterns, readPolicy } from '../governance/policy-utils.mjs'

const root = process.cwd()
const runtimePolicy = readPolicy('runtime')
const scanRoots = runtimePolicy.runtimeNeutralScanRoots
const forbiddenIdentifiers = new Set(runtimePolicy.forbiddenIdentifiers)
const forbiddenCalls = new Set(runtimePolicy.forbiddenCalls)
const forbiddenPropertyRoots = new Set(runtimePolicy.forbiddenPropertyRoots)
const forbiddenImports = patterns(runtimePolicy.forbiddenImports)
const findings = []

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'dist' ? [] : walk(absolute)
    return /\.ts$/.test(entry.name) ? [absolute] : []
  })
}

function report(file, node, message) {
  const source = node.getSourceFile()
  const pos = source.getLineAndCharacterOfPosition(node.getStart(source))
  findings.push(`${relative(root, file)}:${pos.line + 1}:${pos.character + 1} ${message}`)
}

function isDeclarationName(node) {
  const parent = node.parent
  return (
    (ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) && parent.name === node
  )
}

function scan(file) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier
      if (ts.isStringLiteral(specifier) && forbiddenImports.some(pattern => pattern.test(specifier.text))) {
        report(file, specifier, `forbidden runtime import "${specifier.text}"`)
      }
    }

    if (ts.isIdentifier(node) && !isDeclarationName(node)) {
      if (forbiddenIdentifiers.has(node.text)) report(file, node, `forbidden runtime global "${node.text}"`)
    }

    if (ts.isCallExpression(node)) {
      const expression = node.expression
      if (ts.isIdentifier(expression) && forbiddenCalls.has(expression.text)) {
        report(file, expression, `forbidden runtime call "${expression.text}()"`)
      }
    }

    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      if (forbiddenPropertyRoots.has(node.expression.text)) {
        report(file, node.expression, `forbidden runtime global "${node.expression.text}"`)
      }
    }

    ts.forEachChild(node, visit)
  }
  visit(source)
}

for (const scanRoot of scanRoots) {
  for (const file of walk(join(root, scanRoot))) scan(file)
}

if (findings.length > 0) {
  console.error('Runtime leak validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Runtime leak validation passed.')
