import { expect, test, type JSHandle, type Page, type TestInfo } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

/**
 * Regression: ConsolePage SPA blank-navigation bug.
 *
 * `/architecture/topology`, `/runtime/http` and `/ui/pro-table` all resolve to the
 * SAME lazy component (`views/architecture-console/ConsolePage.vue`); only the route
 * name differs. Navigating between them via real in-app (no document reload) routing
 * drives `<router-view>` -> `<Transition mode="out-in">` -> `<keep-alive>` inside
 * `AnimateRouterView`. The regression collapses the route-content host to a single
 * comment node (`<!---->`) — a blank page — instead of rendering the next ConsolePage.
 *
 * This spec asserts the DESIRED (correct) behavior: after no-reload SPA navigation the
 * host still has an element child and meaningful text. It is expected to FAIL until the
 * source fix lands. Existing console specs only ever use `page.goto` (full reload), so
 * they never exercise — and never catch — this in-app navigation path.
 */

const CONSOLE_PAGE_SELECTOR = '[data-testid="architecture-console-page"]'
const SCROLL_ROOT_SELECTOR = '[data-console-scroll-root]'

// Fresh full load lands on a ConsolePage route; the rest are real SPA hops.
const FRESH_ROUTE = '/architecture/topology'
const SPA_HOPS = ['/runtime/http', '/ui/pro-table'] as const

interface HostDiagnostics {
  found: boolean
  isConnected: boolean
  url: string
  hash: string
  routeTitle: string
  childNodesLength: number
  elementChildrenCount: number
  firstChildNodeType: number | null
  firstChildNodeValue: string | null
  textLength: number
  htmlSample: string
}

const COMMENT_NODE = 8

/**
 * Resolve the route-content host: the static `AnimateRouterView` wrapper `<div>` that
 * directly contains the routed `<component :is>`. It persists across SPA navigations,
 * so we hold a handle and re-inspect the SAME element after each hop — that is exactly
 * the element that collapses to a lone comment node when the bug fires.
 */
async function resolveRouteContentHost(page: Page): Promise<JSHandle<Element | null>> {
  return page.evaluateHandle(selector => {
    const content = document.querySelector(selector)
    return content?.parentElement ?? null
  }, CONSOLE_PAGE_SELECTOR)
}

async function readHostDiagnostics(
  page: Page,
  host: JSHandle<Element | null>
): Promise<HostDiagnostics> {
  return page.evaluate(node => {
    const base = {
      url: window.location.href,
      hash: window.location.hash,
      routeTitle: document.title,
    }
    if (!node) {
      return {
        found: false,
        isConnected: false,
        ...base,
        childNodesLength: 0,
        elementChildrenCount: 0,
        firstChildNodeType: null,
        firstChildNodeValue: null,
        textLength: 0,
        htmlSample: '',
      }
    }
    const el = node
    const first = el.firstChild
    return {
      found: true,
      isConnected: el.isConnected,
      ...base,
      childNodesLength: el.childNodes.length,
      elementChildrenCount: el.children.length,
      firstChildNodeType: first ? first.nodeType : null,
      firstChildNodeValue: first ? first.nodeValue : null,
      textLength: (el.textContent ?? '').trim().length,
      htmlSample: (el.innerHTML ?? '').replace(/\s+/g, ' ').trim().slice(0, 400),
    }
  }, host)
}

/**
 * Wait for the route `<Transition>` (out-in) to settle so we read steady state, not a
 * mid-transition frame. Bounded: the regression's collapsed state is stable and far
 * outlives this window, so a healthy app resolves fast and a broken one still gets read.
 */
async function waitForRouteTransitionSettled(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const root = document.querySelector('[data-console-scroll-root]')
        if (!root) return true
        return (
          root.querySelectorAll('[class*="-enter-active"],[class*="-leave-active"]').length === 0
        )
      },
      undefined,
      { timeout: 5000 }
    )
    .catch(() => undefined)
  // Steady-state buffer for keep-alive / transition microtasks to flush before we
  // snapshot the host's child nodes.
  await page.waitForTimeout(300)
}

/**
 * Real in-app SPA navigation: in hash-router mode, assigning `location.hash` fires
 * `hashchange` and vue-router navigates WITHOUT reloading the document.
 */
async function spaNavigate(page: Page, hashPath: string): Promise<void> {
  await page.evaluate(path => {
    window.location.hash = `#${path}`
  }, hashPath)
  await page.waitForFunction(path => window.location.hash === `#${path}`, hashPath)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await waitForRouteTransitionSettled(page)
}

async function attachEvidence(
  testInfo: TestInfo,
  payload: Record<string, unknown>
): Promise<string> {
  const body = JSON.stringify(payload, null, 2)
  await testInfo.attach('console-spa-navigation-host-diagnostics', {
    body,
    contentType: 'application/json',
  })
  return body
}

test.describe('ConsolePage SPA navigation regression', () => {
  test('route content host survives no-reload navigation between ConsolePage routes', async ({
    page,
  }, testInfo) => {
    await loginAsAdmin(page)

    // Fresh full load directly into a ConsolePage route.
    await gotoVisual(page, FRESH_ROUTE)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await waitForRouteTransitionSettled(page)

    // The route-content host must be rendered on fresh load.
    await expect(page.locator(CONSOLE_PAGE_SELECTOR)).toBeVisible()
    await expect(page.locator(SCROLL_ROOT_SELECTOR)).toBeAttached()

    const host = await resolveRouteContentHost(page)
    const hostResolved = await page.evaluate(node => node !== null, host)
    expect(
      hostResolved,
      'AnimateRouterView wrapper host should resolve on fresh ConsolePage load'
    ).toBe(true)

    // Sentinel on window: a real page reload during the hops would wipe it, proving the
    // navigation was NOT in-app. The bug is a silent content collapse (no reload), so
    // this should survive — isolating the failure to the host-collapse assertions below.
    await page.evaluate(() => {
      ;(window as unknown as Record<string, unknown>).__ccdNoReloadSentinel = 'alive'
    })

    // Real SPA (no document reload) navigation across ConsolePage routes.
    for (const hop of SPA_HOPS) {
      await spaNavigate(page, hop)
    }

    const sentinelSurvived = await page.evaluate(
      () => (window as unknown as Record<string, unknown>).__ccdNoReloadSentinel === 'alive'
    )

    const diagnostics = await readHostDiagnostics(page, host)
    // The routed <component> collapses to a Vue comment placeholder (<!---->). In the DOM
    // that shows up as zero element children and no text, with the comment as the only
    // markup (often flanked by whitespace-only text nodes), so we detect the blank state
    // structurally rather than insisting on a single childNode.
    const htmlIsCommentOnly = /^(?:<!---->)+$/.test(diagnostics.htmlSample)
    const collapsedToComment =
      diagnostics.elementChildrenCount === 0 &&
      diagnostics.textLength === 0 &&
      (htmlIsCommentOnly ||
        (diagnostics.childNodesLength === 1 && diagnostics.firstChildNodeType === COMMENT_NODE))

    const evidence = await attachEvidence(testInfo, {
      navigatedPath: `${FRESH_ROUTE} -> ${SPA_HOPS.join(' -> ')}`,
      sentinelSurvived,
      collapsedToComment,
      ...diagnostics,
    })

    // Confirm this really was no-reload SPA navigation (else the rest is meaningless).
    expect(
      sentinelSurvived,
      `expected in-app SPA navigation without document reload.\n${evidence}`
    ).toBe(true)

    // Desired correct behavior: the host keeps a rendered element child + real text,
    // instead of collapsing to a single comment node (<!---->) i.e. a blank page.
    expect(
      collapsedToComment,
      `route-content host collapsed to a single comment node after SPA navigation (blank-navigation bug).\n${evidence}`
    ).toBe(false)
    expect(
      diagnostics.elementChildrenCount,
      `route-content host should keep at least one element child after SPA navigation.\n${evidence}`
    ).toBeGreaterThan(0)
    expect(
      diagnostics.textLength,
      `route-content host should render meaningful text after SPA navigation.\n${evidence}`
    ).toBeGreaterThan(0)

    // The ConsolePage shell should be present and visible on the final SPA route.
    await expect(page.locator(CONSOLE_PAGE_SELECTOR)).toBeVisible()
  })
})
