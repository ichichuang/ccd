---
description: Enforces data immutability and pure functions, specifically for routing trees, state transformations, and tree-like data structures.
globs: src/router/utils/*.ts, src/utils/**/*.ts
---

# Data Immutability & Pure Functions

## 1. No In-Place Mutations

- When transforming data, specifically routing trees (`RouteConfig[]`), menu arrays, or nested objects, you MUST NOT mutate the input arguments in place.
- **FORBIDDEN:** `route.children = filter(route.children)`
- **FORBIDDEN:** `array.sort()`, `array.reverse()`, `array.splice()` directly on input arguments.

## 2. Pure Function Mandate

- All utility functions that transform arrays/objects MUST be pure functions.
- ALWAYS return a completely new object or array using spread syntax (`...`), `map()`, or `filter()`.
- **CORRECT:**

```typescript
return routes.map(route => {
  if (route.children) {
    return { ...route, children: pureFilterFunction(route.children) }
  }
  return { ...route }
})
```
