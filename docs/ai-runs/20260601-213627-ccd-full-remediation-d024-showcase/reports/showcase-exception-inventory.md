# Showcase Exception Inventory

## Before

Initial direct PrimeVue import inventory found 12 rows in `primevue-collection/**`:

| Surface | Direct import | Decision |
| --- | --- | --- |
| `overview/index.vue` | `primevue/useconfirm` | Migrate to adapter confirm facade |
| `pro-table/advanced/index.vue` | `primevue/useconfirm` | Migrate to adapter confirm facade |
| `prime-dialog/index.vue` | `primevue/button` | Migrate to `CcdButton` |
| `pro-form/advanced/index.vue` | `primevue/button` | Migrate to `CcdButton` |
| `pro-form/advanced/index.vue` | `primevue/inputtext` | Migrate to `CcdInputText` |
| `pro-form/advanced/index.vue` | `primevue/select` | Migrate to `CcdSelect` |
| `pro-form/plugins/components/ColorPickerField.tsx` | `primevue/inputtext` | Migrate to `CcdInputText` |
| `pro-form/plugins/components/MyColorCustomInput.tsx` | `primevue/inputtext` | Migrate to `CcdInputText` |
| `pro-table/advanced/configs/columns.tsx` | `primevue/button` | Migrate to `CcdButton` |
| `pro-table/columns/columns.tsx` | `primevue/button` | Migrate to `CcdButton` |
| `pro-table/form-table-combo/components/TablePanel.vue` | `primevue/button` | Migrate to `CcdButton` |
| `pro-table/server/columns.tsx` | `primevue/tag` | Migrate to `CcdTag` |

## After

`primevue-collection/**` has zero direct PrimeVue imports. The path-scoped guard
exception was removed.

Generated registry usage remains command-owned through the D-021 resolver boundary.
