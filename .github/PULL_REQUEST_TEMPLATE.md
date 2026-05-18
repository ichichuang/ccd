## 📝 PR 描述 (Description)

请简要描述此 PR 解决的问题或新增的功能。如果关联了具体的 Issue，请使用 `Fixes #Issue号` 的格式。

## 🛠️ 变更类型 (Type of change)

- [ ] 🐛 Bug 修复 (Bug fix)
- [ ] ✨ 新功能 (New feature)
- [ ] ♻️ 代码重构 (Refactoring)
- [ ] 🚀 性能优化 (Performance improvement)
- [ ] 📚 文档更新 (Documentation update)

## 🛡️ 自检清单 (Checklist)

提交 PR 前，请确保你已经完成了以下自检：

- [ ] 我已经阅读并遵循了项目的架构与编码规范。
- [ ] 我在本地成功运行了 `pnpm governance:gate`。
- [ ] 我在本地成功运行了 `pnpm type-check` 且零报错。
- [ ] 我在本地成功运行了 `pnpm lint:check`。
- [ ] 如更新 `.ai/governance/**`、`docs/generated/**` 或公共 exports，我已提交同步后的生成物。
- [ ] 如更新视觉快照，我已用 `pnpm e2e:update` 单独生成并审查 baseline，CI 仅运行验证不会自动更新快照。
- [ ] 我的代码变更没有引入新的警告（Console warnings）。

## 📎 补充说明 (Additional context)

如果有需要评审者特别注意的代码逻辑或视觉 UI 变更截图，请补充在这里。
