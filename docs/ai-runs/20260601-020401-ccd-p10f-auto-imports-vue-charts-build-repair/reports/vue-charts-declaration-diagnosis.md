# @ccd/vue-charts 声明文件诊断报告（P10f）

## 基本信息

| 字段 | 值 |
| --- | --- |
| package_name | `@ccd/vue-charts` |
| classification | **BUILD_OUTPUT_PREPARATION_REQUIRED** |

## package_json_exports

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "default": "./dist/index.js"
  }
}
```

## package_json_types

```json
"types": "./dist/index.d.ts"
```

## dist 状态

| 检查项 | build 前（dist 缺失） | build 后 |
| --- | --- | --- |
| dist_exists | **否** | **是** |
| dist_declaration_exists | **否** | **是**（`dist/index.d.ts` + 子目录 `.d.ts`） |

## build_command

```bash
pnpm --filter @ccd/vue-charts build
# 等价于：
# vite build --config vite.config.ts && vue-tsc -p tsconfig.build.json
```

`tsconfig.build.json` 启用 `declaration: true`、`emitDeclarationOnly: true`、`outDir: dist`。

## web_demo_resolution_path

- 依赖：`apps/web-demo` → `@ccd/vue-charts`（workspace）
- 类型解析：`package.json` `exports["."].types` → `packages/vue-charts/dist/index.d.ts`
- `pnpm build:web-demo` 经 `build:shared-config` → `@ccd/vue-charts build`，故完整 build 链可解析

## 失败复现

删除 `packages/vue-charts/dist` 后直接 `vue-tsc`：

```
error TS2307: Cannot find module '@ccd/vue-charts' or its corresponding type declarations.
```

（P10e 报告的 TS7016 与本路径一致：dist 声明文件未就绪。）

## root_cause

`@ccd/vue-charts` 的类型声明由 **package build** 产出（`vue-tsc -p tsconfig.build.json`），非源码直出。
当 `dist/` 未构建或被清理时，web-demo 的 `vue-tsc` 无法解析 `@ccd/vue-charts`。

## required_fix

**无需源码/配置/manifest 变更。** 执行标准内部包构建准备即可：

```bash
pnpm --filter @ccd/vue-charts build
# 或
pnpm ci:prepare-internal
# 或
pnpm build:web-demo   # 已含 build:shared-config → vue-charts build
```

## manifest_change_required

**否**

## runtime_source_changed

**否**

## recommendation

1. 分类为 **BUILD_OUTPUT_PREPARATION_REQUIRED**。
2. CI / 本地验证应确保 `ci:prepare-internal` 或 `build:shared-config` 在 web-demo type-check/build 之前运行。
3. P10f 验证：`pnpm build:web-demo` **通过**（exit 0）。

## 日志

`command-logs/phase3-vue-charts.log`
