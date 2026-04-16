import router from '@/router'
import { isDesktop } from '@/utils/env'
import { createWindowKey } from '@/utils/windowKey'
import {
  getDesktopRouteWindow,
  openDesktopRouteWindow,
  openExternalLink,
} from '@/utils/desktopWindow'
import type { LocationQueryRaw, RouteMeta } from 'vue-router'

export type WindowMode = NonNullable<RouteMeta['windowMode']>

export interface WindowAdapterRouteTarget {
  name?: string | null
  path: string
  meta?: Pick<RouteMeta, 'title' | 'windowMode' | 'reuseWindow'>
}

export interface WindowAdapterOpenEvent {
  key: string
  url: string
}

export interface WindowAdapterHandle {
  key: string
  kind: 'web' | 'desktop'
  focus: () => Promise<void>
}

export interface OpenRouteOptions {
  route: WindowAdapterRouteTarget
  query?: LocationQueryRaw
  mode?: WindowMode
  reuse?: boolean
  externalUrl?: string
  onOpened?: (event: WindowAdapterOpenEvent) => void
  onClosed?: (key: string) => void
}

type BrowserWindowHandle = Window
type DesktopWindowHandle = Awaited<ReturnType<typeof openDesktopRouteWindow>>

const browserRegistry = new Map<string, BrowserWindowHandle>()
const desktopRegistry = new Map<string, DesktopWindowHandle>()

function buildRouteUrl(
  route: WindowAdapterRouteTarget,
  query: LocationQueryRaw | undefined,
  key: string
) {
  const href = router.resolve({
    path: route.path,
    query: {
      ...(query ?? {}),
      _windowKey: key,
    },
  }).href

  if (isDesktop() || import.meta.env.VITE_ROUTER_MODE === 'hash') {
    return new URL(href, window.location.origin).toString()
  }

  return href
}

function getRouteKey(route: WindowAdapterRouteTarget, query?: LocationQueryRaw): string {
  return createWindowKey(String(route.name || route.path), query)
}

function createBrowserHandle(key: string, target: BrowserWindowHandle): WindowAdapterHandle {
  return {
    key,
    kind: 'web',
    focus: async () => {
      if (!target.closed) {
        target.focus()
      }
    },
  }
}

function createDesktopHandle(key: string, target: DesktopWindowHandle): WindowAdapterHandle {
  return {
    key,
    kind: 'desktop',
    focus: async () => {
      await target.show().catch(() => undefined)
      await target.unminimize().catch(() => undefined)
      await target.setFocus()
    },
  }
}

function registerBrowserWindow(
  key: string,
  target: BrowserWindowHandle,
  onClosed?: (key: string) => void
): WindowAdapterHandle {
  browserRegistry.set(key, target)

  try {
    target.addEventListener(
      'beforeunload',
      () => {
        browserRegistry.delete(key)
        onClosed?.(key)
      },
      { once: true }
    )
  } catch {
    // 浏览器已阻断或跨域跳转时无法挂载监听，忽略即可。
  }

  return createBrowserHandle(key, target)
}

function getBrowserWindow(key: string): BrowserWindowHandle | null {
  const target = browserRegistry.get(key)
  if (!target) {
    return null
  }

  if (target.closed) {
    browserRegistry.delete(key)
    return null
  }

  return target
}

async function getDesktopWindow(key: string): Promise<DesktopWindowHandle | null> {
  const cached = desktopRegistry.get(key)
  if (cached) {
    return cached
  }

  const target = await getDesktopRouteWindow(key)
  if (!target) {
    desktopRegistry.delete(key)
    return null
  }

  desktopRegistry.set(key, target)
  return target
}

async function openBrowserRouteWindow(
  key: string,
  url: string,
  reuse: boolean,
  onOpened?: (event: WindowAdapterOpenEvent) => void,
  onClosed?: (key: string) => void
): Promise<WindowAdapterHandle> {
  if (reuse) {
    const existing = getBrowserWindow(key)
    if (existing) {
      existing.focus()
      return createBrowserHandle(key, existing)
    }
  }

  const target = window.open(url, '_blank')
  if (!target) {
    throw new Error('[WindowAdapter] 浏览器阻止了新窗口打开。')
  }

  const handle = registerBrowserWindow(key, target, onClosed)
  onOpened?.({ key, url })
  return handle
}

async function openDesktopChildWindow(
  key: string,
  title: string,
  url: string,
  reuse: boolean,
  onOpened?: (event: WindowAdapterOpenEvent) => void,
  onClosed?: (key: string) => void
): Promise<WindowAdapterHandle> {
  if (reuse) {
    const existing = await getDesktopWindow(key)
    if (existing) {
      await existing.show().catch(() => undefined)
      await existing.unminimize().catch(() => undefined)
      await existing.setFocus()
      return createDesktopHandle(key, existing)
    }
  }

  const target = await openDesktopRouteWindow(
    {
      label: key,
      title,
      url,
    },
    () => {
      desktopRegistry.delete(key)
      onClosed?.(key)
    }
  )

  desktopRegistry.set(key, target)
  onOpened?.({ key, url })
  return createDesktopHandle(key, target)
}

async function resolveCurrentWindowFullscreen(): Promise<boolean> {
  if (isDesktop()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    return getCurrentWindow().isFullscreen()
  }

  return Boolean(document.fullscreenElement)
}

export const windowAdapter = {
  async openLink(url: string): Promise<void> {
    await openExternalLink(url)
  },

  async openRoute(options: OpenRouteOptions): Promise<void | WindowAdapterHandle> {
    const { route, query, externalUrl, onOpened, onClosed } = options
    const mode: WindowMode = options.mode ?? route.meta?.windowMode ?? 'current'

    if (mode === 'current') {
      await router.push({ path: route.path, query })
      return
    }

    if (mode === 'external') {
      const key = getRouteKey(route, query)
      const resolvedUrl =
        externalUrl || /^https?:\/\//.test(route.path)
          ? externalUrl || route.path
          : buildRouteUrl(route, query, key)
      await windowAdapter.openLink(resolvedUrl)
      return
    }

    const reuse = options.reuse ?? route.meta?.reuseWindow === true
    const key = getRouteKey(route, query)
    const url = buildRouteUrl(route, query, key)
    const title = String(route.meta?.title || route.name || route.path)

    if (isDesktop()) {
      try {
        return await openDesktopChildWindow(key, title, url, reuse, onOpened, onClosed)
      } catch (error) {
        console.warn('[WindowAdapter] 桌面子窗口打开失败，回退浏览器窗口：', error)
      }
    }

    return openBrowserRouteWindow(key, url, reuse, onOpened, onClosed)
  },

  async isFullscreen(): Promise<boolean> {
    return resolveCurrentWindowFullscreen()
  },

  async toggleFullscreen(): Promise<boolean> {
    if (isDesktop()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const appWindow = getCurrentWindow()
      const next = !(await appWindow.isFullscreen())
      await appWindow.setFullscreen(next)
      return next
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return false
    }

    await document.documentElement.requestFullscreen()
    return true
  },
}

export function useWindowAdapter() {
  const fullscreen = ref(false)
  const listeners: Array<() => void> = []

  const syncFullscreen = async (): Promise<boolean> => {
    try {
      const next = await windowAdapter.isFullscreen()
      fullscreen.value = next
      return next
    } catch (error) {
      console.warn('[WindowAdapter] 同步全屏状态失败：', error)
      fullscreen.value = false
      return false
    }
  }

  const toggleFullscreen = async (): Promise<boolean> => {
    const next = await windowAdapter.toggleFullscreen()
    fullscreen.value = next
    return next
  }

  onMounted(async () => {
    await syncFullscreen()

    if (typeof document !== 'undefined') {
      const handleWebFullscreenChange = () => {
        void syncFullscreen()
      }
      document.addEventListener('fullscreenchange', handleWebFullscreenChange)
      listeners.push(() => {
        document.removeEventListener('fullscreenchange', handleWebFullscreenChange)
      })
    }

    if (!isDesktop()) {
      return
    }

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const appWindow = getCurrentWindow()
      const unlistenResize = await appWindow.onResized(() => {
        void syncFullscreen()
      })
      const unlistenFocus = await appWindow.onFocusChanged(() => {
        void syncFullscreen()
      })

      listeners.push(unlistenResize, unlistenFocus)
    } catch (error) {
      console.warn('[WindowAdapter] 监听桌面窗口事件失败：', error)
    }
  })

  onUnmounted(() => {
    while (listeners.length > 0) {
      const dispose = listeners.pop()
      dispose?.()
    }
  })

  return {
    isFullscreen: readonly(fullscreen),
    openLink: windowAdapter.openLink,
    openRoute: windowAdapter.openRoute,
    refreshFullscreen: syncFullscreen,
    toggleFullscreen,
  }
}

export const useFullscreenAdapter = useWindowAdapter
