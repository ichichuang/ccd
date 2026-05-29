# 依赖与工具链现代化

## 目标

所有依赖升级必须单 lane、单分支/工作树、先官方文档与 targeted validation，再全量验证。

## 负责人建议

Toolchain Maintainer

## 问题清单

| ID       | Priority | Severity | Status                   | Paths                                                                                        | Problem                                                                                     | Best solution                                                                                         | Validation                                                       |
| -------- | -------- | -------- | ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| DEPS-001 | P2       | Medium   | BLOCKED_BY_APPROVAL      | package.json<br>pnpm-lock.yaml<br>apps/web-demo/package.json<br>apps/desktop/package.json    | Vite 7 -> Vite 8 是高风险 major lane，不能混入架构迁移。                                    | 独立 vite8 lane：官方迁移文档 review、config compatibility patch、build/e2e/budget 全套验证。         | pnpm build:ci && pnpm e2e:qa && pnpm budget:bundles              |
| DEPS-002 | P2       | Medium   | BLOCKED_BY_APPROVAL      | package.json<br>pnpm-lock.yaml                                                               | Vue tooling、TypeScript、vue-tsc、compiler-sfc 有升级面；会影响 type-check 与 SFC parsing。 | 单独 tooling lane；先 packages type-check，再 web-demo vue-tsc，再 full test/build。                  | pnpm type-check && pnpm test:run && pnpm build:ci                |
| DEPS-003 | P2       | Medium   | BLOCKED_BY_APPROVAL      | package.json<br>pnpm-lock.yaml<br>.github/workflows/ci.yml<br>playwright.config.ts           | Playwright 升级需同时处理 browser install/cache/CI artifact 策略。                          | 先完成 E2E suite 拆分和 artifact 上传，再独立升级 Playwright；记录浏览器版本和 snapshot drift。       | pnpm e2e:smoke && pnpm e2e:layout && pnpm e2e:visual             |
| DEPS-004 | P3       | Medium   | BLOCKED_BY_REVIEW        | package.json<br>packages/vue-primevue-adapter/**<br>packages/vue-ui/**<br>apps/web-demo/\*\* | PrimeVue 升级需要检查 v4 patch/minor API 与 adapter/PT/theme 行为。                         | 先完成 UI boundary policy 和 wrapper 迁移，再升级 PrimeVue；adapter tests + visual-token tests 必跑。 | pnpm --filter @ccd/vue-primevue-adapter build && pnpm e2e:visual |
| DEPS-005 | P3       | Medium   | BLOCKED_BY_HTTP_CONTRACT | package.json<br>apps/web-demo/src/utils/http/\*\*                                            | alova 升级前 HTTP contract/adapter tests 不完整。                                           | 先完成 HTTP policy 和 request focused tests，再升级 alova；不要与 Vite/PrimeVue 同 lane。             | request-layer tests && pnpm type-check && pnpm e2e:smoke         |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
