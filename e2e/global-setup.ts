import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { chromium, type FullConfig, type Page } from '@playwright/test'
import { AUTH_STORAGE_STATE_PATH } from './helpers/authState'

function getBaseURL(config: FullConfig): string {
  const project = config.projects.find(candidate => candidate.name === 'chromium')
  const baseURL = project?.use.baseURL ?? config.projects[0]?.use.baseURL
  return typeof baseURL === 'string' ? baseURL : 'http://127.0.0.1:8088'
}

async function waitForAppIdle(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true')
  await page
    .waitForFunction(() => document.documentElement.dataset.runtimeLoading === 'false', null, {
      timeout: 30000,
    })
    .catch(() => undefined)
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || undefined,
    headless: true,
  })
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    colorScheme: 'light',
    locale: 'zh-CN',
  })

  try {
    const baseURL = getBaseURL(config)
    await page.goto(`${baseURL}/?e2e=visual#/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
    await waitForAppIdle(page)
    await page.locator('#username').fill('admin')
    await page.locator('#password').fill('123456')
    await page.locator('#login-submit').click()
    await page.waitForURL(/#\/dashboard$/, { timeout: 30000 })
    await waitForAppIdle(page)
    await page.locator('#dashboard-page').waitFor({ state: 'visible', timeout: 30000 })
    await mkdir(dirname(AUTH_STORAGE_STATE_PATH), { recursive: true })
    await page.context().storageState({ path: AUTH_STORAGE_STATE_PATH })
    await page.locator('#dashboard-start-exploring').click()
    await page.waitForURL(/#\/showcase\/overview$/, { timeout: 30000 })
    await waitForAppIdle(page)
  } finally {
    await browser.close()
  }
}
