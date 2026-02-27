# Skill 07: Toast & Message Feedback

## Goal

When a lightweight notification is needed in non-component contexts (interceptors, errorHandler, utils), correctly choose `$message` or `$toast`.

## Decision

- **$message**: Centered, no close button, auto-dismiss after life; suitable for error/success/info/warning feedback.
- **$toast**: Positionable (tl/tc/tr/bl/bc/br), can have close button; suitable for positioned or interactive notifications.

## Usage

- **Non-component**: `window.$message?.success('Operation succeeded')` or `window.$toast?.dangerIn('top-right', 'Error', 'Details')`
- **Inside component**: Prefer PrimeVue `useToast()`
- **Docs**: `docs/ai-specs/TOAST_AND_MESSAGE.md`

## Pre-check

- `docs/ai-specs/TOAST_AND_MESSAGE.md` - API and usage
- `docs/ai-specs/TOAST_AND_MESSAGE.md` - Style overrides (center, close button, padding)

## Implementation Notes (technical details)

### $message implementation

- **buildMessageApi**: `group: 'center'`, `closable: false`
- **Toast config**: `position="center"`, `group="center"`

### Center styling

- **CSS class**: `.p-toast.p-toast-center`
- **Rules**:
  - `top: 50%`
  - `left: 50%`
  - `transform: translate(-50%, -50%)`

### Close button position

- **CSS selector**: `.p-toast:not(.p-toast-center)`
- **Rules**:
  - `position: absolute`
  - `top: 0`
  - `right: 0`

### Padding config

- **Config file**: `src/utils/theme/primevue-preset.ts`
- **Config key**: `toast.content.padding`
- **Variables**: `var(--spacing-*)`

## Related Files

- `src/layouts/components/AppPrimeVueGlobals.vue` - Mount, buildMessageApi, styles
- `src/utils/theme/primevue-preset.ts` - Toast content.padding
- `docs/ai-specs/TOAST_AND_MESSAGE.md` - API docs and style overrides

## Validation

- Check console for errors
- Verify $message is centered
- Verify $toast displays at specified position
- Verify close button position is correct
