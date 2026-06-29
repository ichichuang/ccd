import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

/**
 * Regression: A11Y-01 — admin header controls must be accessible, keyboard-operable buttons.
 *
 * The theme, sidebar-collapse and fullscreen controls in `AdminHeader.vue` were bare
 * clickable `<div>`s wrapping an `aria-hidden` `<Icons>` — no role, no accessible name, not
 * in the tab order, not activatable by keyboard. So `getByRole('button', { name })` could not
 * find them and keyboard users could not operate them.
 *
 * This spec asserts the DESIRED behavior: the theme control and the sidebar control are
 * discoverable as buttons by accessible name, are keyboard-focusable, can be activated by
 * Enter AND Space, and still respond to mouse click; the fullscreen control exposes the same
 * accessible semantics (button + name + aria-pressed) without requiring real OS fullscreen.
 * It fails until the source fix lands and guards against regression afterwards.
 */

const HEADER = '[data-layout-header="true"]'
const ACTION_CHIP_SELECTOR = `${HEADER} [class*="material-elevated"]`

interface ControlInfo {
  found: boolean
  tag?: string
  isButton?: boolean
  role?: string | null
  ariaLabel?: string | null
  ariaPressed?: string | null
  tabIndex?: number
}

interface HeaderA11yDiagnostics {
  headerButtonCount: number
  actionChips: ControlInfo[]
  documentDarkClass: boolean
}

async function collectDiagnostics(page: Page): Promise<HeaderA11yDiagnostics> {
  return page.evaluate(
    ({ header, chipSel }) => {
      const root = document.querySelector(header)
      const describe = (el: Element): ControlInfo => ({
        found: true,
        tag: el.tagName.toLowerCase(),
        isButton: el.tagName === 'BUTTON',
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaPressed: el.getAttribute('aria-pressed'),
        tabIndex: (el as HTMLElement).tabIndex,
      })
      return {
        headerButtonCount: root ? root.querySelectorAll('button').length : 0,
        actionChips: Array.from(document.querySelectorAll(chipSel)).map(describe),
        documentDarkClass: document.documentElement.classList.contains('dark'),
      }
    },
    { header: HEADER, chipSel: ACTION_CHIP_SELECTOR }
  )
}

async function attach(testInfo: TestInfo, payload: Record<string, unknown>): Promise<string> {
  const body = JSON.stringify(payload, null, 2)
  await testInfo.attach('admin-header-a11y-diagnostics', { body, contentType: 'application/json' })
  return body
}

test.describe('admin header controls accessibility (A11Y-01)', () => {
  test('theme + sidebar + fullscreen controls are accessible, keyboard- and mouse-operable buttons', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page) // lands authenticated on /dashboard
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()

    const diagnostics = await collectDiagnostics(page)
    const evidence = await attach(testInfo, diagnostics)

    const header = page.locator(HEADER)

    // ── Theme control: discoverable, keyboard-focusable, Enter + Space + mouse all toggle ──
    const themeBtn = header.getByRole('button', { name: 'Toggle theme' }).first()
    await expect(
      themeBtn,
      `theme control must be a button with an accessible name.\n${evidence}`
    ).toBeVisible()
    expect(await themeBtn.evaluate(el => el.tagName)).toBe('BUTTON')

    await themeBtn.focus()
    await expect(themeBtn, 'theme button must be keyboard-focusable').toBeFocused()

    const themePressed0 = await themeBtn.getAttribute('aria-pressed')
    expect(themePressed0, 'theme button must expose aria-pressed state').toMatch(/true|false/)

    // Enter activates
    await themeBtn.press('Enter')
    await expect
      .poll(() => themeBtn.getAttribute('aria-pressed'), { message: 'Enter must toggle theme' })
      .not.toBe(themePressed0)
    const themePressed1 = await themeBtn.getAttribute('aria-pressed')

    // Space activates (toggles back)
    await themeBtn.press(' ')
    await expect
      .poll(() => themeBtn.getAttribute('aria-pressed'), { message: 'Space must toggle theme' })
      .not.toBe(themePressed1)
    const themePressed2 = await themeBtn.getAttribute('aria-pressed')

    // Mouse click still works (existing behavior preserved)
    await themeBtn.click()
    await expect
      .poll(() => themeBtn.getAttribute('aria-pressed'), {
        message: 'mouse click must still toggle theme',
      })
      .not.toBe(themePressed2)
    await themeBtn.click() // restore original state

    // ── Sidebar collapse control (a layout control): button + keyboard + mouse ──
    const collapseBtn = header.getByRole('button', { name: 'Toggle sidebar' }).first()
    await expect(
      collapseBtn,
      `sidebar control must be a button with an accessible name.\n${evidence}`
    ).toBeVisible()
    expect(await collapseBtn.evaluate(el => el.tagName)).toBe('BUTTON')

    await collapseBtn.focus()
    await expect(collapseBtn, 'sidebar button must be keyboard-focusable').toBeFocused()

    const collapse0 = await collapseBtn.getAttribute('aria-pressed')
    await collapseBtn.press('Enter') // Enter activates
    await expect
      .poll(() => collapseBtn.getAttribute('aria-pressed'), {
        message: 'Enter must toggle sidebar collapse',
      })
      .not.toBe(collapse0)
    await collapseBtn.click() // mouse restores
    await expect
      .poll(() => collapseBtn.getAttribute('aria-pressed'), {
        message: 'mouse click must toggle sidebar back',
      })
      .toBe(collapse0)

    // ── Fullscreen control: accessible semantics only (no real OS fullscreen in headless) ──
    const fullscreenBtn = header.getByRole('button', { name: 'Toggle fullscreen' }).first()
    await expect(
      fullscreenBtn,
      `fullscreen control must be a button with an accessible name.\n${evidence}`
    ).toBeVisible()
    expect(await fullscreenBtn.evaluate(el => el.tagName)).toBe('BUTTON')
    await fullscreenBtn.focus()
    await expect(fullscreenBtn, 'fullscreen button must be keyboard-focusable').toBeFocused()
    expect(
      await fullscreenBtn.getAttribute('aria-pressed'),
      'fullscreen button must expose aria-pressed state'
    ).toMatch(/true|false/)
  })
})
