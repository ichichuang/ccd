# runtime-desktop

Desktop runtime composition boundary.

This runtime must be built from `@ccd/core` plus desktop-owned adapters. It owns Tauri/native concerns and must not make `main` the source of desktop runtime truth.

Owned concerns:

- Tauri adapter
- native filesystem bridge
- native shell bridge
- updater integration
- desktop transport
- local model bridge
- desktop IPC
