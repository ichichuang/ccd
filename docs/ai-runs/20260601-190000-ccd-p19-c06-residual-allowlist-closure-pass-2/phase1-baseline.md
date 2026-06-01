# P19 Phase 1 — Baseline

Lane: P19 C-06 residual PrimeVue allowlist closure pass 2
Timestamp dir: 20260601-190000-ccd-p19-c06-residual-allowlist-closure-pass-2

## Pre-P19 P18b reconciliation

- `git fetch origin main`: branch main -> FETCH_HEAD (clean fetch).
- `git branch --show-current`: `main`.
- `git rev-parse --short HEAD`: `517b15b1`.
- `git rev-parse --short origin/main`: `517b15b1`.
- `git log --oneline origin/main..HEAD`: empty (no unpushed commits).
- P18b status: `P18B_ALREADY_PUSHED` (origin/main already equals 517b15b1; P17 `f1880c1e` and P18 `517b15b1` are present on origin/main).
- P18b authorization phrase "Authorize P18b push to origin/main." not present, but push is moot because remote already matches HEAD.
- P19 gate satisfied: P17/P18 are pushed.

## Baseline git state

- branch: `main`
- HEAD: `517b15b1`
- origin/main: `517b15b1`
- `git status --short --untracked-files=all`: clean
- `repo_root_cursor_absent`
- `root_duplicate_absent`
- `git diff --check`: clean (exit 0)

## Baseline log (top 12)

```
517b15b1 docs(governance): 收敛 G-02 修复台账延期债务
f1880c1e refactor(primevue): 收敛 C-06 残余直接引用白名单
cc813fe3 docs(architecture): 补充 P16c 提交后验证日志
8ffce7c0 docs(architecture): 修正 P16a 远程已推送后的状态面措辞
d53aa9c3 docs(architecture): 修正 P16 条件通过状态与残余债务表述
f86b3bb0 docs(architecture): P16 最终对账 CONDITIONAL_GO
12f71e0a docs(architecture): P15 修复台账 owner 接受延期债务
ebb89829 docs(architecture): P14 E4 生成类型与 resolver 边界审查
15b785b8 refactor(primevue): P14 E2 菜单类型门面与 dashboard 按钮迁移
91cfc956 refactor(primevue): P14 E1 适配器层 tooltip 与 toast 图标门面
94c99ebe docs(architecture): P13 批准 Option E 分阶段 PrimeVue 白名单缩减
f0fc41ca docs(architecture): 稳定远程状态面对账表述避免自漂移
```

## Baseline validation results

- `pnpm docs:commands`: PASS (279 files scanned).
- `pnpm ai:doctor`: PASS (token contrast advisories only, decorativeMode=warn).
- `pnpm ai:doctor --open`: 78 open tasks (matches accepted P18 state).
- `pnpm ai:guard -- --format=json`: PASS `{ "ok": true, "mode": "full", "findings": [] }`.
- `pnpm validate:governance`: PASS (unified governance gate passed; generated artifacts in sync, working tree remained clean afterward).

## C-06 exact allowlist baseline (approvedPrimeVueAppImportFiles)

Count = 7:

1. apps/desktop/src/plugins/index.ts
2. apps/web-demo/build/plugins.ts
3. apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue
4. apps/web-demo/src/plugins/modules/primevue.ts
5. apps/web-demo/src/types/components.d.ts
6. apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue
7. apps/web-demo/src/views/example/hooks/use-app-element-size.vue

No baseline STOP condition triggered.
