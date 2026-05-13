# Implementação Codex V26 — Revision Cleanup

Gerado em 2026-05-11.

## Base

- Base: `pse_v25_codex_revision_cycle.html`.
- Arquivo criado: `pse_v26_codex_revision_cleanup.html`.
- Landing/title atualizados para `v0.26` / `v26`.

## Correções implementadas

- Controle de alterações não inicia mais apenas porque uma proposta recém-criada foi salva no DB.
- `DB.maybeAutoRevisionSnapshot()` agora só abre snapshot quando a proposta atual ou a mãe já está em ciclo de aprovação/revisão.
- Solicitação de revisão não cria mais proposta `_revN`.
- `DB.requestRevision()` atualiza a própria proposta original:
  - incrementa `revisao_numero`;
  - muda status para `em_revisao`;
  - salva o comentário no próprio registro.
- `DASHBOARD.requestRevision()` segue a mesma regra, atualizando o registro original.
- `DB.renderList()` só trata como revisão separada registros legados cujo `id` é diferente de `id_base`.
- `Equipe & Acesso` agora permite adicionar novas sub-equipes à proposta mãe, além de colaboradores.
- `ADDTEAM.createForMae()` foi extraído para reaproveitar a criação de subpropostas tanto no modal antigo quanto em `Equipe & Acesso`.

## Lógica tocada

- Sim, de forma localizada em `DB`, `DASHBOARD`, `ADDTEAM` e renderização do modal `Equipe & Acesso`.
- Não foram alteradas fórmulas financeiras, exportação, catálogo, JSON/DB versionados ou design global.

## Compatibilidade

- Registros legados `_revN`, se existirem, continuam sendo agrupados como revisões antigas.
- Novos pedidos de revisão passam a usar apenas o contador `revisao_numero` da proposta original.

## Quick checks

- `pse_v26_codex_revision_cleanup.html` existe.
- `pse_v25_codex_revision_cycle.html` preservado.
- Namespaces principais preservados.
- JSON/DB/catalog files não foram modificados.

## Testes manuais recomendados

- Criar proposta mãe com subequipes e confirmar que não aparece diff imediatamente.
- Enviar para aprovação e confirmar que a partir daí alterações geram diff.
- Solicitar revisão e confirmar que não nasce `*_revN` na lista.
- Confirmar que o contador `Revisão` no título incrementa.
- Abrir `Equipe & Acesso` e adicionar uma nova sub-equipe.
