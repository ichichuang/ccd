import { describe, expect, it } from 'vitest'
import exampleRoutes from './example'

const systemConfigurationRouteNames = [
  'ExampleSystemConfigurationTheme',
  'ExampleSystemConfigurationSize',
  'ExampleSystemConfigurationUnocss',
  'ExampleSystemConfigurationBreakpoints',
  'ExampleSystemConfigurationLayout',
]

function findRouteByName(routes: RouteConfig[], name: string): RouteConfig | undefined {
  for (const route of routes) {
    if (route.name === name) return route
    if (route.children) {
      const child = findRouteByName(route.children, name)
      if (child) return child
    }
  }
  return undefined
}

describe('example system configuration routes', () => {
  it('opens each system configuration child as a reusable fullscreen window', () => {
    systemConfigurationRouteNames.forEach(routeName => {
      const route = findRouteByName(exampleRoutes, routeName)

      expect(route?.meta?.parent).toBe('fullscreen')
      expect(route?.meta?.reuseWindow).toBe(true)
    })
  })
})
