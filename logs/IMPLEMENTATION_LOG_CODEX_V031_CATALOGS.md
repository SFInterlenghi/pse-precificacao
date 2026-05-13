# Implementation Log - Codex V031 Catalogs

Branch:
- `dev_xlsx_premium_export_v030`

Source baseline:
- `app/ISIB&F_precificação_de_projetos_v030.html`

New versioned HTML:
- `app/ISIB&F_precificação_de_projetos_v031.html`

Scope:
- Added catalog open/import/save flow for Software, Uso de Equipamentos, and Material Permanente.
- Simplified Uso de Equipamentos input model to known HM/hourly price: name, price per hour, hours, total.
- Preserved backward compatibility for older equipment rows using acquisition/calibration/maintenance fields.
- Updated visible/app/export version strings to v031.

Changes:
- Added generic `PRICE_CAT.openCatalog()` and `PRICE_CAT.applyFromCatalog()` for non-consumable catalog sections.
- Kept Material de Consumo existing catalog flow intact.
- Software catalog can be empty initially; users can save new entries through existing "Salvar no catálogo".
- Material Permanente catalog can be empty initially; users can save future purchase equipment entries.
- Uso de Equipamentos imports `hm`/hourly values from `price_catalog.equip`.
- `CALC.equipCusto()` now prefers explicit total/hourly fields when present and falls back to the legacy HM derivation for old data.

No-touch notes:
- No DB persistence, OneDrive, auth, workflow, approval, validation, or financial rules were redesigned.
- No JSON seed/source files were modified in this pass.

Quick checks:
- Confirmed v031 HTML exists.
- Confirmed v030 HTML remains untouched in this pass.
- Confirmed no remaining v030 version strings in v031.
- Confirmed required namespaces remain present.
- Embedded script syntax check passed with Node: 4 scripts, all OK.

Manual tests pending:
- Open catalog for Software with empty catalog and confirm clear warning.
- Save a Software item to catalog, then import it into another row.
- Import Uso de Equipamentos HM from the existing seed DB catalog.
- Save a Material Permanente item to catalog, then import it into another row.
- Confirm old equipment rows still calculate through legacy fallback.
