#!/usr/bin/env node
import { cacheStats } from '../runtime/execution-utils.mjs'

console.log(JSON.stringify({ cacheSource: cacheStats(), timestamp: new Date().toISOString() }, null, 2))
