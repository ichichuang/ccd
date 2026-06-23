import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const proFormRoutes = [
  {
    slug: 'overview',
    path: '/showcase/components/pro-form/overview',
    heading: 'ProForm 概览',
    primaryControl: '请求名称',
    evidence: 'ProFormDemoShell.vue',
  },
  {
    slug: 'basic-schema',
    path: '/showcase/components/pro-form/basic-schema',
    heading: '基础 Schema',
    primaryControl: '请求名称',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'validation',
    path: '/showcase/components/pro-form/validation',
    heading: '校验',
    primaryControl: '请求名称',
    evidence: 'ProFormDemoShell.vue',
  },
  {
    slug: 'conditional-visibility',
    path: '/showcase/components/pro-form/conditional-visibility',
    heading: '条件显示',
    primaryControl: '审批说明',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'dependencies-computed',
    path: '/showcase/components/pro-form/dependencies-computed',
    heading: '依赖与计算',
    primaryControl: '月度成本',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'grouped-layout',
    path: '/showcase/components/pro-form/grouped-layout',
    heading: '分组布局',
    primaryControl: '请求信息',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'reactions',
    path: '/showcase/components/pro-form/reactions',
    heading: '联动反应',
    primaryControl: '跟进消息',
    evidence: 'pro-form/reactions/index.vue',
    capability: '联动更新文案',
  },
  {
    slug: 'async-data',
    path: '/showcase/components/pro-form/async-data',
    heading: '异步数据',
    primaryControl: '负责人',
    evidence: 'pro-form/async-data/index.vue',
    capability: '异步选项保持本地',
  },
  {
    slug: 'field-arrays',
    path: '/showcase/components/pro-form/field-arrays',
    heading: '字段数组',
    primaryControl: '里程碑',
    evidence: 'pro-form/field-arrays/index.vue',
    capability: '重复字段易管理',
  },
  {
    slug: 'plugins-draft',
    path: '/showcase/components/pro-form/plugins-draft',
    heading: '插件与草稿',
    primaryControl: '草稿标题',
    evidence: 'pro-form/plugins-draft/index.vue',
    capability: '草稿保留进度',
  },
  {
    slug: 'submit-states',
    path: '/showcase/components/pro-form/submit-states',
    heading: '提交状态',
    primaryControl: '使用错误结果',
    evidence: 'pro-form/submit-states/index.vue',
    capability: '结果状态明确',
  },
  {
    slug: 'api-events',
    path: '/showcase/components/pro-form/api-events',
    heading: 'API 与事件',
    primaryControl: '事件记录',
    evidence: 'pro-form/api-events/index.vue',
    capability: '表单 API 可检查',
  },
] as const

const mobileRoutes = [
  proFormRoutes.find(route => route.slug === 'basic-schema'),
  proFormRoutes.find(route => route.slug === 'validation'),
].filter((route): route is (typeof proFormRoutes)[number] => Boolean(route))

let navigationId = 0

function collectDiagnostics(page: Page): {
  consoleErrors: string[]
  pageErrors: string[]
} {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', error => {
    pageErrors.push(error.message)
  })

  return { consoleErrors, pageErrors }
}

async function gotoShowcaseRoute(page: Page, path: string): Promise<void> {
  navigationId += 1
  const visualUrl = withVisualMode(path).replace(
    '?e2e=visual',
    `?e2e=visual&e2ePhase2C=${navigationId}`
  )

  await page.goto(visualUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(expectedPath => window.location.hash === `#${expectedPath}`, path)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2)
}

async function expectSourceEvidenceReadable(page: Page, evidence: string): Promise<void> {
  await expect(page.getByText('源码', { exact: true }).first()).toBeVisible()

  const code = page.locator('code').filter({ hasText: evidence }).first()
  await expect(code).toBeVisible()

  const codeMetrics = await code.evaluate(element => {
    const style = window.getComputedStyle(element)
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      wordBreak: style.wordBreak,
    }
  })

  expect(codeMetrics.wordBreak).toBe('break-all')
  expect(codeMetrics.scrollWidth).toBeLessThanOrEqual(codeMetrics.clientWidth + 4)
}

function getFieldArrayPanel(page: Page): Locator {
  return page
    .getByText('使用列表控件管理同一份表单中的重复字段。', { exact: true })
    .locator('xpath=ancestor::section[1]')
}

async function waitForThemeState(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.waitForFunction(mode => {
    const isDark = document.documentElement.classList.contains('dark')
    return (
      document.documentElement.dataset.themeMode === mode &&
      document.documentElement.dataset.themeTransitioning === 'false' &&
      (mode === 'dark' ? isDark : !isDark)
    )
  }, targetMode)
}

async function switchThemeFromSettings(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.locator('#user-entry-trigger').click()
  await page.locator('#user-open-global-settings').click()
  await expect(page).toHaveURL(/#\/system\/settings$/, { timeout: 15000 })
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)

  const settings = page.getByTestId('global-settings-page')
  await expect(settings).toBeVisible()
  await settings.getByRole('button', { name: targetMode === 'dark' ? '深色' : '浅色' }).click()
  await waitForThemeState(page, targetMode)
}

async function captureEvidence(page: Page, testInfo: TestInfo, name: string): Promise<string> {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: true })
  return path
}

async function expectProFormRoute(
  page: Page,
  route: (typeof proFormRoutes)[number]
): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expect(page.getByText('Schema 驱动表单', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('表单操作', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /^校验$/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: '提交请求' }).first()).toBeVisible()
  await expect(page.getByText(route.primaryControl, { exact: false }).first()).toBeVisible()
  await expect(page.getByText('本地反馈', { exact: true }).first()).toBeVisible()
  await expectSourceEvidenceReadable(page, route.evidence)

  if (route.capability) {
    await expect(page.getByText(route.capability, { exact: false }).first()).toBeVisible()
  }

  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C ProForm showcase UI readiness', () => {
  test('desktop ProForm routes keep actions, forms, feedback, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of proFormRoutes) {
      await expectProFormRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile ProForm routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectProFormRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('validation and submit feedback remain usable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/components/pro-form/validation')
    await page
      .getByRole('button', { name: /^校验$/ })
      .first()
      .click()
    await expect(page.getByText('请求名称必填。').first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'validation-required-fields')

    await gotoShowcaseRoute(page, '/showcase/components/pro-form/basic-schema')
    await page.getByRole('button', { name: '提交请求' }).first().click()
    await expect(page.getByText('已本地提交字段', { exact: false }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'basic-submit-feedback')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('advanced ProForm draft and field-array interactions update visible state', async ({
    page,
  }) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/components/pro-form/plugins-draft')
    await expect(page.locator('h1', { hasText: '插件与草稿' })).toBeVisible()

    const draftTitle = page.getByLabel('草稿标题')
    await page.getByRole('button', { name: '清除草稿' }).first().click()
    await expect(page.getByText('草稿已清除。').first()).toBeVisible()
    await draftTitle.fill('交互覆盖草稿')
    await page.getByPlaceholder('记录仍在编辑中的摘要。').fill('保存后应能恢复的交互覆盖摘要。')
    await page.getByRole('button', { name: '保存草稿' }).first().click()
    await expect(page.getByText('当前表单取值已保存为草稿。').first()).toBeVisible()

    await draftTitle.fill('临时覆盖标题')
    await page.getByRole('button', { name: '读取草稿' }).first().click()
    await expect(draftTitle).toHaveValue('交互覆盖草稿')
    await expect(page.getByText('草稿已恢复到表单。').first()).toBeVisible()
    await page.getByRole('button', { name: '清除草稿' }).first().click()
    await expect(page.getByText('草稿已清除。').first()).toBeVisible()
    await expectSourceEvidenceReadable(page, 'pro-form/plugins-draft/index.vue')
    await expectNoHorizontalOverflow(page)

    await gotoShowcaseRoute(page, '/showcase/components/pro-form/field-arrays')
    await expect(page.locator('h1', { hasText: '字段数组' })).toBeVisible()

    const fieldArrayPanel = getFieldArrayPanel(page)
    await expect(fieldArrayPanel).toBeVisible()
    await expect(fieldArrayPanel.locator('li').first()).toBeVisible()

    const initialMilestoneCount = await fieldArrayPanel.locator('li').count()
    expect(initialMilestoneCount).toBeGreaterThan(0)

    await fieldArrayPanel.getByPlaceholder('新增里程碑').fill('交互覆盖验收')
    await fieldArrayPanel.getByRole('button', { name: '新增里程碑' }).click()
    await expect(fieldArrayPanel.locator('li')).toHaveCount(initialMilestoneCount + 1)

    const addedMilestone = fieldArrayPanel.locator('li').filter({ hasText: '交互覆盖验收' })
    await expect(addedMilestone).toHaveCount(1)

    await page.getByRole('button', { name: '读取取值' }).first().click()
    await expect(page.getByText(/当前已有值字段：.*milestones/).first()).toBeVisible()

    await addedMilestone.getByRole('button', { name: '删除里程碑' }).click()
    await expect(addedMilestone).toHaveCount(0)
    await expect(fieldArrayPanel.locator('li')).toHaveCount(initialMilestoneCount)

    await page.getByRole('button', { name: '读取取值' }).first().click()
    await expect(page.getByText(/当前已有值字段：.*milestones/).first()).toBeVisible()
    await expectSourceEvidenceReadable(page, 'ProFormFieldArrayControls.vue')
    await expectNoHorizontalOverflow(page)

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark validation route keeps controls and feedback readable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/components/pro-form/validation')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '校验' })).toBeVisible()
    await expect(page.getByText('Schema 驱动表单', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^校验$/ }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-validation')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
