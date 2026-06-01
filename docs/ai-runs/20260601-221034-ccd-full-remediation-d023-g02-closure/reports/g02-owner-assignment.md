# G-02 Owner Assignment

| Group | Count | Responsible decision role | D-023 decision |
| --- | ---: | --- | --- |
| P1 Guard | 8 | owner / architect | Current guard coverage is sufficient for Full GO; stricter guard expansion is future approved-lane work. |
| P2 Vite 8 | 8 | operator | Vite major migration is not a Full GO prerequisite; keep current Vite on main and require a future isolated branch. |
| P2 Dependencies | 7 | operator | Dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized here. |
| P2 GitHub | 2 | operator | `.github/**` template/CODEOWNERS refinements and remote changes are not Full GO prerequisites. |
| P3 Login Diorama | 47 | product / operator | Login Diorama is not a Full GO prerequisite; current login behavior remains canonical. |
| P4 Strategic | 6 | owner / operator | Strategic expansion and desktop drift CI are future-charter work, not current Full GO prerequisites. |

Every group has an explicit closure role and closure rule. No group was closed by
claiming unimplemented code exists.
