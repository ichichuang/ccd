# Responsive Layout Matrix Blueprint

When modifying or creating new layout templates (like `LayoutAdmin.tsx`), strictly use this Single Source of Truth (SSOT) logic for structural visibility.

## The State Machine (Vue Computed Properties)

```typescript
import { BREAKPOINTS } from '@/constants/breakpoints'
import { useDeviceStore } from '@/stores/modules/device'
// Assume layoutStore is also available

// 1. The Strict Drawer Matrix (Hamburger Toggle)
const isDrawerMode = computed<boolean>(() => {
  const deviceStore = useDeviceStore()
  if (deviceStore.type === 'Mobile') return true
  if (deviceStore.type === 'Tablet') return deviceStore.width < BREAKPOINTS.md
  return false // PC never uses Drawer
})

// 2. Structural Component Visibility
const showTopMenuEffective = computed<boolean>(() => {
  return layoutStore.showMenu && !isDrawerMode.value
})

const showSidebarEffective = computed<boolean>(() => {
  return layoutStore.showSidebar && !isDrawerMode.value
})

const showLogoText = computed<boolean>(() => {
  // Free up space on squeezed PCs by hiding text, keeping icon only
  return deviceStore.type === 'PC' && deviceStore.width >= BREAKPOINTS.lg
})
```

## Component Integration

Pass these boolean computed properties as props to structural components (`<AdminHeader>`, `<AdminSidebar>`).

Inside the components, use strict Vue directives (`v-if="showSidebar"`) instead of CSS classes.

## Rules

- Drawer and shell visibility MUST follow the matrix above: `deviceStore.type`, `deviceStore.width`, and `BREAKPOINTS` — orchestrated in `LayoutAdmin.tsx` (or equivalent layout orchestrator), not in leaf components via ad hoc media queries.
- Do not use responsive utility classes (e.g. `md:hidden`, `max-lg:flex`) to toggle structural regions; use props and `v-if` / `v-show` driven by the computed flags from the orchestrator.
- PC (`type === 'PC'`) never enters Drawer mode; only Mobile always, and Tablet when `width < BREAKPOINTS.md`.
