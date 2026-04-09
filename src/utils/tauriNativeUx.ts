/**
 * tauriNativeUx — 桌面端原生 UX 强化
 *
 * 在 Tauri 环境下注入以下行为，消除"浏览器感"：
 * 1. 屏蔽 F5 / Ctrl+R / Cmd+R 刷新（桌面应用不应支持页面刷新）
 * 2. 屏蔽浏览器原生右键菜单（由 ContextMenuProvider 接管）
 * 3. 禁止全局文本选中（保留输入框/代码块等可编辑区域）
 *
 * 调用时机：app.mount() 之后（需要 DOM 可用）
 * 清理方式：返回 cleanup 函数，可在测试或 HMR 中调用
 */

const NATIVE_STYLE_ID = '__tauri-native-ux'

/**
 * 屏蔽刷新快捷键：F5, Ctrl+R (Windows/Linux), Cmd+R (macOS)
 */
function handleKeydown(e: KeyboardEvent): void {
  // F5
  if (e.key === 'F5') {
    e.preventDefault()
    return
  }
  // Ctrl+R / Cmd+R / Ctrl+Shift+R / Cmd+Shift+R
  if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault()
  }
}

/**
 * 全局兜底：屏蔽浏览器原生右键菜单
 * 注意：ContextMenuProvider 已在其作用域内拦截 contextmenu，
 * 此处仅作为全局 fallback，防止未被 Provider 覆盖的区域弹出浏览器菜单。
 * 仅调用 preventDefault()，不调用 stopPropagation()，确保 ContextMenuProvider 仍可接收事件。
 */
function handleContextMenu(e: MouseEvent): void {
  e.preventDefault()
}

/**
 * 注入全局 user-select: none 样式，同时豁免可编辑/可复制区域
 */
function injectNoSelectStyle(): void {
  // 幂等：避免重复注入
  if (document.getElementById(NATIVE_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = NATIVE_STYLE_ID
  style.textContent = `
    *,
    *::before,
    *::after {
      -webkit-user-select: none;
      user-select: none;
    }

    input,
    textarea,
    [contenteditable],
    [contenteditable] *,
    code,
    pre,
    pre *,
    .selectable,
    .selectable * {
      -webkit-user-select: text;
      user-select: text;
    }
  `
  document.head.appendChild(style)
}

/**
 * 移除注入的样式
 */
function removeNoSelectStyle(): void {
  document.getElementById(NATIVE_STYLE_ID)?.remove()
}

/**
 * 初始化所有 Tauri 原生 UX 增强
 * @returns cleanup 函数 — 移除所有事件监听和注入的样式
 */
export function initTauriNativeUx(): () => void {
  // 事件监听（capture 阶段拦截，确保优先于组件级监听器）
  document.addEventListener('keydown', handleKeydown, { capture: true })
  document.addEventListener('contextmenu', handleContextMenu, { capture: true })

  // 样式注入
  injectNoSelectStyle()

  // 返回清理函数
  return () => {
    document.removeEventListener('keydown', handleKeydown, { capture: true })
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true })
    removeNoSelectStyle()
  }
}
