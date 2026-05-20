# CCD 故障排查

## @ccd/core 无法解析 @ccd/contracts

可能原因：

- 内部包未先构建
- workspace 引用链未正确建立
- `ci:prepare-internal` 未执行

建议顺序：

```bash
pnpm ci:prepare-internal
pnpm build:ci
```

## TS6305 output file has not been built

通常说明 TypeScript 项目引用或构建顺序异常。

建议检查：

- 是否误改了 `tsconfig.json`
- 是否跳过了包构建
- 是否误用了全局路径映射

推荐修复：

```bash
pnpm ci:prepare-internal
pnpm type-check
```

## 治理产物同步失败

如果 CI 提示生成产物不同步，执行：

```bash
pnpm governance:refresh
pnpm governance:gate
```

然后提交对应产物更新。

不要手工修补 `docs/generated/**`、`.ai/generated/**` 或 `.ai/governance/api-snapshots/**`。

## Vercel 失败但 GitHub Actions 通过

常见原因：

- Vercel 使用了错误构建命令
- Vercel 实际执行了 `build:ci` 而不是 `vercel:build`

正确修复方向：

- 让 Vercel 回到 `pnpm vercel:build`
- 不要通过削弱治理来适配错误配置

## GitHub Actions 被取消

常见原因：

- 同分支新的 push 触发了并发策略
- PR 或分支级 CI 出现 `cancel-in-progress`

排查方向：

- 检查 CI 并发组配置
- 检查是否多次快速 push
- 检查是否误触发了新的 workflow run

## commitlint subject-full-stop 失败

说明提交信息末尾可能带了句号。

建议：

- 使用 `pnpm ccd:ship -- "type: message"`
- 保持 Conventional Commits 格式
- 避免末尾标点

## working tree clean no-op ship

这是正常行为。

`ccd:ship` 是幂等的：

- 如果校验后工作区已干净
- 它会成功退出
- 不会创建空提交

只有在明确需要空提交时，才使用 `--allow-empty`。
