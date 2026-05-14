import type { Page, Request, Response } from '@playwright/test'
import { expect } from '@playwright/test'

const E2E_VISUAL_QUERY = 'e2e=visual'
const E2E_PRELOADER_HOLD_QUERY = 'e2eHoldPreloader=1'

export function withVisualMode(hashPath: string, options?: { holdPreloader?: boolean }): string {
  const query = options?.holdPreloader
    ? `${E2E_VISUAL_QUERY}&${E2E_PRELOADER_HOLD_QUERY}`
    : E2E_VISUAL_QUERY
  return `/?${query}#${hashPath.startsWith('/') ? hashPath : `/${hashPath}`}`
}

function normalizeHashPath(hashPath: string): string {
  return hashPath.startsWith('/') ? hashPath : `/${hashPath}`
}

export async function gotoVisual(page: Page, hashPath: string): Promise<void> {
  await page.goto(withVisualMode(hashPath))
  await page.waitForFunction(
    path => window.location.hash === `#${path}` || window.location.hash === '#/404',
    normalizeHashPath(hashPath)
  )
}

export async function gotoVisualFirstPaint(page: Page, hashPath: string): Promise<void> {
  await page.goto(withVisualMode(hashPath, { holdPreloader: true }), {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForFunction(() => document.documentElement.dataset.preloaderState === 'held')
}

export async function releasePreloader(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('ccd:release-preloader'))
  })
}

export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true')
  await expect(page.locator('#app-shell')).toBeVisible()
}

export async function waitForRuntimeLoadingIdle(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.runtimeLoading === 'false')
  await expect(page.locator('#runtime-loading-overlay')).toBeHidden()
}

export async function waitForThemeTransitionEnd(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.themeTransitioning !== 'true')
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await gotoVisual(page, '/login')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('#username')).toBeVisible({ timeout: 15000 })
  await page.locator('#username').fill('admin')
  await page.locator('#password').fill('123456')
  const submit = page.locator('#login-submit')
  await expect(submit).toBeEnabled()
  await submit.click()
  await expect(page).toHaveURL(/#\/dashboard$/, { timeout: 30000 })
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('#dashboard-page')).toBeVisible({ timeout: 15000 })
}

export interface NetworkFailureRecord {
  kind: 'requestfailed' | 'response'
  method: string
  status: number | null
  url: string
  failureText: string | null
}

export interface NetworkFailureCollector {
  getFailures: () => NetworkFailureRecord[]
  dispose: () => void
}

function shouldIgnoreNetworkUrl(url: string): boolean {
  return url.startsWith('data:') || url.startsWith('blob:')
}

export function createNetworkFailureCollector(page: Page): NetworkFailureCollector {
  const failures: NetworkFailureRecord[] = []
  const seen = new Set<string>()

  const pushFailure = (entry: NetworkFailureRecord): void => {
    const key = `${entry.kind}|${entry.method}|${entry.status ?? 'x'}|${entry.url}|${entry.failureText ?? ''}`
    if (seen.has(key)) return
    seen.add(key)
    failures.push(entry)
  }

  const onRequestFailed = (request: Request): void => {
    const url = request.url()
    if (shouldIgnoreNetworkUrl(url)) return
    pushFailure({
      kind: 'requestfailed',
      method: request.method(),
      status: null,
      url,
      failureText: request.failure()?.errorText ?? null,
    })
  }

  const onResponse = (response: Response): void => {
    const status = response.status()
    const url = response.url()
    if (status < 400 || shouldIgnoreNetworkUrl(url)) return
    pushFailure({
      kind: 'response',
      method: response.request().method(),
      status,
      url,
      failureText: null,
    })
  }

  page.on('requestfailed', onRequestFailed)
  page.on('response', onResponse)

  return {
    getFailures: () => [...failures],
    dispose: () => {
      page.off('requestfailed', onRequestFailed)
      page.off('response', onResponse)
    },
  }
}
