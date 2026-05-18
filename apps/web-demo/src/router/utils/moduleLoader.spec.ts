import { describe, expect, it, vi } from 'vitest'
import { autoImportModules, getModuleName } from './moduleLoader'

describe('moduleLoader', () => {
  it('normalizes module names without evaluating route modules eagerly', async () => {
    const dashboardRoute: RouteConfig = {
      path: '/dashboard',
      name: 'Dashboard',
      meta: { title: 'Dashboard' },
    }
    const dashboardLoader = vi.fn(async () => ({ default: [dashboardRoute] }))
    const modules: Record<string, typeof dashboardLoader> = {}
    modules['./modules/dashboard.ts'] = dashboardLoader

    expect(dashboardLoader).not.toHaveBeenCalled()

    const imported = await autoImportModules<RouteModule>(modules)

    expect(dashboardLoader).toHaveBeenCalledTimes(1)
    expect(imported.dashboard).toEqual([dashboardRoute])
  })

  it('derives stable manifest keys from route module paths', () => {
    expect(getModuleName('./modules/system/index.ts')).toBe('system')
    expect(getModuleName('./modules/dashboard.ts')).toBe('dashboard')
  })
})
