# Implementation Log - V29 Main Promotion

Promotion:
- Source branch: `dev_onedrive_sync`.
- Target branch: `main`.
- Stable app file promoted: `ISIB&F_precificacao_de_projetos_v029.html` in intent; actual repo filename keeps accents: `ISIB&F_precificação_de_projetos_v029.html`.
- Main promotion strategy: selective commit, not a full branch merge, to avoid bringing intermediate HTML versions and older implementation logs into `main`.

Branch summary:
- V23 beta fixes: proposal collaborators became visible/editable to involved users.
- V24/V25 revision cycle: proposal revision tracking was made coherent after first approval submission, including accept/reject behavior and updated base state.
- V26 cleanup: revision requests stopped creating extra revision subproposal records; revision counter/title behavior was cleaned up; team/access workflow was adjusted.
- V27 validation UX: bottom validation bar expansion and HH optimizer visibility were fixed.
- V28 EMBRAPII rules: high leverage EMBRAPII validations and limits were added.
- Auth experiment: Graph/MSAL/SharePoint scaffold was implemented in V28/Auth branch but is not the active V29 persistence path.
- V29 OneDrive sync: browser File System Access API was added for direct read/write of a OneDrive-synced JSON DB.

V29 persistence:
- Added isolated `FILE_DB` provider for `onedrive_file` mode.
- User selects the official JSON once via browser file picker.
- File handle is persisted through IndexedDB when supported.
- Saves write back to the selected JSON file through `createWritable()`.
- Local/manual JSON load and save/download remain available.
- Graph/MSAL code remains disabled and is not initialized for V29.

V29 save behavior:
- `DB.saveCurrentToSharedDb(reason, opts)` routes to `FILE_DB.saveWithReloadMerge()` when a synced file is connected.
- Before writing, the latest JSON is re-read from the selected file handle.
- Only locally changed proposals are merged into the latest file DB.
- Other proposals are preserved.
- Same-proposal conflicts are blocked with a clear conflict message.
- DB metadata is maintained: `db_revision`, `last_saved_at`, `last_saved_by`.
- Proposal metadata is maintained: `revision`, `updated_at`, `updated_by`.
- Backup download is generated only when explicitly requested by the save flow, currently `Atualizar DB`.
- Creating/saving a new V0 proposal updates the synced JSON without forcing immediate backup download.

Landing/auth UX:
- `DB sincronizado` action exists on landing, auth modal, and user menu.
- Landing status now shows selected filename, proposal count, user count, and DB revision.
- Loading a synced DB no longer opens the legacy auth modal over the landing page.
- Synced DB button gives visible feedback before opening the picker.
- Unsupported browsers show a clear Edge/Chrome fallback message.

Seed DB:
- Local ignored seed `ISIBF_DB.json` was generated during development.
- It has 0 visible proposals, 16 manager/users, and 30 real reagent entries.
- It remains ignored by git because DB files are sensitive and should not be versioned.

Main contents intentionally promoted:
- `ISIB&F_precificação_de_projetos_v029.html`
- `IMPLEMENTATION_LOG_CODEX_V29.md`
- README updated to point to V29.

Main contents intentionally not promoted:
- Intermediate HTML files V23-V28.
- Auth-only branch log.
- Local or synced DB JSON files.
- Backup JSON files.

Known limitations:
- Direct synced-file persistence requires Edge or Chrome because Firefox does not support the File System Access API used here.
- If browser permission to the file handle is lost, the user must reconnect the JSON file with the picker.
- Detailed conflict UI is not implemented; same-proposal conflicts are blocked and require reload/manual resolution.

Quick checks:
- Source branch clean before promotion.
- Target `main` prepared from `origin/main`.
- V29 HTML copied selectively from `dev_onedrive_sync`.
- Log consolidated for main promotion.
- No repository DB JSON file staged.
