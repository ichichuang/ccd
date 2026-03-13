# ProForm Engine: AI Implementation Blueprint

> **System Goal:** Build an Enterprise-grade, Headless, Schema-driven, Type-safe Form Engine.
> **Benchmark:** TanStack Form, FormKit, React Hook Form.
> **Core Stack:** Vue 3 (Composition API), TypeScript, Zod/VeeValidate, PrimeVue (Renderer only).

## 1. Architectural Axioms (Absolute Rules for AI)

1.  **Engine ≠ UI:** The core engine (`src/components/ProForm/engine`) MUST NOT import any PrimeVue components or DOM-specific logic.
2.  **Subscription State Model:** DO NOT use a single massive `reactive(formValues)`. Form state must be subscription-based (Pub/Sub) to ensure micro-rendering (only the modified field updates).
3.  **Registry Pattern:** Schemas define `component: 'input'`. A `FieldRegistry` dynamically maps `'input'` to the `PrimeInputRenderer` component.
4.  **Dependency Graph (DAG):** DO NOT use scattered `watch` or `computed` for cross-field logic. All `visibleIf`, `disabledIf`, and `computed` properties MUST be resolved via a Topological Dependency Graph to prevent loop rendering and watch storms.
5.  **Transaction Management:** Multi-field updates MUST be batched via a `TransactionManager` to trigger only ONE validation/render cycle.

## 2. Directory Architecture (Target Structure)

```text
src/components/ProForm/
├── index.vue                  # Top-level UI Wrapper
├── engine/                    # 🧠 HEADLESS ENGINE (UI Agnostic)
│   ├── types/                 # Type System (Schema, State, Context)
│   ├── state/                 # Pub/Sub Store, Field/Form State
│   ├── registry/              # Field & Component Registry
│   ├── dependency/            # DAG, Node, Scheduler
│   ├── validation/            # Zod/Vee Adapter, Resolver
│   ├── logic/                 # Visibility, Disabled, Computed evaluations
│   ├── core/                  # FormController, TransactionManager
│   └── hooks/                 # useForm, useField, useFieldArray
└── renderers/                 # 🎨 UI ADAPTERS (PrimeVue Specific)
    ├── PrimeVueRenderer.vue   # Dynamic Component Resolver
    └── components/            # InputText, Select wrappers mapped to Registry
```

## 3. Core Type System (The Contract)

AI must implement strict TypeScript generic inference so that Schema -> FormValues is automatically deduced.

```ts
// engine/types/schema.ts
export interface FieldSchema<TValue = any> {
  name: string
  component: string // e.g., 'input', 'select'
  label?: string
  defaultValue?: TValue
  props?: Record<string, any>
  rules?: any[]
  deps?: string[] // Explicit dependencies for DAG
  visibleIf?: (ctx: LogicContext) => boolean
  disabledIf?: (ctx: LogicContext) => boolean
  computed?: (ctx: LogicContext) => TValue
}

// engine/types/state.ts
export interface FieldState<T = any> {
  value: T
  initialValue: T
  touched: boolean
  dirty: boolean
  valid: boolean
  validating: boolean
  errors: string[]
}
```

## 4. Execution Flow (The Lifecycle)

When AI implements the core, follow this pipeline:

- **Init:** `useForm(schema)` parses the schema and registers fields.
- **DAG Build:** `DependencyGraph` scans `deps` and `computed`/`visibleIf` to build a directed acyclic graph.
- **Mount:** UI uses `<PrimeVueRenderer>` which calls `useField(name)` to subscribe to specific field states.
- **Update:** User types -> `setValue` -> `TransactionManager.begin()` -> Updates `FieldStore` -> `DependencyGraph.trigger()` (updates dependents) -> `ValidationEngine` -> `TransactionManager.commit()` -> Notifies UI Subscribers.

## 5. Implementation Roadmap (Phased Execution)

AI must NOT build everything at once. We will execute in this order:

1.  **Phase 1: Foundation.** Implement types, `FieldRegistry`, and basic `SubscriptionStore`.
2.  **Phase 2: The Brain.** Implement `DependencyGraph` (DAG) and `TransactionManager`.
3.  **Phase 3: The Hooks.** Implement `useForm` and `useField` to connect state and logic.
4.  **Phase 4: The Validation.** Integrate Zod/VeeValidate resolver.
5.  **Phase 5: The UI Shell.** Implement `renderers/PrimeVueRenderer.vue` mapping to PrimeVue components.
