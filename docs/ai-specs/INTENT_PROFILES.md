# Intent Profiles (Lookup Table)

> **目标读者：AI**。本文件为查表核心，AI 必须据此解析 Derived State，禁止自由推理。

This file is machine-readable logic guidance.

---

## dashboard

```yaml
default:
  archetype: A3-stats-grid
  density: comfortable
  hierarchy: data-first
  emphasis: medium
  ctaPolicy: minimal

allowedArchetypes:
  - A3-stats-grid
  - A1-toolbar-content
```

---

## data-management

```yaml
default:
  archetype: A4-table-drawer
  density: compact
  hierarchy: action-first
  emphasis: low
  ctaPolicy: single-primary

allowedArchetypes:
  - A4-table-drawer
  - A2-sidebar-inspector
```

---

## form-workflow

```yaml
default:
  archetype: A5-form-wizard
  density: comfortable
  hierarchy: action-first
  emphasis: high
  ctaPolicy: single-primary

allowedArchetypes:
  - A5-form-wizard
```

---

## detail-view

```yaml
default:
  archetype: A2-sidebar-inspector
  density: comfortable
  hierarchy: reading-first
  emphasis: medium
  ctaPolicy: minimal

allowedArchetypes:
  - A2-sidebar-inspector
```

---

## settings

```yaml
default:
  archetype: A1-toolbar-content
  density: comfortable
  hierarchy: reading-first
  emphasis: low
  ctaPolicy: minimal

allowedArchetypes:
  - A1-toolbar-content
```
