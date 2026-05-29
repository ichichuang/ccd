# E2E QA 与 CI 反馈链路 — Issue Details

## E2E-001

- Priority: `P0`
- Severity: `Critical`
- Status: `DONE`

### Paths

- `package.json`
- `playwright.config.ts`
- `.github/workflows/ci.yml`

### Problem

E2E QA 内部包准备重复触发：workflow step、root e2e:qa script、Playwright webServer.command 都运行 ci:prepare-internal。

### Best solution

拆分 e2e:qa 与 e2e:qa:prepared；CI 先运行一次 pnpm ci:prepare-internal，然后执行 prepared suite；Playwright webServer.command 不再构建内部包。

### Validation

```bash
pnpm ci:prepare-internal && pnpm e2e:qa:prepared
```

## E2E-002

- Priority: `P0`
- Severity: `High`
- Status: `DONE`

### Paths

- `playwright.config.ts`
- `package.json`

### Problem

Playwright 固定 fullyParallel:false、workers:1，全部 QA 串行，视觉测试策略拖慢所有 smoke。

### Best solution

拆四类 suite：e2e:smoke 并发 2-4 workers；e2e:perf 单 worker；e2e:layout 1-2 workers；e2e:visual 单 worker。视觉截图和性能预算继续串行，普通 smoke 并发。

### Validation

```bash
pnpm e2e:smoke && pnpm e2e:perf && pnpm e2e:layout && pnpm e2e:visual
```

## E2E-003

- Priority: `P0`
- Severity: `High`
- Status: `DONE`

### Paths

- `e2e/layout-runtime-geometry.spec.ts`
- `packages/vue-ui/src/CScrollbar/**`
- `apps/web-demo/src/layouts/**`

### Problem

CScrollbar scroll memory 测试失败：刷新后 after900Ms 为 0，说明滚动恢复或测试 fixture 存在真实问题。

### Best solution

开 focused lane：先用 trace/DOM metrics 定位 host scroll element 与 memory key，再修 CScrollbar restore 时序或测试 spacer fixture；禁止直接放宽断言。

### Validation

```bash
pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts -g "AppContainer CScrollbar restores persisted scroll memory smoothly after refresh"
```

## E2E-004

- Priority: `P0`
- Severity: `High`
- Status: `DONE`

### Paths

- `e2e/qa-regression.spec.ts`
- `e2e/__snapshots__/qa-regression.spec.ts/qa-dashboard-desktop.png`
- `apps/web-demo/src/views/dashboard/**`
- `apps/web-demo/src/layouts/**`

### Problem

dashboard visual baseline 高度不匹配：expected 986x549，actual 986x2194；可能是真实 layout 变化或 snapshot stale。

### Best solution

先记录 DOM geometry 和 layout CSS 变更原因；如果真实布局正确，按官方命令更新 snapshot；如果布局错误，修 dashboard/layout 高度约束。

### Validation

```bash
pnpm exec playwright test e2e/qa-regression.spec.ts -g "visual baselines catch silent layout collapse"
```

## E2E-005

- Priority: `P0`
- Severity: `High`
- Status: `DONE`

### Paths

- `apps/web-demo/src/components/ProTable/**`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/**`

### Problem

production table-heavy 诊断显示 .p-datatable height 0，A/B 已证明不是 pxtorem patch 引入。

### Best solution

已通过 dev/prod 浏览器几何诊断确认 `.p-datatable`、table container、tbody、row 都是非零高，并补充 E2E 回归断言。

### Validation

```bash
pnpm build:web-demo && production preview geometry check && pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts -g "ProTable basic route keeps a non-zero table geometry"
```

## E2E-006

- Priority: `P1`
- Severity: `Medium`
- Status: `DONE`

### Paths

- `e2e/helpers/app.ts`
- `e2e/*.spec.ts`

### Problem

大量测试重复 loginAsAdmin、gotoVisual、waitForAppReady、waitForRuntimeLoadingIdle，导致每个 case 重复 app boot/login。

### Best solution

引入 authenticated storageState fixture；对只需登录态的测试直接复用；保留少量 auth-flow 专测覆盖 login/logout。

### Validation

```bash
pnpm e2e:smoke
```

## E2E-007

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `.github/workflows/ci.yml`

### Problem

CI 每次安装 Playwright Chromium with deps，且没有上传 Playwright test-results/html-report artifacts。

### Best solution

增加 Playwright browser cache 或使用 actions/cache；失败时 upload test-results、playwright-report、trace/video/screenshot artifacts。

### Validation

```bash
GitHub Actions dry run / PR check
```

## E2E-008

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `playwright.config.ts`

### Problem

CI retries=2 会把确定性失败放大为更慢失败。

### Best solution

已将 Playwright 全局 retries 调整为 0，并将 visual/layout/smoke 分离；真实失败 suite 不重试。

### Validation

```bash
pnpm e2e:smoke && pnpm e2e:layout
```
