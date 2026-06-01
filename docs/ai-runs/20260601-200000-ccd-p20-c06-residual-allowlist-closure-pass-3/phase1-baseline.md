# Phase 1 Baseline — P20 C-06 Residual Allowlist Closure Pass 3

Captured: 2026-06-01

## Git state

| Check                     | Result     |
| ------------------------- | ---------- |
| Branch                    | `main`     |
| HEAD                      | `e0135e10` |
| origin/main               | `e0135e10` |
| Working tree              | clean      |
| `.cursor` at repo root    | absent     |
| Root duplicate repair log | absent     |
| `git diff --check`        | pass       |

## Recent commits

```
e0135e10 refactor(primevue): 继续收敛 C-06 残余白名单引用
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
```

## Baseline validation

- `pnpm ai:guard -- --format=json`: PASS (6 exact allowlist rows)
- `pnpm validate:governance`: PASS

## Baseline exact allowlist (6 rows)

From `approvedPrimeVueAppImportFiles` in `scripts/ai-architecture-guard.mjs`:

1. `apps/desktop/src/plugins/index.ts`
2. `apps/web-demo/build/plugins.ts`
3. `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
4. `apps/web-demo/src/plugins/modules/primevue.ts`
5. `apps/web-demo/src/types/components.d.ts`
6. `apps/web-demo/src/views/example/hooks/use-app-element-size.vue`
