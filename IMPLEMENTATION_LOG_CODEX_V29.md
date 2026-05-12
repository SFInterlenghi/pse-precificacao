# Implementation Log - Codex V29 OneDrive File Sync

Branch:
- Created and active: `dev_onedrive_sync`.

Chosen base:
- `ISIB&F_precificação_de_projetos_v028.html`.

Output file:
- `ISIB&F_precificação_de_projetos_v029.html`.

DB modes:
- Local/manual JSON mode remains available.
- Existing SharePoint Graph/MSAL scaffold remains in the file but is not initialized or exposed as the V29 path.
- New `onedrive_file` mode added through the browser File System Access API.

OneDrive file provider:
- Added isolated `FILE_DB` provider.
- Supports `showOpenFilePicker`, persisted file handle through IndexedDB, permission checks, load from handle, write to handle, reconnect, help text, and clear handle.
- Unsupported browsers show a clear Edge/Chrome fallback message and local/manual mode remains usable.

Persistence:
- `DB.saveCurrentToSharedDb(reason)` now routes to `FILE_DB.saveWithReloadMerge(reason)` when a synced file is connected.
- Save/update DB, proposal creation, regular save, and workflow transitions continue using the central persistence path.
- Graph/MSAL save flow remains behind its existing disabled config.

Reload-before-save:
- Before writing the selected JSON file, V29 reloads the latest file content.
- It merges only changed local proposals into the latest file DB.
- Other proposals are preserved.
- Shared users/catalog are merged conservatively, keeping the latest file values and adding missing local keys.

Version/conflict metadata:
- DB metadata initialized/backfilled: `db_revision`, `last_saved_at`, `last_saved_by`.
- Proposal metadata initialized/backfilled: `revision`, `updated_at`, `updated_by`.
- Same-proposal file changes or deleted proposals are blocked with a conflict message.

Local backup:
- After a successful OneDrive file write, the app still downloads local backup JSON files.

Seed DB:
- Local ignored seed `ISIBF_DB.json` updated for V29 metadata.
- It has empty visible proposals, manager/users, and the real reagent catalog.
- It remains ignored by git because DB files are marked as sensitive.

Known limitations:
- File System Access API requires Edge/Chrome-style browsers.
- If permission to the saved handle is lost, the user must reconnect the JSON file through the picker.
- No Microsoft auth, Graph API, clientId, or Entra registration is required for V29 mode.

Quick checks:
- Base V28 unchanged.
- V29 HTML exists.
- `FILE_DB.isSupported()` exists.
- "Conectar DB sincronizado" action exists on landing, auth modal, and user menu.
- Graph/MSAL is not initialized on startup in V29.
- Core namespaces remain present.
- No tracked repository JSON/DB files modified.
- Node syntax check could not run in this environment because `node.exe` returned access denied, even with escalation.

Follow-up fix:
- The synced DB action now updates the landing-page DB status before opening the picker.
- Unsupported browser/context now shows a visible alert instead of only a hidden/header status.
- `FILE_DB` is explicitly exposed on `window` for inline handlers.
- Synced DB buttons were marked `type="button"` to avoid any implicit form behavior.
