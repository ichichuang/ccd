# UI State Contract (Authoritative Spec)

> **目标读者：AI**。UI 必须从 **state** 生成，而非视觉偏好或临时规则。AI 在生成布局或组件前，MUST 从 UIDesignState 推导。

## Purpose

UI must be generated from **state**, not from visual preference or ad-hoc rules.

AI MUST derive UI from UIDesignState before producing layout or components.

---

## UIDesignState

```ts
export type UIDesignState = {
  // PRIMARY (human decided)
  intent: 'dashboard' | 'data-management' | 'form-workflow' | 'detail-view' | 'settings'

  context?: 'desktop-first' | 'mobile-first'

  // DERIVED (AI must NOT freely change)
  archetype:
    | 'A1-toolbar-content'
    | 'A2-sidebar-inspector'
    | 'A3-stats-grid'
    | 'A4-table-drawer'
    | 'A5-form-wizard'

  density: 'compact' | 'comfortable' | 'spacious'

  hierarchy: 'data-first' | 'action-first' | 'reading-first'

  emphasis: 'low' | 'medium' | 'high'

  ctaPolicy: 'minimal' | 'single-primary' | 'dual-primary'
}
```

---

## Authority Levels

### Primary (Human Authority)

Allowed to specify:

- `intent`
- `context`

AI MUST NOT override.

### Derived (System Authority)

Derived strictly from intent profiles:

- `archetype`
- `density`
- `hierarchy`
- `emphasis`
- `ctaPolicy`

AI must resolve via lookup table: `@./INTENT_PROFILES.md`

---

## Forbidden Behavior

AI MUST NOT:

- invent new archetype
- mix scroll models
- override derived fields without reason
- generate UI before state resolution

---

## Validation Rules

Invalid combinations:

| Condition                   | Reason                        |
| --------------------------- | ----------------------------- |
| dashboard + reading-first   | dashboard is scan-oriented    |
| form-workflow + minimal CTA | workflow requires progression |
| data-management + spacious  | density must support scanning |

If invalid → regenerate state.

---

## Reference

- **Intent Profiles**: `@./INTENT_PROFILES.md`
- **Archetype Spec**: `@./ARCHETYPE_SPEC.md`
- **Industrial UX**: `@./INDUSTRIAL_UX_DESIGN_SYSTEM.md`
