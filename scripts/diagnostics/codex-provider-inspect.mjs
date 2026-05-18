#!/usr/bin/env node
import { codexTransportAlignment } from '../runtime/execution-utils.mjs'

const alignment = codexTransportAlignment()
const data = {
  providerIdentity: alignment.provider,
  codexConfigProvider: alignment.transport,
  executeTransport: alignment.transport ?? 'unresolved',
  expectedTransport: alignment.expectedTransport,
  transportAligned: alignment.aligned,
  timestamp: new Date().toISOString(),
}
console.log(JSON.stringify(data, null, 2))
