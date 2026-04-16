<div align="center">

# CCD Desktop

> `feat/tauri-integration` 是 CCD 的 Tauri 桌面交付分支。通用 Web 架构请回看 `main` 分支；本分支文档只讨论桌面端增量能力与治理。

[main 基座 README](https://github.com/ichichuang/ccd/blob/main/README.md) · [main 基座架构](https://github.com/ichichuang/ccd/blob/main/docs/architecture.md) · [桌面架构索引](./docs/architecture.md) · [桌面开发白皮书](./docs/desktop-guide.md)

</div>

---

## 基座架构参考

桌面分支不再重复解释 Vue 3、Pinia、UnoCSS、ProTable、ProForm、Web 渲染管线等通用能力。

- 通用 Web 架构规范：统一参考 `main` 分支的 `README.md` 与 `docs/architecture.md`
- 当前分支文档范围：仅覆盖 Tauri 跨端实现、OS 级适配、安全沙箱、渲染降级、构建调试与漂移治理
- 如果改动属于通用能力，应先在 `main` 分支演进，再合并回当前桌面分支

---

## 文档入口

| 文档                                                   | 用途                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| [docs/architecture.md](./docs/architecture.md)         | 桌面分支职责边界、目录索引、治理边界                       |
| [docs/desktop-guide.md](./docs/desktop-guide.md)       | 桌面端开发主手册：窗口适配器、安全沙箱、环境探针、构建调试 |
| [docs/ai-workspace.md](./docs/ai-workspace.md)         | AI 工作区、同步链路、浏览器自动化与清理策略                |
| [docs/codex/quickstart.md](./docs/codex/quickstart.md) | Codex 日常使用、技能路由、低 token 工作流                  |
| [.ai/README.md](./.ai/README.md)                       | `.ai/**` 规范源说明                                        |

推荐阅读顺序：

1. `README.md`
2. `docs/architecture.md`
3. `docs/desktop-guide.md`
4. `docs/ai-workspace.md`
5. `docs/codex/quickstart.md`

---

## 快速开始

### 环境要求

| 工具         | 版本                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| Node.js      | `>= 22.12.0`                                                             |
| pnpm         | `>= 10.0.0`                                                              |
| Rust / Cargo | 以 [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/) 为准 |

### 安装与同步

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
git checkout feat/tauri-integration
pnpm install
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```

### 启动桌面开发

```bash
pnpm dev:desktop
```

执行链路：

- `predev` 先运行 `pnpm sync:version && pnpm sync:desktop-config`
- `tauri dev` 再按照 `src-tauri/tauri.conf.json` 的 `beforeDevCommand` 启动 `pnpm dev`
- Vite 前端运行在 `http://localhost:8088`
- Tauri 主窗口附着该地址并加载 Rust 后端插件

### 构建桌面安装包

```bash
pnpm build:desktop
```

执行链路：

- `prebuild` 先运行 `pnpm sync:brand && pnpm sync:version && pnpm sync:desktop-config`
- `tauri build` 使用 `pnpm build` 产出前端静态资源
- Rust 侧再完成打包、签名与平台产物装配

---

## 桌面分支日常命令

```bash
pnpm dev:desktop         # Tauri 桌面开发
pnpm build:desktop       # Tauri 安装包构建
pnpm dev                 # 仅调试前端 Vite
pnpm tauri               # 直接使用 Tauri CLI
pnpm sync:version        # 同步 package.json -> Cargo / tauri.conf
pnpm sync:desktop-config # 同步 devUrl / 调试地址
pnpm check:drift         # 检查桌面端配置漂移
pnpm ai:sync             # 同步 AGENTS.md / .cursor 适配层
pnpm ai:sync:codex       # 安装本机 Codex skills
pnpm ai:doctor           # 检查 AI 治理资产与门禁自检
pnpm codex:preflight     # 检查 Codex 本地前置条件
```

---

## 桌面分支治理原则

- `.ai/**` 是唯一规范源，`AGENTS.md` 与 `.cursor/**` 只是生成适配层
- 桌面桥接统一走 `src/utils/windowAdapter.ts`，业务层不要直接调用原始 Web 或 Tauri 窗口 API
- 权限与 CSP 变更必须同时更新 `src-tauri/capabilities/default.json` 与 `src-tauri/tauri.conf.json`
- 性能敏感动画必须考虑 Tauri WebView，不得默认引入高成本 `blur` 滤镜方案
- 提交前至少跑 `pnpm type-check`、`pnpm ai:doctor`、`pnpm check:drift`

---

## 贡献

提交前请至少保证：

1. 遵守 [Conventional Commits](https://www.conventionalcommits.org/)
2. 本地通过 `pnpm type-check`
3. 本地通过 `pnpm ai:doctor`
4. 如修改 `.ai/**`，执行 `pnpm ai:sync` 与 `pnpm ai:sync:codex`
5. 如修改 `src-tauri/**`、桌面桥接或版本配置，执行 `pnpm sync:version`、`pnpm sync:desktop-config`、`pnpm check:drift`

---

## 许可证

[GNU General Public License v3.0](./LICENSE)
