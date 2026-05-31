# Cursor Quarantine Diagnosis

## Pre-quarantine

| check | result |
|---|---|
| `git ls-files .cursor` | empty (untracked) |
| `test -e .cursor` | cursor_exists |
| Tracked files | **none** → quarantine allowed |

## Safety decision

**Proceed** — not `P10A_BLOCKED_TRACKED_CURSOR`.

## Quarantine path

See `cursor-quarantine-path.txt`:

```
../ccd.cursor.quarantine.20260601-130000/.cursor
```

## File count / size (metadata only)

- File count under `.cursor` (maxdepth 2): see `command-logs/09-cursor-file-count.log`
- Disk usage: see `command-logs/10-cursor-du.log`

No file contents recorded per authorization.
