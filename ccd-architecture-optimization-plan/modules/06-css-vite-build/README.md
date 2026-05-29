# CSS / Tokens / Vite Build

## 目标

减少全局 px-to-rem 脆弱性，保护 UnoCSS/PrimeVue 样式，隔离 Vite 8 迁移风险。

## 负责人建议

Build / Frontend Platform

## 问题清单

| ID        | Priority | Severity | Status              | Paths                                                                                                                            | Problem                                                                                                                  | Best solution                                                                                                                             | Validation                                                            |
| --------- | -------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| BUILD-001 | P1       | Medium   | OPEN                | apps/web-demo/vite.config.ts                                                                                                     | postcss-pxtorem 仍依赖 selectorBlackList 保护 UnoCSS 原子类，长 blacklist 脆弱。                                         | 保持 file-level exclude；逐步改为 token-first：CSS variables、design tokens、container queries、UnoCSS rules，减少全局 px-to-rem 转换面。 | pnpm build:web-demo && visual screenshots login/dashboard/table/chart |
| BUILD-002 | P2       | Medium   | BLOCKED_BY_APPROVAL | apps/web-demo/vite.config.ts<br>apps/web-demo/build/\*\*<br>packages/vue-ui/vite.config.ts<br>packages/vue-charts/vite.config.ts | Vite 8 迁移风险面大：esbuildOptions、esbuild.drop/pure、Rollup manualChunks、experimentalMinChunkSize、minify、plugins。 | 独立 branch/worktree；先 inventory 官方文档，再逐项替换/验证；不得和 UI/HTTP/依赖升级混合。                                               | pnpm build:ci && pnpm e2e:qa && bundle budgets on isolated lane       |
| BUILD-003 | P2       | Medium   | OPEN                | apps/web-demo/build/plugins.ts<br>apps/web-demo/build/compress.ts<br>apps/web-demo/build/performance.ts                          | build plugins 与 Vite major migration 强耦合，ECharts treeshake/compression/progress/visualizer 都需复核。               | 为每个 plugin 写 compatibility note：是否必须保留、是否迁到 deploy/CDN、是否有 measurable value；移除无价值 progress plugin。             | pnpm build:web-demo && pnpm budget:bundles                            |
| BUILD-004 | P2       | Low      | OPEN                | apps/web-demo/vite.config.ts                                                                                                     | Vite config 中 scss preprocessorOptions 使用 as any，是配置层类型逃逸。                                                  | 查看 Vite/Sass 类型定义，替换为 satisfies/明确类型或局部 typed helper；避免扩大 any。                                                     | pnpm --filter @ccd/web-demo type-check && pnpm build:web-demo         |
| BUILD-005 | P2       | Low      | OPEN                | apps/web-demo/vite.config.ts                                                                                                     | server.open / preview.open 默认为 true，不适合 CI/Playwright server。                                                    | 按 env/CI 判断 open:false；本地 dev 可保留自动打开，Playwright/CI 禁止。                                                                  | pnpm e2e:smoke && pnpm --filter @ccd/web-demo dev smoke               |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
