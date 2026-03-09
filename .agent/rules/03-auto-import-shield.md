---
description: Auto-import shield — strictly forbid redundant component/API imports in .vue files.
globs: src/**/*.{vue,tsx,ts}
alwaysApply: true
---

# Auto-Import Shield (Architecture Core)

<context>
This project uses `unplugin-auto-import` (for Vue APIs like ref, computed) and `unplugin-vue-components` with `PrimeVueResolver` (for PrimeVue and `src/components/`).
Manual imports in standard `.vue` files defeat the purpose of this architecture and trigger linting/type conflicts.
</context>

<constraints>
- **FORBIDDEN IN `.vue`**: NEVER write `import { ref, computed } from 'vue'` or `import { useI18n } from 'vue-i18n'`. Rely on auto-imports.
- **FORBIDDEN IN `.vue`**: NEVER write `import Card from 'primevue/card'` or `import X from '@/components/X'`. The resolver handles this.
- **ALLOWED**: Type-only imports (e.g., `import type { Ref } from 'vue'` or `import type { MenuItem } from 'primevue/menuitem'`) are always allowed.
- **EXCEPTIONS (Explicit Imports Required)**:
  1. `src/layouts/**/*.tsx` or `.vue` (Excluded from auto-import scope).
  2. Standalone `.tsx` files (to prevent `Invalid vnode type: undefined` errors).
  3. Global plugin registration files (e.g., `src/plugins/modules/primevue.ts`).
  4. **Non–AutoImport-dirs .ts modules** (e.g. `src/router/**`, `src/utils/**`, `src/api/**`, `src/plugins/**`): when using `@/utils/ids`, `@/api/*`, or `@/constants/*`, **must explicitly import**; auto-import does not inject there, so runtime `xxx is not defined` will occur otherwise.
</constraints>

<communication>
If the user pastes code with redundant imports into a `.vue` file, silently remove them during refactoring. Always adhere strictly to the Auto-Import Shield.
</communication>
