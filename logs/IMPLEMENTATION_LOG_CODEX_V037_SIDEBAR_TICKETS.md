# IMPLEMENTATION LOG - CODEX V037 SIDEBAR TICKETS

## Branch
- `dev`

## Base
- `app/ISIB&F_precificação_de_projetos_v036.html`

## Arquivo gerado
- `app/ISIB&F_precificação_de_projetos_v037.html`

## Mudanças
- Criada a v037 a partir da v036.
- Atualizados metadados internos de versão de `v036/v36` para `v037/v37`.
- Arquivada a v036 em `archive/outdated/versions/`.
- Adicionados dois KPIs na sidebar:
  - `Ticket médio financeiro/mês`;
  - `Ticket médio total/mês`.
- Os tickets usam cálculo linear:
  - ticket financeiro = total financeiro / duração em meses;
  - ticket total = total do projeto / duração em meses.
- Aplicado nos modos:
  - proposta direta;
  - subproposta/equipe;
  - proposta mãe consolidada;
  - visão por equipe da proposta mãe.

## Escopo
- Nenhuma fórmula financeira central foi alterada.
- Nenhuma regra de validação foi alterada.
- Nenhuma persistência/DB foi alterada.

## Checagens
- Sintaxe JS do HTML validada.
- Confirmada presença dos textos dos novos KPIs na v037.
