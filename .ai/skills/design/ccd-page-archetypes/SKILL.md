---
name: ccd-page-archetypes
description: Maps CCD page types to UIDesignState, layout archetypes, density, hierarchy, component choices, and UI quality expectations.
version: 1.0.0
---

# CCD Page Archetypes

## Purpose

Use this skill before implementing a page, major view, route surface, or UI shell.

## Mandatory pre-design pass

Resolve this before markup:

```text
Page job:
Primary user:
Primary action:
Secondary actions:
Information priority:
UIDesignState:
Visual thesis:
Signature detail:
Layout archetype:
Density plan:
Typography plan:
Material plan:
Motion plan:
State plan:
Accessibility plan:
Validation plan:
```

## UIDesignState mapping

Use the existing CCD contract values only.

### Dashboard

```text
intent: dashboard
context: desktop-first
archetype: A3-stats-grid
density: comfortable
hierarchy: data-first
emphasis: medium/high
ctaPolicy: single-primary or minimal
```

Rules:

- one leading insight dominates;
- secondary cards group by meaning;
- do not make every card identical;
- use status color only for real status;
- avoid fake product metrics;
- no marketing hero unless dashboard is onboarding.

### Settings

```text
intent: settings
context: desktop-first
archetype: A1-toolbar-content or A2-sidebar-inspector
density: comfortable
hierarchy: action-first or reading-first
emphasis: medium
ctaPolicy: minimal or single-primary
```

Rules:

- calm sectioning;
- all settings visible when requested;
- bento/card grids allowed;
- avoid tab hiding unless information is large and separate;
- save/reset/danger visually distinct;
- responsive cards, not squeezed panels.

### Login / onboarding

Use closest existing contract:

```text
intent: form-workflow
context: mobile-first or desktop-first
archetype: A5-form-wizard or A1-toolbar-content
density: spacious
hierarchy: action-first
emphasis: high
ctaPolicy: single-primary
```

Rules:

- form is the hero;
- brand is supportive;
- minimal motion;
- no dashboard metrics;
- no heavy shader showpiece;
- no excessive icons;
- input readability wins over glass.

### Forms

```text
intent: form-workflow
archetype: A5-form-wizard
density: comfortable
hierarchy: action-first
ctaPolicy: single-primary
```

Rules:

- prefer `ProForm` for multi-field forms;
- group by task, not data model;
- helper text reduces uncertainty;
- validation state is visually complete;
- primary action is obvious;
- destructive actions separated.

### Tables / data management

```text
intent: data-management
archetype: A4-table-drawer or A1-toolbar-content
density: compact or comfortable
hierarchy: data-first
ctaPolicy: single-primary or minimal
```

Rules:

- prefer `ProTable`;
- filters, bulk actions, row actions separated;
- table surface solid, not glass;
- responsive behavior planned;
- empty/loading/error states polished;
- page must not horizontally overflow.

### Detail views

```text
intent: detail-view
archetype: A2-sidebar-inspector or A1-toolbar-content
density: comfortable
hierarchy: reading-first
ctaPolicy: minimal
```

Rules:

- identity/status first;
- metadata secondary;
- inspector only if it reduces cognitive load;
- destructive actions separated.

## Component choice rules

Use PrimeVue and CCD Pro wrappers:

- `Button` for actions;
- PrimeVue inputs / `ProForm` for forms;
- `ProTable` for business tables;
- `Dialog` / internal dialog wrappers / `useDialog` for dialogs;
- `CScrollbar` for local scroll regions;
- `UseEcharts` for charts.

Do not use native interactive elements where PrimeVue/Pro equivalents exist.

## Responsive rules

Every page must define:

- desktop layout;
- tablet behavior;
- mobile behavior;
- overflow strategy;
- card stacking strategy;
- table strategy if any.

Do not rely on luck.

## Page rejection criteria

Reject a page if:

- the primary action is unclear;
- layout only works at one width;
- a side panel squeezes content on normal desktop;
- bottom content touches the footer;
- there is page-level horizontal overflow;
- toolbars look like unrelated controls;
- visual design depends on large decoration.
