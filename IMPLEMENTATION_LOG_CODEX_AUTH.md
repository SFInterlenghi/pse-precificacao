# Implementation Log - Codex Auth / SharePoint

Branch:
- Created and active: `dev_authentication`.
- Initial status: clean, no pending tracked changes.

Chosen base:
- `pse_v28_embrapii_rules.html`.

Output file:
- `ISIB&F_precificacao_de_projetos_v028.html` in intent; actual repo filename keeps accents: `ISIB&F_precificação_de_projetos_v028.html`.

Official DB:
- Filename detected/used: `ISIBF_DB.json`.
- Local beta seed generated: `ISIBF_DB.json` (ignored by git).
- Visible proposals: empty by default.
- Users/managers: initial manager registry included.
- Real catalog: `catalogo_default_reagentes.json` included in `price_catalog.cons`.
- `price_catalog.soft`, `equip`, and `matp`: empty.

Auth / Graph:
- Added `MS_AUTH_CONFIG` with `enabled:false` and `clientId:""` by default.
- Added MSAL.js via CDN.
- Graph flow calls `/me`, normalizes `mail` or `userPrincipalName`, and authorizes against DB users.
- In Graph mode, internal beta password is bypassed.
- Microsoft-authenticated users missing from DB are not silently granted access.
- Local/manual mode remains available.

SharePoint:
- Added `SHAREPOINT_DB_CONFIG` with validated site/drive/folder values.
- Added isolated `SPDB` module.
- `SPDB` implements sign-in, `/me`, DB metadata lookup, create-if-missing, remote load, remote save, diagnostics, and local backup.

Persistence:
- Added central `DB.saveCurrentToSharedDb(reason)`.
- Save/update DB, proposal creation, regular save, and workflow transitions route through SharePoint persistence when configured.
- Before SharePoint save, the remote DB is reloaded, local proposal changes are merged into the fresh DB, and same-proposal remote conflicts are blocked.
- Local backup download remains after SharePoint save.

Known limitations:
- Microsoft Entra `clientId` still needs to be configured.
- SharePoint mode is off by default; without `clientId`, the app remains in local mode.
- User/catalog merge is conservative by key; detailed conflict UI for shared config is not implemented.
- Diagnostics do not write to the official DB.
- Syntax parsing with `node` could not be run in this environment because `node.exe` returned access denied.

Quick checks:
- Branch `dev_authentication` active.
- Base V28 unchanged.
- Output HTML created.
- Seed `ISIBF_DB.json` generated with 0 visible proposals, 16 users, and 30 real reagent entries.
- No older HTML files edited.
- No commit created in this pass.
