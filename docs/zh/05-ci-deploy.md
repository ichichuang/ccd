# CCD CI 与部署

## GitHub Actions 的职责

GitHub Actions 是质量门禁，不是最终部署产物的唯一构建器。

CI 主要承担：

- frozen install
- AI adapter materialization
- `pnpm governance:gate`
- 生成 adapter 同步检查
- typecheck
- tests
- lint
- production build
- desktop bundle guard
- e2e QA

本地语义：

- `pnpm build:ci` 复现 GitHub Actions 的 `Core Quality` job。
- `pnpm e2e:qa` 复现 `E2E QA` job 的 Playwright QA 命令族。
- `pnpm validate` 是完整本地门禁，覆盖 CI quality、E2E QA、依赖扫描证据、治理与桌面安全检查。

## Vercel 的职责

Vercel 是部署构建入口。

当前仓库配置为：

```text
installCommand: pnpm install --frozen-lockfile
buildCommand: pnpm vercel:build
outputDirectory: apps/web-demo/dist
```

## GitHub Pages 的职责

GitHub Pages 负责 `web-demo` 静态部署。

构建命令为：

```text
pnpm build:web-demo
```

并会注入：

```text
VITE_PUBLIC_PATH=/ccd/
```

## build:ci 与 vercel:build 的区别

### pnpm build:ci

这是面向 CI `Core Quality` job 的验证链路，不包含单独的 `E2E QA` job。需要完整本地门禁时运行 `pnpm validate`。

### pnpm vercel:build

这是面向 Vercel 的部署构建。

两者不应混用。

## 如果 Vercel 执行了 build:ci

这是错误现象。

正确做法是修复部署配置，让 Vercel 回到：

```bash
pnpm vercel:build
```

而不是通过削弱治理来“让构建通过”。

## 如果生成产物同步失败

如果 CI 报告生成产物不同步，优先执行：

```bash
pnpm governance:refresh
pnpm governance:gate
```

然后提交对应生成产物更新。

## 推荐阅读

- CI / 部署契约（英文 AI）：[docs/en/ci-deploy-contract.md](../en/ci-deploy-contract.md)
