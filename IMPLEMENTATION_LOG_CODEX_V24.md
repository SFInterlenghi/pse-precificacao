# Implementação Codex V24 — Revision Tracking Hotfix

Gerado em 2026-05-11.

## Base

- Branch de trabalho: `v23-codex-beta-fixes`.
- Base: `pse_v23_codex_beta_fixes.html`.
- Arquivo criado: `pse_v24_codex_revision_tracking.html`.
- Landing/title atualizados para `v0.24` / `v24`.

## Problema investigado

- Com o `ISIBF_DB.json` gerado em beta, colaboradores e gestores já conseguiam ver/editar as propostas corretas.
- Ao editar subpropostas como gestora/aprovadora, alterações em rubricas podiam não entrar no controle de revisão.
- Causa principal: `DB.maybeAutoRevisionSnapshot()` ignorava propostas com status `em_elaboracao`.
- No fluxo beta, subpropostas permanecem `em_elaboracao` mesmo depois de salvas/submetidas como parte da proposta mãe.

## Correções implementadas

- `DB.maybeAutoRevisionSnapshot()` agora cria `state_base` para gestor/LT quando a proposta já existe no DB, mesmo se ainda estiver `em_elaboracao`.
- Adicionados gatilhos de snapshot antes de mutações de rubricas, incluindo:
  - adicionar, editar e remover PTEC;
  - adicionar, editar e remover PADM;
  - adicionar, editar e remover viagens;
  - adicionar/remover diária;
  - estimativa de voo;
  - adicionar, editar e remover software;
  - adicionar, editar e remover equipamentos;
  - adicionar, editar e remover consumíveis;
  - importação de catálogo de consumíveis;
  - adicionar, editar e remover serviços;
  - adicionar, editar e remover material permanente;
  - alterações de configuração.
- A lógica continua restrita a usuários resolvidos como `gestor` ou `lider_tecnico`.

## Lógica tocada

- Sim, de forma localizada no gatilho de snapshot/revisão e em chamadas antes de mutações.
- Não foram alteradas fórmulas financeiras, exportação, permissões de aprovação ou schema incompatível.

## Quick checks

- `pse_v24_codex_revision_tracking.html` existe.
- `pse_v23_codex_beta_fixes.html` preservado.
- `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH` e `PRICE_CAT` preservados.
- JSON/DB/catalog files não foram modificados.

## Testes manuais recomendados

- Carregar o `ISIBF_DB.json` beta.
- Entrar como `acsdias@firjan.com.br`.
- Abrir uma subproposta com item existente em PTEC.
- Deletar uma linha e confirmar que o modo revisão aparece e o item removido fica em destaque.
- Editar valor/campo em consumíveis, software, serviços e equipamentos e confirmar diff.
- Atualizar DB e reabrir como colaborador para confirmar que o pedido de revisão permanece visível.
