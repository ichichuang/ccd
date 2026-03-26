# Theme & Design Tokens Blueprint

When building UI components, strictly adhere to the UnoCSS semantic classes mapped from our central CSS variables. This ensures Light/Dark mode and Theme switching work flawlessly.

## 1. Color Tokens (Semantic Mapping)
Use these semantic intents instead of specific colors.

* **Backgrounds:** `bg-background` (App base), `bg-surface` (Cards/Panels), `bg-muted` (Subtle backgrounds).
* **Typography:** `text-foreground` (Primary text), `text-muted-foreground` (Secondary text), `text-primary-foreground` (Text on primary backgrounds).
* **Borders:** `border-border` (Standard borders), `border-input` (Form elements).
* **Brand/States:** `text-primary`, `bg-success`, `text-destructive`, `bg-warning`.

## 2. Size & Spacing Tokens
Our spacing and sizing use a T-shirt sizing scale. Do NOT use pixel values.

* **Spacing (`p`, `m`, `gap`):** `-xs`, `-sm`, `-md`, `-lg`, `-xl`, `-2xl`.
    * *Example:* `p-md`, `gap-sm`, `mb-lg`.
* **Border Radius (`rounded`):** `rounded-none`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`.
* **Typography (`text`):** `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`.

## 3. Code Example (The Perfect Component)

```html
<div class="p-md bg-surface border border-border rounded-lg flex flex-col gap-sm">
  <h3 class="text-lg font-bold text-foreground">
    User Profile
  </h3>
  <p class="text-sm text-muted-foreground">
    Manage your account settings.
  </p>
  <button class="px-md py-sm bg-primary text-primary-foreground rounded-md">
    Save Changes
  </button>
</div>
```
