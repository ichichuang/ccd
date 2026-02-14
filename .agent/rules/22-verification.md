---
description: 验证规范：Agent 自查与浏览器测试标准
globs: **/*
alwaysApply: true
---

# Verification Standards

As an autonomous agent, you are responsible for the quality of your output. **Unverified code is broken code.**

## 1. The Verification Loop

For every UI or Logic change, you MUST perform this loop:

1.  **Implement**: Write the code.
2.  **Build/Type Check**: Run `vue-tsc --noEmit` or check for IDE errors.
3.  **Browser Check** (Crucial):
    - Use the `browser` tool to visit the page.
    - **Check Console**: Are there any red errors? (e.g., 404, undefined, prop type check failed).
    - **Visual Check**: Does it look like the requirement? (Alignment, Colors, Spacing).
    - **Interaction**: Click the buttons. Do they work?

## 2. Using the Browser Tool

- **URL**: typically `http://localhost:xxxx` (check specific port).
- **Console Logs**: Always check browser console output.
- **Screenshots**: Take screenshots to confirm visual fidelity if the user asks or if complex UI changes were made.

## 3. Common Failure Modes to Watch For

- **UnoCSS FOUC**: Ensure `uno.config.ts` safelist covers dynamic classes.
- **Import Errors**: Check for `Failed to resolve import` in the console.
- **Vue Reactivity Loss**: Did you destructure a reactive object without `toRefs`?
- **PrimeVue Styles**: Did you use a component without the proper unstyled config?

## 4. Definition of Done

A task is NOT done until:

- [ ] No lint errors in file.
- [ ] No console errors in browser.
- [ ] Visuals match requirements (UnoCSS used).
- [ ] Logic works as intended (Happy path verified).
