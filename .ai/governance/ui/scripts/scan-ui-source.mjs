#!/usr/bin/env node
import process from 'node:process'
import { main } from '../source-scanner/cli.mjs'

process.exitCode = await main()
