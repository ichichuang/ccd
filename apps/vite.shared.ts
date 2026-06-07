import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import type { CorsOptions } from 'vite'

export const localViteHost = '127.0.0.1'
export const localViteCors: CorsOptions = {
  origin: [
    /^https?:\/\/localhost(?::\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
    /^https?:\/\/\[::1\](?::\d+)?$/,
  ],
}

export function resolveAppRoot(metaUrl: string): string {
  return dirname(fileURLToPath(metaUrl))
}

export function resolveRepoRoot(appRoot: string): string {
  return resolve(appRoot, '../..')
}

export function loadAppViteEnv(mode: string, appRoot: string): Record<string, string> {
  return {
    ...loadEnv(mode, resolveRepoRoot(appRoot), 'VITE_'),
    ...loadEnv(mode, appRoot, 'VITE_'),
  }
}

export function resolveVitePort(rawPort: string | undefined, key: string): number {
  const port = Number(rawPort)

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`${key} must be an integer between 1 and 65535`)
  }

  return port
}
