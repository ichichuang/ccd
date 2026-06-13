import { expect, test, type Page } from '@playwright/test'
import {
  loginAsAdmin,
  releasePreloader,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

declare global {
  interface Window {
    ccdTitleProbe: string[]
  }

  interface Element {
    __vue_app__?: {
      config: {
        globalProperties: {
          $pinia?: {
            _s: Map<
              string,
              {
                beginPageLoading: () => void
                endPageLoading: () => void
                beginGlobalLoading: () => void
                endGlobalLoading: () => void
              }
            >
          }
        }
      }
    }
  }
}

interface DOMRectJSON {
  x: number
  y: number
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

interface PageLoadingOverlayGeometry {
  overlay: DOMRectJSON
  container: DOMRectJSON
  spinner: DOMRectJSON
}

interface RoutePageLoadingObservation {
  sawLocalOverlayVisible: boolean
  sawLoadingContentVisible: boolean
  sawRuntimeOverlayVisible: boolean
  sawLocalPureCssLoaderVisible: boolean
  finalHash: string
  routeRendered: boolean
  sampleCount: number
  elapsedMs: number
}

interface RoutePageLoadingObservationOptions {
  targetHash: string
  routeHeading: string
  timeoutMs: number
}

interface OverlaySpinnerGeometry {
  overlay: DOMRectJSON
  spinner: DOMRectJSON
  viewport: { width: number; height: number }
}

interface LayoutGeometry {
  mode: string
  sidebarMode: string
  drawerMode: string
  viewport: { width: number; height: number }
  safeArea: { top: number; right: number; bottom: number; left: number }
  shell: DOMRectJSON
  header: DOMRectJSON
  content: DOMRectJSON
  sidebar: DOMRectJSON | null
  drawerRoot: DOMRectJSON | null
  drawer: DOMRectJSON | null
  drawerMask: DOMRectJSON | null
  drawerPadding: { top: number; right: number; bottom: number; left: number } | null
  headerHeightVar: number
  sidebarWidthVar: number
  shellPadding: { top: number; right: number; bottom: number; left: number }
}

const IPHONE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const IPAD_OS_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

const APP_CONTAINER_SCROLL_VIEWPORT_SELECTOR =
  '.c-scrollbar.col-fill [data-overlayscrollbars-viewport]'

async function openDashboard(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem('ccd-e2e-mode', 'visual')
  })
  await loginAsAdmin(page)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('[data-layout-shell="admin"]')).toBeVisible()
}

async function installIPadRuntimeHints(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    })
  })
}

async function installTitleProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem('ccd-e2e-mode', 'visual')
    window.ccdTitleProbe = []
    const recordTitle = (): void => {
      window.ccdTitleProbe.push(document.title)
    }
    recordTitle()
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title')
    if (!descriptor?.get || !descriptor?.set) return
    Object.defineProperty(document, 'title', {
      configurable: true,
      get() {
        return descriptor.get.call(document)
      },
      set(value: string) {
        descriptor.set.call(document, value)
        recordTitle()
      },
    })
  })
}

async function expectPageLoadingOverlayCentered(page: Page): Promise<void> {
  const stopLoading = await page.evaluateHandle(() => {
    const app = document.querySelector('#app')
    const pinia = app?.__vue_app__?.config.globalProperties.$pinia
    const layoutStore = pinia?._s.get('layout')
    if (!layoutStore) throw new Error('Layout store was not found.')
    layoutStore.beginPageLoading()
    return () => layoutStore.endPageLoading()
  })

  try {
    const overlayLocator = page.locator('.page-loading-overlay-content')
    await expect(overlayLocator).toBeVisible()
    await expect(page.locator('#runtime-loading-overlay')).toBeHidden()
    await expect(overlayLocator.locator('.pure-css-loader')).toBeHidden()
    await expect(
      overlayLocator.locator('.loading-fallback-spinner, [data-loading-animation="paper-airplane"]')
    ).toBeVisible()
    await expect(overlayLocator.locator('.base-lottie-loader').first()).toBeVisible({
      timeout: 10000,
    })

    const geometry = await page.evaluate((): PageLoadingOverlayGeometry => {
      const roundRect = (rect: DOMRect): DOMRectJSON => ({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
      })
      const overlay = document.querySelector('.page-loading-overlay-content')
      const container = overlay?.parentElement
      const spinner =
        overlay?.querySelector('.base-lottie-loader') ??
        overlay?.querySelector('[role="status"]') ??
        overlay?.firstElementChild
      if (!overlay || !container || !spinner) {
        throw new Error('Expected page loading overlay, container, and spinner.')
      }
      return {
        overlay: roundRect(overlay.getBoundingClientRect()),
        container: roundRect(container.getBoundingClientRect()),
        spinner: roundRect(spinner.getBoundingClientRect()),
      }
    })

    expect(Math.abs(geometry.overlay.left - geometry.container.left)).toBeLessThanOrEqual(2)
    expect(Math.abs(geometry.overlay.top - geometry.container.top)).toBeLessThanOrEqual(2)
    expect(Math.abs(geometry.overlay.width - geometry.container.width)).toBeLessThanOrEqual(2)
    expect(Math.abs(geometry.overlay.height - geometry.container.height)).toBeLessThanOrEqual(2)

    const overlayCenterX = geometry.overlay.left + geometry.overlay.width / 2
    const overlayCenterY = geometry.overlay.top + geometry.overlay.height / 2
    const spinnerCenterX = geometry.spinner.left + geometry.spinner.width / 2
    const spinnerCenterY = geometry.spinner.top + geometry.spinner.height / 2
    expect(Math.abs(spinnerCenterX - overlayCenterX)).toBeLessThanOrEqual(2)
    expect(Math.abs(spinnerCenterY - overlayCenterY)).toBeLessThanOrEqual(2)
  } finally {
    await stopLoading.evaluate(stop => stop())
    await stopLoading.dispose()
    await expect(page.locator('.page-loading-overlay-content')).toBeHidden()
  }
}

async function observeRoutePageLoadingOutlet(
  page: Page,
  options: Omit<RoutePageLoadingObservationOptions, 'timeoutMs'> & { timeoutMs?: number }
): Promise<RoutePageLoadingObservation> {
  return page.evaluate<RoutePageLoadingObservation, RoutePageLoadingObservationOptions>(
    ({ targetHash, routeHeading, timeoutMs }) =>
      new Promise<RoutePageLoadingObservation>(resolve => {
        const startedAt = performance.now()
        const observation: RoutePageLoadingObservation = {
          sawLocalOverlayVisible: false,
          sawLoadingContentVisible: false,
          sawRuntimeOverlayVisible: false,
          sawLocalPureCssLoaderVisible: false,
          finalHash: window.location.hash,
          routeRendered: false,
          sampleCount: 0,
          elapsedMs: 0,
        }
        let frameId: number | null = null
        let settled = false
        let observer: MutationObserver | null = null

        const isElementVisible = (element: Element | null): boolean => {
          if (!element) return false
          const rect = element.getBoundingClientRect()
          if (rect.width <= 0 || rect.height <= 0) return false
          const style = window.getComputedStyle(element)
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
        }

        const isRouteRendered = (): boolean => {
          if (window.location.hash !== targetHash) return false
          return Array.from(document.querySelectorAll('h1')).some(
            heading => heading.textContent?.trim() === routeHeading
          )
        }

        const finish = (): void => {
          if (settled) return
          settled = true
          if (frameId !== null) cancelAnimationFrame(frameId)
          observer?.disconnect()
          observation.finalHash = window.location.hash
          observation.routeRendered = isRouteRendered()
          observation.elapsedMs = Math.round(performance.now() - startedAt)
          resolve({ ...observation })
        }

        const sample = (): void => {
          if (settled) return
          const localOverlay = document.querySelector('.page-loading-overlay-content')
          const loadingContent =
            localOverlay?.querySelector(
              '.loading-fallback-spinner, [data-loading-animation="paper-airplane"]'
            ) ?? null
          const localPureCssLoader = localOverlay?.querySelector('.pure-css-loader') ?? null
          const runtimeOverlay = document.querySelector('#runtime-loading-overlay')
          const localOverlayVisible = isElementVisible(localOverlay)

          observation.sampleCount += 1
          observation.elapsedMs = Math.round(performance.now() - startedAt)
          observation.finalHash = window.location.hash
          observation.routeRendered = isRouteRendered()
          observation.sawLocalOverlayVisible ||= localOverlayVisible
          observation.sawLoadingContentVisible ||= isElementVisible(loadingContent)
          observation.sawRuntimeOverlayVisible ||= isElementVisible(runtimeOverlay)
          observation.sawLocalPureCssLoaderVisible ||= isElementVisible(localPureCssLoader)

          const provedLocalLoading =
            observation.finalHash === targetHash &&
            observation.sawLocalOverlayVisible &&
            observation.sawLoadingContentVisible
          const settledWithoutProof =
            observation.routeRendered && !localOverlayVisible && observation.elapsedMs >= 750

          if (provedLocalLoading || settledWithoutProof || observation.elapsedMs >= timeoutMs) {
            finish()
          }
        }

        const scheduleNextSample = (): void => {
          if (settled || frameId !== null) return
          frameId = requestAnimationFrame(() => {
            frameId = null
            sample()
            scheduleNextSample()
          })
        }

        observer = new MutationObserver(sample)
        observer.observe(document.documentElement, {
          attributes: true,
          childList: true,
          subtree: true,
        })
        sample()
        scheduleNextSample()
        window.location.hash = targetHash
        sample()
      }),
    { timeoutMs: options.timeoutMs ?? 10000, ...options }
  )
}

async function expectNativePreloaderCentered(page: Page): Promise<void> {
  await page.goto(withVisualMode('/dashboard', { holdPreloader: true }), {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForFunction(() => document.documentElement.dataset.preloaderState === 'held')
  await expect(page.locator('#preloader-bg')).toBeVisible()

  const geometry = await page.evaluate((): OverlaySpinnerGeometry => {
    const roundRect = (rect: DOMRect): DOMRectJSON => ({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      left: Math.round(rect.left),
    })
    const overlay = document.querySelector('#preloader-bg')
    const spinner = overlay?.querySelector('.pure-css-loader')
    if (!overlay || !spinner) throw new Error('Expected native preloader and spinner.')
    return {
      overlay: roundRect(overlay.getBoundingClientRect()),
      spinner: roundRect(spinner.getBoundingClientRect()),
      viewport: { width: window.innerWidth, height: window.innerHeight },
    }
  })

  expect(geometry.overlay.left).toBeLessThanOrEqual(1)
  expect(geometry.overlay.top).toBeLessThanOrEqual(1)
  expect(geometry.overlay.width).toBeGreaterThanOrEqual(geometry.viewport.width - 1)
  expect(geometry.overlay.height).toBeGreaterThanOrEqual(geometry.viewport.height - 1)

  const spinnerCenterX = geometry.spinner.left + geometry.spinner.width / 2
  const spinnerCenterY = geometry.spinner.top + geometry.spinner.height / 2
  expect(Math.abs(spinnerCenterX - geometry.viewport.width / 2)).toBeLessThanOrEqual(2)
  expect(Math.abs(spinnerCenterY - geometry.viewport.height / 2)).toBeLessThanOrEqual(2)
  expect(geometry.spinner.top).toBeGreaterThan(geometry.viewport.height * 0.25)
}

async function expectRuntimeOverlayCentered(page: Page): Promise<void> {
  const stopLoading = await page.evaluateHandle(() => {
    const app = document.querySelector('#app')
    const pinia = app?.__vue_app__?.config.globalProperties.$pinia
    const layoutStore = pinia?._s.get('layout')
    if (!layoutStore) throw new Error('Layout store was not found.')
    layoutStore.beginGlobalLoading()
    return () => layoutStore.endGlobalLoading()
  })

  try {
    await expect(page.locator('#runtime-loading-overlay')).toBeVisible()
    const geometry = await page.evaluate((): OverlaySpinnerGeometry => {
      const roundRect = (rect: DOMRect): DOMRectJSON => ({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
      })
      const overlay = document.querySelector('#runtime-loading-overlay')
      const spinner = overlay?.querySelector('.pure-css-loader')
      if (!overlay || !spinner) throw new Error('Expected runtime overlay and spinner.')
      return {
        overlay: roundRect(overlay.getBoundingClientRect()),
        spinner: roundRect(spinner.getBoundingClientRect()),
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }
    })

    expect(geometry.overlay.left).toBeLessThanOrEqual(1)
    expect(geometry.overlay.top).toBeLessThanOrEqual(1)
    expect(geometry.overlay.width).toBeGreaterThanOrEqual(geometry.viewport.width - 1)
    expect(geometry.overlay.height).toBeGreaterThanOrEqual(geometry.viewport.height - 1)

    const overlayCenterX = geometry.overlay.left + geometry.overlay.width / 2
    const overlayCenterY = geometry.overlay.top + geometry.overlay.height / 2
    const spinnerCenterX = geometry.spinner.left + geometry.spinner.width / 2
    const spinnerCenterY = geometry.spinner.top + geometry.spinner.height / 2
    expect(Math.abs(spinnerCenterX - overlayCenterX)).toBeLessThanOrEqual(2)
    expect(Math.abs(spinnerCenterY - overlayCenterY)).toBeLessThanOrEqual(2)
    expect(geometry.spinner.top).toBeGreaterThan(geometry.viewport.height * 0.25)
  } finally {
    await stopLoading.evaluate(stop => stop())
    await stopLoading.dispose()
    await waitForRuntimeLoadingIdle(page)
  }
}

async function sampleVisibleLoadingCenters(page: Page): Promise<OverlaySpinnerGeometry[]> {
  return page.evaluate(() => {
    const roundRect = (rect: DOMRect): DOMRectJSON => ({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      left: Math.round(rect.left),
    })
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    return Array.from(
      document.querySelectorAll(
        '#preloader-bg .pure-css-loader, #runtime-loading-overlay .pure-css-loader, .page-loading-overlay-content [role="status"], .page-loading-overlay-content .base-lottie-loader'
      )
    )
      .filter(node => {
        const rect = node.getBoundingClientRect()
        const style = window.getComputedStyle(node)
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden'
      })
      .map(node => {
        const overlay = node.closest(
          '#preloader-bg, #runtime-loading-overlay, .page-loading-overlay-content'
        )
        if (!overlay) throw new Error('Loading spinner overlay owner was not found.')
        return {
          overlay: roundRect(overlay.getBoundingClientRect()),
          spinner: roundRect(node.getBoundingClientRect()),
          viewport,
        }
      })
  })
}

async function getAppContainerScrollMetrics(
  page: Page
): Promise<{ scrollTop: number; maxScrollTop: number }> {
  return page.evaluate(selector => {
    const scrollEl = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter(element => element.scrollHeight > element.clientHeight)
      .sort((a, b) => b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight))[0]
    if (!scrollEl || scrollEl.scrollHeight <= scrollEl.clientHeight) {
      throw new Error('AppContainer CScrollbar scroll element was not found.')
    }
    return {
      scrollTop: scrollEl.scrollTop,
      maxScrollTop: Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight),
    }
  }, APP_CONTAINER_SCROLL_VIEWPORT_SELECTOR)
}

async function scrollAppContainerTo(page: Page, requestedScrollTop: number): Promise<number> {
  return page.evaluate(
    ({ selector, scrollTop }) => {
      const scrollEl = Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter(element => element.scrollHeight > element.clientHeight)
        .sort((a, b) => b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight))[0]
      if (!scrollEl || scrollEl.scrollHeight <= scrollEl.clientHeight) {
        throw new Error('AppContainer CScrollbar scroll element was not found.')
      }
      const target = Math.min(scrollTop, Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight))
      scrollEl.scrollTo({ top: target, behavior: 'auto' })
      scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }))
      return target
    },
    { selector: APP_CONTAINER_SCROLL_VIEWPORT_SELECTOR, scrollTop: requestedScrollTop }
  )
}

async function waitForAppContainerScrollElement(page: Page): Promise<void> {
  await page.waitForFunction(selector => {
    return Array.from(document.querySelectorAll<HTMLElement>(selector)).some(
      element => element.scrollHeight > element.clientHeight
    )
  }, APP_CONTAINER_SCROLL_VIEWPORT_SELECTOR)
}

async function expectBootHandoffNeverShowsTopStripSpinner(page: Page): Promise<void> {
  await page.goto(withVisualMode('/dashboard', { holdPreloader: true }), {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForFunction(() => document.documentElement.dataset.preloaderState === 'held')

  const samplesBeforeRelease = await sampleVisibleLoadingCenters(page)
  await releasePreloader(page)
  const samplesAfterOneFrame = await page
    .evaluate(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
    .then(() => sampleVisibleLoadingCenters(page))
  const samplesAfterTwoFrames = await page
    .evaluate(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
    .then(() => sampleVisibleLoadingCenters(page))

  for (const sample of [
    ...samplesBeforeRelease,
    ...samplesAfterOneFrame,
    ...samplesAfterTwoFrames,
  ]) {
    const overlayCenterX = sample.overlay.left + sample.overlay.width / 2
    const overlayCenterY = sample.overlay.top + sample.overlay.height / 2
    const spinnerCenterX = sample.spinner.left + sample.spinner.width / 2
    const spinnerCenterY = sample.spinner.top + sample.spinner.height / 2
    expect(Math.abs(spinnerCenterX - overlayCenterX)).toBeLessThanOrEqual(2)
    expect(Math.abs(spinnerCenterY - overlayCenterY)).toBeLessThanOrEqual(2)
    expect(sample.spinner.top).toBeGreaterThan(sample.viewport.height * 0.25)
  }

  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function readGeometry(page: Page): Promise<LayoutGeometry> {
  return page.evaluate(() => {
    const roundRect = (rect: DOMRect): DOMRectJSON => ({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      left: Math.round(rect.left),
    })
    const readNumberVar = (name: string): number => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      const value = Number.parseFloat(raw)
      return Number.isFinite(value) ? value : 0
    }
    const readPadding = (node: Element, side: 'top' | 'right' | 'bottom' | 'left'): number => {
      const style = getComputedStyle(node)
      const raw =
        side === 'top'
          ? style.paddingTop
          : side === 'right'
            ? style.paddingRight
            : side === 'bottom'
              ? style.paddingBottom
              : style.paddingLeft
      const value = Number.parseFloat(raw)
      return Number.isFinite(value) ? value : 0
    }
    const rect = (selector: string): DOMRectJSON | null => {
      const node = document.querySelector(selector)
      return node ? roundRect(node.getBoundingClientRect()) : null
    }
    const padding = (
      selector: string
    ): { top: number; right: number; bottom: number; left: number } | null => {
      const node = document.querySelector(selector)
      if (!node) return null
      return {
        top: readPadding(node, 'top'),
        right: readPadding(node, 'right'),
        bottom: readPadding(node, 'bottom'),
        left: readPadding(node, 'left'),
      }
    }

    const shellNode = document.querySelector('[data-layout-shell="admin"]')
    const headerNode = document.querySelector('[data-layout-header="true"]')
    const contentNode = document.querySelector('[data-layout-content="true"]')
    if (!shellNode || !headerNode || !contentNode) {
      throw new Error('Layout shell, header, or content node was not found.')
    }

    return {
      mode: shellNode.getAttribute('data-layout-mode') ?? '',
      sidebarMode: shellNode.getAttribute('data-sidebar-mode') ?? '',
      drawerMode: shellNode.getAttribute('data-drawer-mode') ?? '',
      viewport: { width: window.innerWidth, height: window.innerHeight },
      safeArea: {
        top: readNumberVar('--safe-top'),
        right: readNumberVar('--safe-right'),
        bottom: readNumberVar('--safe-bottom'),
        left: readNumberVar('--safe-left'),
      },
      shell: roundRect(shellNode.getBoundingClientRect()),
      header: roundRect(headerNode.getBoundingClientRect()),
      content: roundRect(contentNode.getBoundingClientRect()),
      sidebar: rect('[data-layout-sidebar="true"]'),
      drawerRoot: rect('.p-drawer'),
      drawer: rect('[data-layout-drawer="true"]'),
      drawerMask: rect('.p-drawer-mask, .p-overlay-mask'),
      drawerPadding: padding('[data-layout-drawer="true"]'),
      headerHeightVar: readNumberVar('--header-height'),
      sidebarWidthVar: readNumberVar('--sidebar-width'),
      shellPadding: {
        top: readPadding(shellNode, 'top'),
        right: readPadding(shellNode, 'right'),
        bottom: readPadding(shellNode, 'bottom'),
        left: readPadding(shellNode, 'left'),
      },
    }
  })
}

function expectHeaderHeight(geometry: LayoutGeometry): void {
  expect(Math.abs(geometry.header.height - geometry.headerHeightVar)).toBeLessThanOrEqual(2)
}

function expectSafeAreaApplied(geometry: LayoutGeometry): void {
  expect(Math.abs(geometry.shellPadding.top - geometry.safeArea.top)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.shellPadding.right - geometry.safeArea.right)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.shellPadding.bottom - geometry.safeArea.bottom)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.shellPadding.left - geometry.safeArea.left)).toBeLessThanOrEqual(1)
}

function expectNoContentClipping(geometry: LayoutGeometry): void {
  expect(geometry.shell.left).toBeGreaterThanOrEqual(0)
  expect(geometry.shell.top).toBeGreaterThanOrEqual(0)
  expect(geometry.shell.right).toBeLessThanOrEqual(geometry.viewport.width)
  expect(geometry.shell.bottom).toBeLessThanOrEqual(geometry.viewport.height)
  expect(geometry.content.left).toBeGreaterThanOrEqual(
    geometry.shell.left + geometry.shellPadding.left
  )
  expect(geometry.content.right).toBeLessThanOrEqual(
    geometry.shell.right - geometry.shellPadding.right
  )
  expect(geometry.content.bottom).toBeLessThanOrEqual(
    geometry.shell.bottom - geometry.shellPadding.bottom
  )
}

function expectInlineSidebarGeometry(geometry: LayoutGeometry): void {
  expect(geometry.drawerMode).toBe('false')
  expect(geometry.sidebarMode).toBe('inline')
  expect(geometry.sidebar).not.toBeNull()
  const sidebar = geometry.sidebar
  if (!sidebar) throw new Error('Expected inline sidebar geometry.')
  expect(Math.abs(sidebar.width - geometry.sidebarWidthVar)).toBeLessThanOrEqual(2)
  expect(Math.abs(geometry.content.left - sidebar.right)).toBeLessThanOrEqual(2)
  expect(sidebar.left).toBeGreaterThanOrEqual(geometry.shell.left + geometry.shellPadding.left)
}

function expectNoPhantomSidebarGeometry(geometry: LayoutGeometry): void {
  expect(geometry.sidebarMode === 'hidden' || geometry.sidebarMode === 'drawer').toBeTruthy()
  expect(geometry.sidebar).toBeNull()
  expect(
    Math.abs(geometry.content.left - (geometry.shell.left + geometry.shellPadding.left))
  ).toBeLessThanOrEqual(2)
}

function expectClosedDrawerGeometry(geometry: LayoutGeometry): void {
  expect(geometry.drawer).toBeNull()
  expect(geometry.drawerRoot).toBeNull()
  expect(geometry.drawerMask).toBeNull()
  expect(geometry.drawerPadding).toBeNull()
}

async function expectOpenDrawerGeometry(page: Page): Promise<void> {
  await page.locator('[data-layout-drawer-trigger="true"]').click()
  await expect(page.locator('[data-layout-drawer="true"]')).toBeVisible()

  const geometry = await readGeometry(page)
  expect(geometry.drawerRoot).not.toBeNull()
  expect(geometry.drawer).not.toBeNull()
  expect(geometry.drawerMask).not.toBeNull()
  expect(geometry.drawerPadding).not.toBeNull()
  if (!geometry.drawerRoot || !geometry.drawer || !geometry.drawerMask || !geometry.drawerPadding) {
    throw new Error('Expected drawer root, content, and mask geometry.')
  }

  expect(geometry.drawerRoot.width).toBeLessThanOrEqual(
    Math.round(Math.min(geometry.sidebarWidthVar, geometry.viewport.width * 0.8)) + 2
  )
  expect(geometry.drawer.left).toBeGreaterThanOrEqual(geometry.drawerRoot.left)
  expect(geometry.drawer.right).toBeLessThanOrEqual(geometry.drawerRoot.right)
  expect(geometry.drawer.left).toBeGreaterThanOrEqual(0)
  expect(geometry.drawer.top).toBeGreaterThanOrEqual(0)
  expect(geometry.drawer.bottom).toBeLessThanOrEqual(geometry.viewport.height)
  expect(geometry.drawerPadding.top).toBeGreaterThanOrEqual(geometry.safeArea.top)
  expect(geometry.drawerPadding.right).toBeGreaterThanOrEqual(geometry.safeArea.right)
  expect(geometry.drawerPadding.bottom).toBeGreaterThanOrEqual(geometry.safeArea.bottom)
  expect(geometry.drawerPadding.left).toBeGreaterThanOrEqual(geometry.safeArea.left)
  expect(geometry.drawerMask.left).toBeLessThanOrEqual(0)
  expect(geometry.drawerMask.top).toBeLessThanOrEqual(0)
  expect(geometry.drawerMask.right).toBeGreaterThanOrEqual(geometry.viewport.width)
  expect(geometry.drawerMask.bottom).toBeGreaterThanOrEqual(geometry.viewport.height)
}

test.describe('layout loading and route title stabilization', () => {
  test('native preloader covers the viewport and centers its spinner', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await expectNativePreloaderCentered(page)
  })

  test('runtime global loading overlay covers the viewport and centers the spinner', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsAdmin(page)
    await expectRuntimeOverlayCentered(page)
  })

  test('boot handoff never exposes a top-strip spinner frame', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await expectBootHandoffNeverShowsTopStripSpinner(page)
  })

  test('layout animate boundary remains fullscreen on login route', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(withVisualMode('/login?redirect=/'), { waitUntil: 'domcontentloaded' })
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    const boundary = page.getByTestId('layout-animate-boundary')
    const fullscreenShell = page.locator('[data-layout-shell="fullscreen"]')

    await expect(boundary).toBeVisible()
    await expect(fullscreenShell).toBeVisible()

    const geometry = await page.evaluate(() => {
      const roundRect = (rect: DOMRect): DOMRectJSON => ({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
      })

      const boundaryNode = document.querySelector('[data-testid="layout-animate-boundary"]')
      const fullscreenShellNode = document.querySelector('[data-layout-shell="fullscreen"]')
      if (!boundaryNode || !fullscreenShellNode) {
        throw new Error('Expected layout animate boundary and fullscreen shell nodes.')
      }

      return {
        boundary: roundRect(boundaryNode.getBoundingClientRect()),
        shell: roundRect(fullscreenShellNode.getBoundingClientRect()),
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }
    })

    expect(geometry.boundary.height).toBeGreaterThanOrEqual(geometry.viewport.height - 2)
    expect(geometry.boundary.width).toBeGreaterThanOrEqual(geometry.viewport.width - 2)
    expect(geometry.shell.height).toBeGreaterThanOrEqual(geometry.viewport.height - 2)
    expect(geometry.shell.width).toBeGreaterThanOrEqual(geometry.viewport.width - 2)

    expect(geometry.shell.left).toBeGreaterThanOrEqual(geometry.boundary.left - 2)
    expect(geometry.shell.top).toBeGreaterThanOrEqual(geometry.boundary.top - 2)
    expect(geometry.shell.right).toBeLessThanOrEqual(geometry.boundary.right + 2)
    expect(geometry.shell.bottom).toBeLessThanOrEqual(geometry.boundary.bottom + 2)

    await expect(page.locator('.page-loading-overlay-content')).toBeHidden()
    await expect(page.locator('#runtime-loading-overlay')).toBeHidden()
  })

  test('refresh boot handoff does not show local page loading immediately after native loading', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsAdmin(page)

    await page.goto(withVisualMode('/dashboard', { holdPreloader: true }), {
      waitUntil: 'domcontentloaded',
    })
    await page.waitForFunction(() => document.documentElement.dataset.preloaderState === 'held')
    await expect(page.locator('.page-loading-overlay-content')).toBeHidden()

    await releasePreloader(page)
    await page.waitForTimeout(180)
    await expect(page.locator('.page-loading-overlay-content')).toBeHidden()

    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()
    await expect(page.locator('.page-loading-overlay-content')).toBeHidden()
  })

  test('deep business route refresh does not expose not-found title during stabilization', async ({
    page,
  }) => {
    await installTitleProbe(page)
    await loginAsAdmin(page)

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/#\/dashboard$/)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()

    const titles = await page.evaluate(() => window.ccdTitleProbe)
    expect(titles).not.toContain('页面未找到 - CCD')
    expect(titles).not.toContain('页面未找到')
    expect(await page.title()).toMatch(/ccd/i)
  })

  test('actual unknown route resolves to the not-found title', async ({ page }) => {
    await installTitleProbe(page)
    await loginAsAdmin(page)

    await page.goto(withVisualMode('/definitely-missing-route'), { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/#\/404$/)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    expect(await page.title()).toMatch(/^页面未找到 - ccd$/i)
    const titles = await page.evaluate(() => window.ccdTitleProbe)
    expect(titles.at(-1)).toMatch(/^页面未找到 - ccd$/i)
  })

  test('AppContainer CScrollbar restores persisted scroll memory smoothly after refresh', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 700 })
    await loginAsAdmin(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()
    await page.evaluate(() => {
      const scroller = document.createElement('div')
      scroller.setAttribute('data-testid', 'scroll-memory-e2e-spacer')
      scroller.style.height = '1200px'
      document.querySelector('#dashboard-page')?.append(scroller)
    })
    await waitForAppContainerScrollElement(page)

    const initialMetrics = await getAppContainerScrollMetrics(page)
    const savedScrollTop = await scrollAppContainerTo(
      page,
      Math.min(600, Math.max(600, initialMetrics.maxScrollTop))
    )
    expect(savedScrollTop).toBeGreaterThan(0)
    await page.waitForTimeout(300)

    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForAppReady(page)
    await waitForAppContainerScrollElement(page)

    const immediate = (await getAppContainerScrollMetrics(page)).scrollTop
    await page.waitForTimeout(120)
    const after120Ms = (await getAppContainerScrollMetrics(page)).scrollTop
    await page.waitForTimeout(780)
    const after900Ms = (await getAppContainerScrollMetrics(page)).scrollTop
    await waitForRuntimeLoadingIdle(page)

    expect(after900Ms).toBeGreaterThan(0)
    expect(Math.abs(after900Ms - savedScrollTop)).toBeLessThanOrEqual(8)

    const immediateDistance = Math.abs(savedScrollTop - immediate)
    const after120Distance = Math.abs(savedScrollTop - after120Ms)
    const finalDistance = Math.abs(savedScrollTop - after900Ms)
    expect(finalDistance).toBeLessThanOrEqual(after120Distance + 2)
    expect(after120Distance).toBeLessThanOrEqual(immediateDistance + 2)

    test.info().annotations.push({
      type: 'scroll-memory-samples',
      description: JSON.stringify({ immediate, after120Ms, after900Ms, savedScrollTop }),
    })

    if (immediateDistance > 20 && after120Distance > 2) {
      expect(after120Ms).toBeGreaterThanOrEqual(immediate)
      expect(after120Ms).toBeLessThan(savedScrollTop + 2)
      expect(after120Ms).toBeLessThan(after900Ms + 2)
    }
  })

  test('dashboard route keeps page-level horizontal overflow disabled', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()

    const metrics = await page.evaluate(() => {
      const root =
        document.querySelector<HTMLElement>('[data-console-scroll-root]') ??
        document.scrollingElement
      if (!root) {
        throw new Error('Expected a console scroll root or document scrolling element.')
      }

      root.scrollTo({ top: root.scrollHeight, behavior: 'auto' })

      return {
        scrollWidth: root.scrollWidth,
        clientWidth: root.clientWidth,
      }
    })

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  })

  test('ProTable console route keeps a non-zero table geometry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await page.goto(withVisualMode('/ui/pro-table'), {
      waitUntil: 'domcontentloaded',
    })
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('.p-datatable')).toBeVisible({ timeout: 15000 })

    const geometry = await page.evaluate(() => {
      const measure = (selector: string) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect()
        return {
          height: Math.round(rect?.height ?? 0),
          width: Math.round(rect?.width ?? 0),
        }
      }

      return {
        datatable: measure('.p-datatable'),
        tableContainer: measure('.p-datatable-table-container'),
        tbody: measure('.p-datatable-tbody'),
        rowCount: document.querySelectorAll('.p-datatable-tbody > tr').length,
      }
    })

    expect(geometry.datatable.width).toBeGreaterThan(0)
    expect(geometry.datatable.height).toBeGreaterThan(0)
    expect(geometry.tableContainer.width).toBeGreaterThan(0)
    expect(geometry.tableContainer.height).toBeGreaterThan(0)
    expect(geometry.tbody.height).toBeGreaterThan(0)
    expect(geometry.rowCount).toBeGreaterThan(0)
  })

  test('AppContainer renders the paper-airplane local page loading outlet', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsAdmin(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expectPageLoadingOverlayCentered(page)
    await expect(page.getByTestId('app-container-page-loading').locator('svg')).toBeAttached()
  })

  test('runtime route navigation shows the AppContainer local page loading outlet', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsAdmin(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    const overlayLocator = page.locator('.page-loading-overlay-content')
    const observation = await observeRoutePageLoadingOutlet(page, {
      targetHash: '#/runtime/state',
      routeHeading: '状态归属与工具',
    })

    expect(observation.sawLocalOverlayVisible).toBe(true)
    expect(observation.sawLoadingContentVisible).toBe(true)
    expect(observation.sawRuntimeOverlayVisible).toBe(false)
    expect(observation.sawLocalPureCssLoaderVisible).toBe(false)
    await expect(page).toHaveURL(/#\/runtime\/state$/)
    await expect(
      page.getByRole('heading', { name: /状态归属与工具|State Ownership And Utilities/ })
    ).toBeVisible()
    await expect(page.locator('#runtime-loading-overlay')).toBeHidden()
    await waitForRuntimeLoadingIdle(page)
    await expect(overlayLocator).toBeHidden({ timeout: 5000 })
  })

  test('AppContainer page loading is controlled only by layout page-loading state', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAsAdmin(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    const overlayLocator = page.getByTestId('app-container-page-loading')
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      const pinia = app?.__vue_app__?.config.globalProperties.$pinia
      const layoutStore = pinia?._s.get('layout')
      if (!layoutStore) throw new Error('Layout store was not found.')
      layoutStore.beginGlobalLoading()
    })
    await expect(overlayLocator).toBeHidden()

    await page.evaluate(() => {
      const app = document.querySelector('#app')
      const pinia = app?.__vue_app__?.config.globalProperties.$pinia
      const layoutStore = pinia?._s.get('layout')
      if (!layoutStore) throw new Error('Layout store was not found.')
      layoutStore.beginPageLoading()
      layoutStore.endGlobalLoading()
    })
    await expect(overlayLocator).toBeVisible()
    await expect(overlayLocator.locator('svg')).toBeAttached()

    await page.evaluate(() => {
      const app = document.querySelector('#app')
      const pinia = app?.__vue_app__?.config.globalProperties.$pinia
      const layoutStore = pinia?._s.get('layout')
      if (!layoutStore) throw new Error('Layout store was not found.')
      layoutStore.endPageLoading()
    })
    await expect(overlayLocator).toBeHidden()
  })
})

test.describe('layout runtime geometry — desktop', () => {
  for (const viewport of [
    { name: 'desktop-1280', width: 1280, height: 900 },
    { name: 'desktop-1440', width: 1440, height: 960 },
    { name: 'desktop-ultrawide', width: 2560, height: 1200 },
  ]) {
    test(`inline shell is stable at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openDashboard(page)

      const geometry = await readGeometry(page)
      expect(geometry.mode).toBe('vertical')
      expectHeaderHeight(geometry)
      expectSafeAreaApplied(geometry)
      expectNoContentClipping(geometry)
      expectInlineSidebarGeometry(geometry)
      expectClosedDrawerGeometry(geometry)
    })
  }
})

test.describe('layout runtime geometry — iPhone', () => {
  test.use({
    userAgent: IPHONE_USER_AGENT,
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  })

  for (const viewport of [
    { name: 'iphone-portrait', width: 390, height: 844 },
    { name: 'iphone-landscape', width: 844, height: 390 },
  ]) {
    test(`drawer shell has no phantom sidebar spacing in ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openDashboard(page)

      const geometry = await readGeometry(page)
      expect(geometry.drawerMode).toBe('true')
      expect(geometry.sidebarMode).toBe('drawer')
      expectHeaderHeight(geometry)
      expectSafeAreaApplied(geometry)
      expectNoContentClipping(geometry)
      expectNoPhantomSidebarGeometry(geometry)
      expectClosedDrawerGeometry(geometry)

      await expectOpenDrawerGeometry(page)
    })
  }

  test('portrait and landscape transitions remain reversible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openDashboard(page)

    for (const viewport of [
      { width: 844, height: 390 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport)
      await waitForRuntimeLoadingIdle(page)
      const geometry = await readGeometry(page)
      expect(geometry.drawerMode).toBe('true')
      expect(geometry.sidebarMode).toBe('drawer')
      expectNoContentClipping(geometry)
      expectNoPhantomSidebarGeometry(geometry)
      expectClosedDrawerGeometry(geometry)
    }
  })
})

test.describe('layout runtime geometry — iPadOS', () => {
  test.use({
    userAgent: IPAD_OS_USER_AGENT,
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  })

  for (const viewport of [
    { name: 'ipad-portrait', width: 820, height: 1180, drawer: false },
    { name: 'ipad-landscape', width: 1180, height: 820, drawer: false },
    { name: 'ipad-split-view', width: 600, height: 1180, drawer: true },
  ]) {
    test(`runtime state is coherent in ${viewport.name}`, async ({ page }) => {
      await installIPadRuntimeHints(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await openDashboard(page)

      const geometry = await readGeometry(page)
      expectHeaderHeight(geometry)
      expectSafeAreaApplied(geometry)
      expectNoContentClipping(geometry)

      if (viewport.drawer) {
        expect(geometry.drawerMode).toBe('true')
        expect(geometry.sidebarMode).toBe('drawer')
        expectNoPhantomSidebarGeometry(geometry)
        await expectOpenDrawerGeometry(page)
      } else {
        expect(geometry.drawerMode).toBe('false')
        expect(geometry.sidebarMode).toBe('hidden')
        expectNoPhantomSidebarGeometry(geometry)
        expectClosedDrawerGeometry(geometry)
      }
    })
  }
})
