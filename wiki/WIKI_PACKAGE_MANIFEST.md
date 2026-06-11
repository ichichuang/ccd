# Wiki Package Manifest

| Field                         | Value                                      |
| ----------------------------- | ------------------------------------------ |
| Generation date               | `2026-06-11`                               |
| Source repository             | `https://github.com/ichichuang/ccd`        |
| Source ref                    | `main`                                     |
| Observed GitHub search commit | `b1c755e35a633d0d6303a62828fa51e339d39915` |
| Included file count           | `104`                                      |
| Canonical page count          | `47`                                       |
| Chinese index count           | `8`                                        |
| Schema file count             | `9`                                        |
| Template file count           | `8`                                        |

## Top-level tree

- `README-REPLACEMENT-NOTE.md`
- `_schema/` — 9 files
- `_templates/` — 8 files
- `canonical/` — 47 files
- `generated/` — 6 files
- `index.md`
- `indexes/` — 10 files
- `indexes-zh/` — 8 files
- `log.md`
- `maps-zh/` — 4 files
- `raw/` — 8 files

## Validation summary

```json
{
  "canonical_frontmatter_required_fields": {
    "ok": true,
    "errors": []
  },
  "canonical_english_filenames": {
    "ok": true,
    "errors": []
  },
  "canonical_source_paths_non_empty": {
    "ok": true,
    "errors": []
  },
  "chinese_presentation_backlinks": {
    "ok": true,
    "errors": []
  },
  "index_and_log_exist": {
    "ok": true,
    "errors": []
  },
  "excluded_build_cache_dirs": {
    "ok": true,
    "errors": []
  },
  "staging_only_no_repo_mutation": {
    "ok": true,
    "note": "Generated only under /mnt/data/ccd-wiki-staging/wiki; no local repository checkout or remote mutation was performed."
  },
  "repo_command_validation": {
    "ok": false,
    "skipped": true,
    "note": "Skipped `pnpm docs:commands` and `git diff --check` because the environment could not clone github.com and the GitHub connector is read-only. Command existence was cross-checked against fetched `package.json`."
  }
}
```

## Limitations

- The environment could not clone `github.com`; repository evidence was read through the GitHub connector and GitHub web views.
- `pnpm docs:commands` and `git diff --check` were skipped because no local checkout was available.
- Raw historical archive files are represented as archive pointer manifests. Before deleting `/docs`, copy required historical evidence into `wiki/raw/repo-archive/**` or another immutable evidence store.
- The package does not implement P4 strategic items and does not mutate remote GitHub settings.

## How to replace an existing `/wiki`

1. Review this ZIP in a temporary directory.
2. From the repository root, extract the ZIP so that `wiki/` is created or replaced.
3. Run wiki validation and repository validation in a real checkout.
4. Only after review, update `README.md` and `README.en.md` to point to the wiki.
5. Do not delete `/docs` until [[docs-deletion-readiness]] passes.
