# Implementation Log - Codex V030 XLSX Premium Export

Branch:
- `dev_xlsx_premium_export_v030`

Source baseline:
- `app/ISIB&F_precificação_de_projetos_v029.html`

New versioned HTML:
- `app/ISIB&F_precificação_de_projetos_v030.html`

Scope:
- Replaced the legacy XLSX export implementation only.
- Public entry point preserved: `EXPORT.run()`.
- No changes made to DB persistence, OneDrive `FILE_DB`, AUTH, CALC, VAL, TEAM, FOMENTO, PRICE_CAT, REVISION, workflow, validation formulas, or financial formulas.

Legacy export replacement:
- Removed the old SheetJS-based `EXPORT` implementation that used `XLSX.utils.book_new`, `aoa_to_sheet`, `book_append_sheet`, and `writeFile`.
- Removed the SheetJS CDN from the v030 file.
- Added ExcelJS 4.4.0 browser CDN for the new export path.

Final export architecture:
- `EXPORT_DATA`: extracts and normalizes proposal data without writing XLSX.
- `EXPORT_XLSX_THEME`: centralizes colors, fonts, borders, number formats, table styling, KPI/card styling, widths, filters, and freeze-pane helpers.
- `EXPORT_XLSX_PREMIUM`: builds the workbook, adds all sheets, and downloads the XLSX.
- `EXPORT`: compatibility wrapper with `async run(){ return EXPORT_XLSX_PREMIUM.run(); }`.

Chosen library:
- ExcelJS via browser CDN.
- Rationale: better workbook styling primitives than the legacy SheetJS path, reliable browser `writeBuffer()` support, styled cells, merged ranges, fills, borders, frozen panes, filters, and number formats.
- Chart strategy for v030: stable cell-based dashboard visuals. Native Excel chart objects and image charts were intentionally not attempted for this version.

Sheets generated:
1. `00_Capa`
2. `01_Dashboard_PPT`
3. `02_Resumo_Financeiro`
4. `03_Origem_Recursos`
5. `04_Rubricas`
6. `05_Equipes_HH`
7. `06_Subpropostas`
8. `07_Materiais_Servicos`
9. `08_Validacoes`
10. `09_Dados_Graficos`
11. `10_Dados_Brutos`

Export behavior:
- Export is blocked when critical validation errors exist.
- Warnings are allowed and exported in `08_Validacoes`.
- Mother proposal exports include the current mother proposal plus linked team subproposals.
- Direct proposal exports include only the direct proposal.
- Team proposal exports include only the team proposal and mother proposal reference when available.
- Detailed rows preserve source proposal id, source type, team, rubrica, item id, financial/economic split, and total.
- Filename pattern: `ISIBF_PSE_Proposta_<proposalId>_<safeTitle>_<yyyy-mm-dd>_v030.xlsx`.

Visual strategy:
- Premium Editorial Financial palette:
  - ink `0F1115`
  - paper `FFFFFF`
  - paper2 `F6F5F1`
  - hairline `E8E5DC`
  - gold `B8893B`
  - goldSoft `FAF4E6`
  - positive `0E7E4F`
  - warning `B26500`
  - negative `B43A2C`
  - info `1F4E8C`
- Styled headers, borders, alternating row fills, wrapped text, filters, frozen headers, currency formats, percentage formats, date formats, KPI cards, and cell-based bars.
- HH dashboard bars use integer hour formatting instead of currency formatting.

Tests / quick checks performed:
- Confirmed v030 HTML exists.
- Confirmed public `EXPORT.run()` remains present.
- Confirmed legacy `XLSX.` calls were removed from v030.
- Confirmed ExcelJS CDN is present.
- Confirmed required namespaces still exist in the file: `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH`, `PRICE_CAT`.
- Confirmed no JSON/DB files were modified.
- Attempted embedded script syntax check with Node; blocked by Windows with `Acesso negado` in this environment.

Known limitations:
- Runtime export depends on ExcelJS loading from CDN.
- Native editable Excel chart objects are not implemented in v030.
- Dashboard uses cell-based visual bars/tables rather than embedded chart images.
- Full desktop Excel open/repair validation still needs manual testing with real direct, team, and mother proposals.
- Total behavior for mother proposal export is normalized from mother + linked subproposals for the export package; manual comparison with app/sidebar totals should be done during acceptance testing.

Follow-up items:
- Manual Excel test with a direct proposal.
- Manual Excel test with a team subproposal.
- Manual Excel test with a mother proposal containing at least two linked team subproposals.
- Verify workbook opens without repair warning in desktop Excel.
- Verify totals against app/sidebar and `TEAM.calcConsolidado(id_mae)` where applicable.

Additional v030 seed/default cleanup:
- Added `data/seed/ISIBF_DB_v030_virgem.json` as an official empty seed DB with zero visible proposals.
- Seed keeps the existing reagent catalog and adds 19 cargo/HH reference rows plus 59 equipment/HM reference rows.
- Equipment/HM rows were also added under `price_catalog.equip` with hourly fields (`hm`, `custo_hora`, `valor_unitario`, `unidade: h`).
- Added `.gitignore` exception only for the official seed file; local working DB files remain ignored.
- Added the supplied cargo reference rows to the v030 HTML role options while preserving legacy role ids for old proposals.
- New Pessoal Técnico and Pessoal Administrativo rows now start with empty cargo, months, and hours instead of prefilled defaults.
- No calculation formula was changed.

HH calculation correction:
- Updated personnel cost semantics so configured HH is treated as the total loaded hourly cost.
- `CALC.pessoalCusto()` now uses `HH total * horas`; if no explicit HH exists, it derives HH as monthly salary divided by 176h.
- `CALC.remuneracao()` and `CALC.encargos()` split the loaded total for display using the existing encumbrance percentage, instead of adding charges on top of HH.
- Economic HH optimizer now uses the same loaded HH total per hour.

Role taxonomy correction:
- Removed legacy role options from v030.
- Administrative roles now include only: Gerente, Pesquisador Chefe, Coordenador, Analista de Projeto, Pesquisador Líder.
- Technical roles now include all remaining roles from the supplied hybrid list.
- Seed DB reference data now includes explicit `cargos_hh_administrativo` and `cargos_hh_tecnico` arrays.
