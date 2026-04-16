import { isTauri } from '@/utils/env'

interface TauriRouteWindow {
  label: string
  once<T>(event: string, handler: (event: T) => void): Promise<() => void>
  show(): Promise<void>
  unminimize(): Promise<void>
  setFocus(): Promise<void>
}

interface DesktopRouteWindowOptions {
  label: string
  title: string
  url: string
}

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['http:', 'https:'])

function normalizeExternalHttpUrl(url: string): string {
  const normalizedUrl = url.trim()
  const parsedUrl = new URL(normalizedUrl)

  if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error(`[DesktopWindow] 不允许打开非 HTTP(S) 外链: ${parsedUrl.protocol}`)
  }

  return parsedUrl.toString()
}

async function persistDesktopWindowState(): Promise<void> {
  if (!isTauri()) {
    return
  }

  try {
    const { StateFlags: stateFlags, saveWindowState } =
      await import('@tauri-apps/plugin-window-state')
    await saveWindowState(stateFlags.ALL)
  } catch (error) {
    console.warn('[DesktopWindow] 保存窗口状态失败:', error)
  }
}

export async function openExternalLink(url: string): Promise<void> {
  const safeUrl = normalizeExternalHttpUrl(url)

  if (isTauri()) {
    const { open } = await import('@tauri-apps/plugin-shell')
    await open(safeUrl)
    return
  }

  window.open(safeUrl, '_blank', 'noopener,noreferrer')
}

export async function getDesktopRouteWindow(label: string): Promise<TauriRouteWindow | null> {
  if (!isTauri()) {
    return null
  }

  const { WebviewWindow: webviewWindow } = await import('@tauri-apps/api/webviewWindow')
  return webviewWindow.getByLabel(label) as Promise<TauriRouteWindow | null>
}

export async function focusDesktopRouteWindow(label: string): Promise<boolean> {
  const existing = await getDesktopRouteWindow(label)
  if (!existing) {
    return false
  }

  await existing.show().catch(() => undefined)
  await existing.unminimize().catch(() => undefined)
  await existing.setFocus()
  await persistDesktopWindowState()
  return true
}

export async function openDesktopRouteWindow(
  options: DesktopRouteWindowOptions,
  onDestroyed?: () => void
): Promise<TauriRouteWindow> {
  const { WebviewWindow: webviewWindow } = await import('@tauri-apps/api/webviewWindow')
  const desktopWindow = new webviewWindow(options.label, {
    title: options.title,
    url: options.url,
    visible: true,
    focus: true,
    resizable: true,
    center: true,
  }) as TauriRouteWindow

  await desktopWindow.once('tauri://created', () => {
    void persistDesktopWindowState()
  })
  await desktopWindow.once('tauri://error', event => {
    console.error('[DesktopWindow] 创建桌面子窗口失败:', event)
  })

  if (onDestroyed) {
    await desktopWindow.once('tauri://destroyed', () => {
      onDestroyed()
      void persistDesktopWindowState()
    })
  }

  return desktopWindow
}
