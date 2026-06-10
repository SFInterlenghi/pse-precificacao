# Implementation Log - V039 Sprint 2

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v038.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v039.html`
- V038 arquivada em `archive/outdated/versions/v038/`

## Implementado

- Boas práticas ESP aplicadas somente a propostas diretas ESP e subpropostas ESP:
  - ticket financeiro mensal abaixo de R$ 42.000,00: erro vermelho;
  - ticket entre R$ 42.000,00 e R$ 60.000,00: aviso amarelo;
  - ausência de software: aviso amarelo;
  - software abaixo de 25% do pessoal total: aviso amarelo.
- Itens EMBRAPII financeiros permitem classificar a origem como EP ou EB.
- Itens econômicos são classificados exclusivamente como SN.
- Compra de equipamento/material permanente e Suporte Operacional são alocados obrigatoriamente em EP.
- Sidebar EMBRAPII separa os três cards de Meta dos três cards de Distribuição Atual.
- Cards atuais informam falta, excesso ou meta atendida para EP, EB e SN.
- Custos financeiros históricos sem origem explícita permanecem não classificados e geram aviso; não houve migração inventada.
- A distribuição atual da proposta mãe usa as alterações ainda não salvas da mãe e agrega as subpropostas salvas.
- Track Changes reconhece alterações em `fonte_recurso`.

## Lógica tocada

- Sim, de forma isolada em validações de boas práticas e classificação da origem dos recursos.
- `CALC`, fórmulas financeiras, persistência e workflow não foram alterados.
- Nenhum JSON/DB foi modificado.

## Verificações

- JavaScript dos quatro blocos `<script>` compilou sem erro.
- Regras isoladas:
  - ESP abaixo de R$ 42 mil: 1 vermelho;
  - ESP entre R$ 42–60 mil: amarelo;
  - ESP com ticket e software adequados: sem alerta;
  - equipe não ESP: sem alerta ESP.
- Composição isolada: EP, EB, SN e não classificado fecharam nas origens esperadas.
- Custo financeiro com origem SN é tratado como não classificado; custo econômico é SN.
- Consolidação de recursos da mãe usa `STATE` corrente + subpropostas e adiciona Suporte a EP.
- Navegador:
  - cenário ESP/EMBRAPII exibiu Meta e Atual separadamente;
  - origens EP/EB apareceram nas rubricas;
  - material permanente não exibiu alternância econômica;
  - um workspace, uma title bar, um aside e nenhum ID duplicado;
  - nenhum erro de console.
- Arquivo V038 arquivado é byte-identical ao blob da V038 commitada.

## Limitações e backlog

- Registros históricos sem `fonte_recurso` exigem classificação manual para compor EP/EB.
- A alocação por macroentrega será tratada nos próximos sprints.
- Auditoria completa multifomento permanece para o sprint final.
