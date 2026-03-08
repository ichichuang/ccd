// @ts-nocheck
import type { UserConfig } from '@commitlint/types'

/**
 * Commitlint 配置文件
 * 规范 git commit 提交信息的格式
 * 格式要求：<type>(<scope>): <subject>
 */
const configuration: UserConfig = {
  // 继承默认的 conventional 配置
  extends: ['@commitlint/config-conventional'],

  rules: {
    // -------------------- 类型规则 (Type) --------------------
    // type-enum: 提交类型枚举，必须是以下列表中的一个
    'type-enum': [
      2, // 2 = 错误级别 (Error)
      'always',
      [
        'feat', // ✨ 新功能 (feature)
        'fix', // 🐛 修复 Bug
        'docs', // 📝 文档变更 (documentation)
        'style', // 💄 代码格式 (不影响代码运行的变动，空格、格式化等)
        'refactor', // ♻️ 代码重构 (既不是新增功能也不是修改 bug 的代码变动)
        'perf', // ⚡️ 性能优化 (Performance)
        'test', // ✅ 测试相关 (添加缺失的测试或更正现有的测试)
        'build', // 📦 构建系统或外部依赖项的变更 (如: webpack, npm, vite)
        'ci', // 👷 持续集成配置文件的变更 (如: GitHub Actions, Travis)
        'chore', // 🔧 杂务/其他 (不修改源代码或测试文件的变更)
        'revert', // ⏪ 撤销某次提交
        'wip', // 🚧 开发中 (Work In Progress)
        'release', // 🔖 发布版本
        'workflow', // 🔄 工作流变更
        'types', // 🏷️ 类型定义文件变更 (*.d.ts)
      ],
    ],
    // type-case: 类型必须小写 (例如: feat 而不是 Feat)
    'type-case': [2, 'always', 'lower-case'],
    // type-empty: 类型不能为空
    'type-empty': [2, 'never'],

    // -------------------- 作用域规则 (Scope) --------------------
    // scope-enum: 已移除硬编码目录限制，允许灵活填写作用域

    // scope-case: 作用域必须小写 (例如: feat(auth): ...)
    'scope-case': [2, 'always', 'lower-case'],
    // scope-empty: 作用域允许为空 (0 = disable，有些全局修改不需要 scope)
    'scope-empty': [0],

    // -------------------- 主题/描述规则 (Subject) --------------------
    // subject-empty: 描述不能为空
    'subject-empty': [2, 'never'],
    // subject-full-stop: 描述结尾不加句号
    'subject-full-stop': [2, 'never', '.'],
    // subject-case: 描述大小写不做强制限制 (方便写中文描述)
    'subject-case': [0],
    // subject-max-length: 描述最大长度放宽到 100 字符，避免被截断
    'subject-max-length': [2, 'always', 100],

    // -------------------- 头部/正文规则 (Header/Body) --------------------
    // header-max-length: 整个头部 (type + scope + subject) 最大长度
    'header-max-length': [2, 'always', 100],

    // body-leading-blank: 正文 (Body) 和 头部 (Header) 之间必须有空行
    'body-leading-blank': [2, 'always'],
    // footer-leading-blank: 页脚 (Footer) 和 正文 (Body) 之间必须有空行
    'footer-leading-blank': [2, 'always'],
  },

  // -------------------- 忽略规则 --------------------
  // 匹配以下模式的提交信息将跳过 lint 检查
  ignores: [
    commit => commit.includes('WIP'), // 忽略包含 WIP 的提交
    commit => commit.includes('wip'), // 忽略包含 wip 的提交
    commit => /^Merge/.test(commit), // 忽略合并提交
    commit => /^Initial commit/.test(commit), // 忽略初始化提交
    commit => /^v\d+\.\d+\.\d+/.test(commit), // 忽略版本发布提交 (如: v1.0.0)
  ],

  // 默认忽略自动生成的合并提交
  defaultIgnores: true,
}

export default configuration
