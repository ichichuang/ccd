import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PluginOption } from 'vite'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const PROJECT_CONFIG_PATH = join(REPO_ROOT, 'project.config.json')

type DesktopHtmlMetadata = {
  desktopProductName: string
  description: string
  author: string
  packageName: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireStringField(
  source: Record<string, unknown>,
  field: keyof DesktopHtmlMetadata
): string {
  const value = source[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`project.config.json product.${field} must be a non-empty string`)
  }
  return value
}

function readDesktopHtmlMetadata(): DesktopHtmlMetadata {
  const config: unknown = JSON.parse(readFileSync(PROJECT_CONFIG_PATH, 'utf-8'))
  if (!isRecord(config) || !isRecord(config.product)) {
    throw new Error('project.config.json product metadata is required for desktop HTML injection')
  }

  return {
    desktopProductName: requireStringField(config.product, 'desktopProductName'),
    description: requireStringField(config.product, 'description'),
    author: requireStringField(config.product, 'author'),
    packageName: requireStringField(config.product, 'packageName'),
  }
}

function escapeHtmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtmlText(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function createDesktopHtmlPlugin(): PluginOption {
  return {
    name: 'vite:desktop-html-metadata',
    transformIndexHtml(html: string) {
      const metadata = readDesktopHtmlMetadata()

      return html
        .replace(/%DESKTOP_PRODUCT_NAME%/g, escapeHtmlText(metadata.desktopProductName))
        .replace(/%PRODUCT_DESCRIPTION%/g, escapeHtmlAttribute(metadata.description))
        .replace(/%PRODUCT_AUTHOR%/g, escapeHtmlAttribute(metadata.author))
        .replace(/%PRODUCT_PACKAGE_NAME%/g, escapeHtmlAttribute(metadata.packageName))
    },
  }
}
