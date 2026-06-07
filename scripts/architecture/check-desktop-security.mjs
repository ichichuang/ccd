#!/usr/bin/env node
import process from 'node:process'
import {
  loadDesktopSecurityInputs,
  validateDesktopSecurity,
} from './desktop-security-rules.mjs'

const findings = validateDesktopSecurity(loadDesktopSecurityInputs(process.cwd()))

if (findings.length > 0) {
  console.error('Desktop security validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Desktop security validation passed.')
