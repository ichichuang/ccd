---
description: Verification standards: Agent self-check and browser testing
globs: **/*
alwaysApply: true
---

# Verification Standards

As an autonomous Agent, you own output quality. **Unverified code is buggy code.**

## 1. Verification Loop

For every UI or logic change, you MUST run this loop:

1. **Implement**: Write code.
2. **Build/type-check**: Run `vue-tsc --noEmit` or check IDE errors.
3. **Browser check** (critical):
   - Use `browser` tool to open the page.
   - **Console**: Any red errors? (e.g. 404, undefined, prop type failures).
   - **Visual**: Does it match requirements? (alignment, colors, spacing).
   - **Interaction**: Click buttons. Do they work?

## 2. Using the Browser Tool

- **URL**: Typically `http://localhost:xxxx` (check the actual port).
- **Console logs**: Always inspect browser console output.
- **Screenshots**: Take a screenshot if requested or after complex UI changes to confirm visual fidelity.

## 3. Common Failure Modes to Watch For

- **UnoCSS FOUC**: Ensure `uno.config.ts` safelist covers dynamic classes.
- **Import errors**: Check console for `Failed to resolve import`.
- **Vue reactivity loss**: Did you destructure a reactive object without `toRefs`?
- **PrimeVue styling**: Did you use a component without proper unstyled/PassThrough config?

## 4. Definition of Done

A task is **NOT done** until:

- [ ] No lint errors in the file(s).
- [ ] No console errors in the browser.
- [ ] Visual result matches requirements (UnoCSS used).
- [ ] Logic works as expected (happy path verified).
