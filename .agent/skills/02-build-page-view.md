---
description: 构建页面视图：Layout -> Components -> Logic Integration
globs: src/views/**/*.vue
---

# Build Page View Skill

## 1. Goal

Assemble a full page view using existing components and logic hooks.

## 2. Steps

### Step 1: Layout Selection

- Determine required layout (default `LayoutAdmin`).
- Configure in `route.meta` if needed.

### Step 2: Logic Integration

- Import business logic hook: `import { useFeature } from '@/hooks/modules/useFeature'`
- Destructure state: `const { loading, data } = useFeature()`

### Step 3: Template Assembly

- Use `AdminBreadcrumb` if needed.
- Use `PageContainer` or similar wrapper.
- Bind state to components.

### Step 4: Verify

1. Open page in `browser`.
2. check network requests (via Console logs or Hook state).
3. Verify empty states and loading states.
