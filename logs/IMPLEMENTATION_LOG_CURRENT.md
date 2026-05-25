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

V32 beta follow-up:
- Export XLSX no Chrome foi reforçado com carregamento sob demanda do ExcelJS e CDNs alternativos.
- Otimizador de HH EMBRAPII agora usa o déficit econômico consolidado da proposta mãe + subpropostas, não apenas itens da mãe.
- Ação `Atualizar DB` foi convertida em `Backup DB`; `Salvar` é a ação que grava no DB sincronizado.
- Ações de DB foram expostas também na seção DB do menu do usuário.

V33 bugfixes:
- Usuário novo que cria proposta direta passa a editar a própria proposta.
- Usuário novo fora do cadastro do DB passa a ver a tela inicial com cards.
- Banner de notificações é limpo na troca/login de usuário.
- Menu do usuário fecha por clique externo ou Escape.
- Gestores podem excluir a proposta atual pelo menu do usuário, com confirmação e gravação no DB sincronizado quando conectado.
- Correção financeira EMBRAPII: Suporte Operacional usa diretos financeiros + econômicos como base.
- Consolidação de proposta mãe inclui todos os itens próprios da mãe e calcula indiretos uma única vez no nível do projeto.
- Caso validado: `ISIB&F-2026-0008` fecha em R$ 162.010,21 financeiro, R$ 99.242,88 econômico e R$ 261.253,09 total.

V34 release:
- v033 corrigida promovida para `app/ISIB&F_precificação_de_projetos_v034.html`.
- Metadados, título HTML e nome do XLSX exportado atualizados para v034.
- v033 arquivada em `archive/outdated/versions/`.

V35 merge/email follow-up:
- v034 arquivada em `archive/outdated/versions/`.
- v035 criada como executavel principal em `app/`.
- Mesclagem de DBs com conflito de IDs agora normaliza metadados internos (`id_base`, `id_mae`, `tipo_proposta`, `state.meta` e historico).
- Carregamento do DB aplica reparo leve para propostas diretas sem mae cujo `id_base` apontava para outra proposta.
- Listagem evita agrupar proposta direta independente como revisao de outra apenas por `revisao_numero > 0`.
- Modulo `EMAIL_DRAFTS` gera rascunhos editaveis para envio para aprovacao, revisao solicitada e proposta aprovada, sem envio automatico.
- Workflow e painel de aprovacao abrem o rascunho depois das transicoes, mantendo save/revisao/backup existentes.
- Ajuste posterior removeu botoes extras de e-mail da barra de workflow e manteve apenas o modal automatico com acao `Enviar para e-mail` via cliente padrao/Outlook.

Quick checks:
- Source branch clean before promotion.
- Target `main` prepared from `origin/main`.
- V29 HTML copied selectively from `dev_onedrive_sync`.
- Log consolidated for main promotion.
- No repository DB JSON file staged.
