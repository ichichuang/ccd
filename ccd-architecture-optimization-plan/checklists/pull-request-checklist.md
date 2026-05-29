# Pull Request Checklist

- [ ] PR 只包含一个 lane。
- [ ] PR 描述包含 issue IDs。
- [ ] 所有改动路径都在计划文档中列明。
- [ ] 验证命令和结果已贴出。
- [ ] 如果 generated artifacts 变化，说明官方命令来源。
- [ ] 如果 snapshot 变化，说明是修复真实布局还是接受新 baseline。
- [ ] 如果触发 approval gate，附上 ADR 或 owner/operator signoff。
- [ ] 没有 dependency/Vite/auth/GitHub/P4 范围偷渡。
