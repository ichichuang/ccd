# CCD Desktop 架构索引

## 基座架构参考

本文件不再展开 Vue 3、Pinia、UnoCSS、ProTable、ProForm、通用 API 分层等 Web 基座内容。

- 通用 Web 架构：参考 `main` 分支
  - <https://github.com/ichichuang/ccd/blob/main/README.md>
  - <https://github.com/ichichuang/ccd/blob/main/docs/architecture.md>
- 当前分支文档目标：只解释 Tauri 桌面端的增量实现与治理边界

换句话说，`main` 负责“基座”，`feat/tauri-integration` 负责“桌面壳”。

---

## 当前分支真正负责什么

### 1. 跨端窗口桥接

- 统一出口：`src/utils/windowAdapter.ts`
- 底层桌面实现：`src/utils/desktopWindow.ts`
- 职责：
  - 新开子窗口
  - 外链唤起系统浏览器
  - 原生全屏切换
  - Web / Tauri 差异抹平

### 2. Tauri 安全沙箱

- 权限白名单：`src-tauri/capabilities/default.json`
- 安全策略：`src-tauri/tauri.conf.json`
- 关注点：
  - Capability 最小化
  - Shell 打开协议限制
  - CSP 严格闭环
  - 禁止内联脚本与内联事件

### 3. 环境探针与渲染降级

- 环境探针：`src/utils/env.ts`
- 动画降级：`src/layouts/components/AnimateRouterView.vue`
- 关注点：
  - 仅在桌面端触发 Tauri 相关分支
  - WebView 中避免高成本 `blur` 动画
  - 保持 Web / Desktop 行为一致但性能策略不同

### 4. 桌面交付与漂移治理

- 版本同步：`pnpm sync:version`
- 桌面配置同步：`pnpm sync:desktop-config`
- 漂移检查：`pnpm check:drift`
- AI 治理同步：`pnpm ai:sync`

---

## 桌面增量地图

| 主题           | 关键文件                                                      | 说明                                                   |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| 窗口适配器     | `src/utils/windowAdapter.ts`                                  | `openRoute`、`openLink`、`toggleFullscreen` 的统一入口 |
| 桌面原生窗口   | `src/utils/desktopWindow.ts`                                  | `WebviewWindow`、外链限制、窗口状态持久化              |
| 环境探针       | `src/utils/env.ts`                                            | `isDesktop()` / `isTauri()` 的集中探测                 |
| 动画降级       | `src/layouts/components/AnimateRouterView.vue`                | 桌面端将 `cinematic-fade` 降级为 `fade-slide`          |
| Tauri 权限     | `src-tauri/capabilities/default.json`                         | Capability 最小白名单                                  |
| Tauri 安全配置 | `src-tauri/tauri.conf.json`                                   | CSP、`beforeDevCommand`、`shell.open` 协议收紧         |
| Rust 入口      | `src-tauri/src/main.rs`、`src-tauri/src/lib.rs`               | 桌面运行时入口与 debug 插件日志                        |
| 配置同步       | `scripts/sync-version.mjs`、`scripts/sync-desktop-config.mjs` | package、Cargo、tauri.conf 一致性                      |

---

## 分支协作规则

- 不要在桌面分支里复制主分支的大段通用架构文档
- 不要把业务代码直接绑定到原始 Tauri API；先经过 `windowAdapter`
- 不要新增宽泛 Capability；先证明业务真实需要
- 不要把高成本视觉效果直接搬进 Tauri WebView；先评估桌面端帧率
- 不要手改生成层；AI 兼容适配一律通过 `pnpm ai:sync`

---

## 推荐阅读

1. [README.md](../README.md)
2. [docs/desktop-guide.md](./desktop-guide.md)
3. [docs/ai-workspace.md](./ai-workspace.md)
4. [docs/codex/quickstart.md](./codex/quickstart.md)

如果你需要理解 CCD 的完整基座，再回到 `main` 分支文档。
