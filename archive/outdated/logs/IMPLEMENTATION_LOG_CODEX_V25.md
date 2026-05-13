# Implementação Codex V25 — Revision Acceptance Cycle

Gerado em 2026-05-11.

## Base

- Base: `pse_v24_codex_revision_tracking.html`.
- Arquivo criado: `pse_v25_codex_revision_cycle.html`.
- Landing/title atualizados para `v0.25` / `v25`.

## Revisão do estado anterior

- Já existiam:
  - `REVISION.getDiff()`;
  - relatório de alterações;
  - aceitar/rejeitar mudança individual;
  - comentários por item;
  - histórico/audit;
  - painel de aprovações/revisões.
- Lacunas:
  - envio da proposta mãe para aprovação não congelava as subpropostas como base do ciclo;
  - mudanças em subpropostas podiam existir como diff, mas não apareciam bem no painel de revisões;
  - não havia ação para concluir o ciclo e transformar o estado revisado em nova base;
  - aprovação ainda podia ocorrer com diff pendente.

## Implementado

- Envio para aprovação agora cria uma nova base (`state_base`) sempre a partir do estado atual.
- Quando a proposta mãe é enviada para aprovação, todas as subpropostas filhas também são rebaselined.
- `DB.maybeAutoRevisionSnapshot()` agora permite snapshot para colaboradores quando a proposta mãe já está em ciclo de aprovação/revisão.
- Adicionado `AUTH.canResolveRevision()` para liberar resolução de diff a gestor/líder técnico.
- Relatório de revisão:
  - aceitar/rejeitar mudança exige permissão;
  - quando não há mais diff, mostra ação `Concluir revisão e reenviar para aprovação`.
- `REVISION.finalizeCycle()`:
  - exige que todos os diffs tenham sido aceitos/rejeitados;
  - transforma o estado atual em nova base;
  - reenvia para aprovação;
  - em subproposta, mantém a subproposta sem aprovação intermediária e marca a mãe como aguardando aprovação.
- Painel de revisões agora também lista propostas com `state_base` e diff pendente, mesmo que não estejam formalmente em `em_revisao`.
- Aprovação direta bloqueia quando há diff pendente.

## Lógica tocada

- Sim, em `REVISION`, `DB`, `AUTH` e `DASHBOARD`, de forma focada no ciclo de revisão.
- Não foram alteradas fórmulas financeiras, exportação, catálogo, visual global ou schema incompatível.

## Limitações / observações

- A conclusão de revisão é explícita por botão; não é automática ao aceitar o último diff.
- Em subpropostas, a conclusão rebaselineia a subproposta e marca a proposta mãe como aguardando aprovação, preservando a regra beta de não haver aprovação intermediária de subpropostas.
- O aprovador ainda deve abrir/revisar o conjunto antes de aprovar.

## Quick checks

- `pse_v25_codex_revision_cycle.html` existe.
- `pse_v24_codex_revision_tracking.html` preservado.
- Namespaces principais preservados: `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH`, `PRICE_CAT`, `DB`.
- JSON/DB/catalog files não foram modificados.

## Testes manuais recomendados

- Enviar uma proposta mãe para aprovação e confirmar que as subpropostas ganham base de revisão.
- Entrar como colaborador e editar uma subproposta após o envio.
- Entrar como líder técnico/gestor, abrir painel de revisões e revisar alterações.
- Aceitar uma alteração, rejeitar outra e concluir revisão.
- Confirmar que a proposta volta para aprovação e que nova edição inicia novo diff contra a nova base.
- Confirmar que aprovação é bloqueada se houver diff pendente.
