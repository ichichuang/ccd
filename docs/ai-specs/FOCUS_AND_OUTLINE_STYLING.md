# Focus 样式规范（现代风格，AI 必读）

> **目标读者：AI**。编写可聚焦元素（菜单项、面包屑、按钮、链接等）时必读。采用 `:focus-visible` + `ring` 的现代方案，**禁止**使用 `outline` 与 `focus:outline-none`。

## 1. 核心原则

1. **使用 `:focus-visible`，不用 `:focus`**：仅键盘导航时显示焦点环，鼠标点击不显示
2. **使用 `ring`（box-shadow），不用 `outline`**：ring 由设计系统（`--ring`）控制
3. **禁止 `focus:outline-none`**：项目未设置 outline，此类无效且冗余
4. **优先使用 uno.config shortcuts**：`interactive-focus-ring`、`menu-item-base`

## 2. 权威引用

- `src/constants/theme/colorUsage.ts`：focus 语义 → ring
- `uno.config.ts` shortcuts：`interactive-focus-ring`、`menu-item-base`

## 3. 决策表

| 场景                               | 需键盘焦点环？ | 推荐写法                                          |
| ---------------------------------- | -------------- | ------------------------------------------------- |
| 菜单项（Header/Sidebar/PanelMenu） | 否             | `menu-item-base` 或 `border-none! bg-transparent` |
| 面包屑父级项                       | 否             | 不添加 focus 相关类                               |
| 下拉菜单项（TieredMenu item）      | 是             | `interactive-focus-ring`                          |
| 表单控件 / Button                  | 是             | `interactive-focus-ring`                          |
| 浮层容器（PrimeVue pt）            | —              | 按需保留 `outline-none!`（PrimeVue 浮层内部）     |

## 4. Shortcuts 定义（uno.config.ts）

```
interactive-focus-ring: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
menu-item-base: ... border-none bg-transparent  （无 focus:outline-none）
```

## 5. 禁止（FORBIDDEN）

- `focus:outline-none`、`focus:outline-none!`
- `active:ring-0!`、`active:border-none!`、`focus:shadow-none!`、`active:outline-none!` 等冗长 suppression 链
- `focus:ring-primary` → 必须用 `focus-visible:ring-ring`

## 6. 常量与组件映射

- `src/constants/layout-menu.ts` 的 `MENU_ITEM_BASE`：菜单项基础类（gap-sm、cursor-pointer、select-none、transition-all duration-scale-md ease-in-out、border-none bg-transparent），与 `uno.config.ts` 中的 `menu-item-base` shortcut 完全一致
- AdminHeader / AdminSidebar：使用 `MENU_ITEM_BASE` 或 `menu-item-base` 作为菜单项基础类
- AdminBreadcrumbBar 面包屑：不添加额外 focus suppression，仅使用语义色和基础类
- TieredMenu 下拉项：使用 `interactive-focus-ring`
- 菜单状态类（激活 / 悬停 / 展开等）由 `src/hooks/layout/useMenuVisuals.ts` 统一计算：必须使用 `getMenuStateClasses({ distance, isFocused, isSubmenuOpen, level })`，禁止在业务组件中手写 `menu-item-hover` + inactive 文本类三元逻辑；`getMenuItemActive(distance)` 仅在 `distance >= 0` 情况下用于返回统一激活样式
