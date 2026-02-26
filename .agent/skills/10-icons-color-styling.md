---
description: Icons 颜色定制与 class 权重覆盖
globs: **/*.vue, **/*.tsx
---

# Skill 10：Icons 颜色定制（颜色不生效时）

## Goal

当 Icons 组件通过 `class` 设置的颜色/opacity 不生效时，按本技能决策表选择修复方案。

## Pre-check（强制）

- `@docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3、§6.3.1、§6.3.2、§2.7.1
- `@.cursor/rules/18-components-and-icons.mdc` 或 `@.agent/rules/10-ui-architecture.md` §4.1

## 根因速查

1. Icons 未传 `color` 时会自动添加 `text-foreground`，与自定义 class 冲突
2. 在 PrimeVue（Menubar、Dropdown 等）内时，父级样式权重更高
3. 多个颜色类特异性相同，生效顺序非 deterministic

## 决策表（按优先级）

| 场景                           | 方案                  | 示例                                      |
| ------------------------------ | --------------------- | ----------------------------------------- |
| 需强制覆盖，且可接受内联样式   | 使用 `color` prop     | `color="rgb(var(--primary))"`             |
| 需用 class 覆盖                | 颜色/opacity 类加 `!` | `class="text-primary! opacity-100!"`      |
| hover / group-hover 颜色不生效 | 状态类加 `!`          | `group-hover:text-primary-hover!`         |
| 需与父级文字同色               | `text-current`        | `class="text-current"`                    |
| 自定义 `i-custom:*` 图标       | 同上                  | 同样 inject fill="currentColor"，规则相同 |

## 步骤

1. **判断场景**：Icons 是否在 PrimeVue 或样式权重较高的父级内？
2. **选择方案**：优先 `color` prop；若必须用 class，则加 `!`
3. **检查 opacity**：若 `opacity-*` 也被覆盖，同样加 `!`
4. **验证**：浏览器检查图标最终颜色是否生效

## Icons 与 transition（hover/group-hover 时）

当 Icons 使用 `group-hover:`、`hover:` 颜色/透明度类时，**transition 必须写在 Icons 的 class 上**，父容器 transition 无效。示例：`class="transition-colors duration-scale-md group-hover:text-primary-hover!"`。hover 用 primary-hover；品牌**静态**颜色可用 `text-primary!`。

## 禁止

- `color` prop 使用 hex 或 `var(--primary)`（必须 `rgb(var(--primary))`）
- 手写 `<svg>` 或外链图标
- Icons 有 group-hover 颜色时，仅在父级加 transition

## 参考

- 完整规则：`docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1、§6.3.2、§2.7.1
- 示例：`src/layouts/components/admin/AdminHeader.vue`（Menubar 内 Icons 使用 `text-primary!` 等）
