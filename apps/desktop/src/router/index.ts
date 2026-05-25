import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { desktopRoutes } from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes: desktopRoutes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

export function setupRouter(app: App): void {
  app.use(router)
}

export default router
