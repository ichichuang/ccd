---
description: Toast & Message feedback: usage rules and implementation notes
globs: src/**/*.{ts,vue}
---

# Toast & Message Feedback Skill

## 1. Goal

Correctly choose `$message` or `$toast` when non-component environments (interceptors, errorHandler, utils) need lightweight feedback.

## 2. Decision

- **$message**: Centered pure message (center, no close button, auto-dismiss after `life`); for general feedback (error, success, info, warn).
- **$toast**: Positional (tl/tc/tr/bl/bc/br), optional close button; for positioned or interactive messages.

## 3. Usage

- **Non-component environment**: `window.$message?.success('Done')` or `window.$toast?.dangerIn('top-right', 'Error', 'Details')`
- **Inside component**: Prefer PrimeVue `useToast()`
- **Docs**: `docs/ai-specs/TOAST_AND_MESSAGE.md`

## 4. Prerequisites

- `docs/ai-specs/TOAST_AND_MESSAGE.md` – API and usage
- `docs/ai-specs/TOAST_AND_MESSAGE.md` – style overrides (centering, close button, padding)

## 5. Implementation Notes

### 5.1 $message Implementation

- **buildMessageApi**: `group: 'center'`, `closable: false`
- **Toast config**: `position="center"`, `group="center"`

### 5.2 Center Styling

- **CSS class**: `.p-toast.p-toast-center`
- **Rules**: `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`

### 5.3 Close Button Position

- **Selector**: `.p-toast:not(.p-toast-center)`
- **Rules**: `position: absolute`, `top: 0`, `right: 0`

### 5.4 Padding

- **Config file**: `src/utils/theme/primevue-preset.ts`
- **Config key**: `toast.content.padding`
- **Variables**: `var(--spacing-*)`

## 6. Related Files

- `src/layouts/components/AppPrimeVueGlobals.vue` – mount, buildMessageApi, styles
- `src/utils/theme/primevue-preset.ts` – Toast content.padding
- `docs/ai-specs/TOAST_AND_MESSAGE.md` – API doc

## 7. Verify

- Check console for errors
- Verify $message shows centered
- Verify $toast shows at specified position
- Verify close button position
