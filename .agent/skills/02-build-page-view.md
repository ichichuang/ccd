---
description: Build page view: Layout -> Components -> Logic Integration
globs: src/views/**/*.vue
---

# Build Page View Skill

## 1. Goal

Assemble full page views using existing components and logic hooks.

## 2. Steps

### Step 1: Layout Selection

- Determine layout (default `LayoutAdmin`).
- Configure in `route.meta` if needed.

### Step 2: Logic Integration

- Import business hook: `import { useFeature } from '@/hooks/modules/useFeature'`
- Destructure state: `const { loading, data } = useFeature()`
- **Type safety**: Ensure all local variables have explicit type annotations:
  - ❌ `const localData = ref(null)`
  - ✅ `const localData = ref<FeatureData | null>(null)`
  - ❌ `const computedValue = computed(() => data.value?.name)`
  - ✅ `const computedValue = computed<string | undefined>(() => data.value?.name)`
  - ❌ `const items = []`
  - ✅ `const items: Item[] = []`

### Step 3: Template Assembly

- Use `AdminBreadcrumb` if needed.
- Use `PageContainer` or similar wrapper.
- Bind state to components.

### Step 4: Verify

1. Open the page in `browser`.
2. Check network requests (via console or hook state).
3. Verify empty and loading states.
