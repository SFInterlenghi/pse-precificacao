# Implementation Log - V047 Botões de Otimização na Mãe Consolidada

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `archive/outdated/versions/v046/ISIB&F_precificação_de_projetos_v046.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v047.html`
- `main` não foi alterada.

## Problema relatado

- Em uma proposta mãe com subpropostas (ex.: ESP e DAP, cada uma com pessoal,
  material de consumo etc.), os botões `Otimizar HH Técnico`
  (`VAL.optimizeEco()`) e `Otimizar origem financeira`
  (`FUNDING.optimizeFinancialOrigins()`) não apareciam em nenhuma visão da
  proposta mãe.
- Causa raiz: o bloco "Ajustes automáticos" só existia na branch "própria"
  (`TEAM._view==='proprio'`) de `renderResume()`, condicionado a
  `calc.dist && FOMENTO.has(...)`. Em uma mãe com subpropostas,
  `calc.dist` é `null` (a mãe não tem itens próprios), então o bloco nunca
  era montado. Além disso, a branch consolidada
  (`TEAM._view==='consolidado'`, vista padrão "Por Equipe" para mãe+equipes)
  nunca chamava esse bloco.

## Implementações

- Extraído um helper compartilhado `renderFundingAdjustments(calc)`,
  chamado tanto pela view "própria" quanto pela view consolidada
  ("Por Equipe").
- O helper **não depende de `calc.dist`**: ele recalcula o escopo do projeto
  via `VAL.embrapiiScope(STATE, CALC.calcAll(STATE))`, evitando dupla
  contagem independentemente de `calc` ser o total próprio da mãe ou o
  `consol.calc` já consolidado (subpropostas + mãe).
- O gate de exibição passou a ser `totalProj>0` (escopo financeiro do
  projeto inteiro), em vez de `calc.dist` (que só existe quando a mãe tem
  itens próprios).
- `VAL.economicOptimizationStatus(STATE, calc)` e
  `FUNDING.optimizationStatus(calc)` continuam sendo as mesmas funções de
  status já existentes — ambas se autorecalculam quando chamadas com
  `st===STATE`, então funcionam corretamente seja `calc` o total próprio ou
  o consolidado.
- Na branch "própria", o bloco `if(calc.dist&&FOMENTO.has(...)){...}` foi
  substituído por `if(FOMENTO.has(STATE.meta,'embrapii')&&STATE.meta.tipo_proposta!=='equipe'){ h+=FUNDING.sidebar(calc); h+=renderFundingAdjustments(calc); }`.
- Na branch consolidada, foi adicionada a chamada
  `h+=renderFundingAdjustments(consol.calc);` imediatamente após
  `FUNDING.sidebar(consol.calc)`.
- Landing page, `<title>`, comentários e exportação XLSX atualizados para
  v047 (constante `VERSION`, `wb.properties`, títulos de planilha, campo
  "Versao" e nome do arquivo exportado).

## Regras preservadas

- O otimizador pode redistribuir itens entre subpropostas e trocar a fonte
  pagadora, mas **não altera o valor total** do projeto — comportamento
  herdado de `VAL.optimizeEco()` e `FUNDING.optimizeFinancialOrigins()`, que
  não foram modificados nesta versão.
- Nenhuma fórmula de `CALC`, `VAL`, `FUNDING` ou `FUNDING_POLICY` foi
  alterada — esta versão é exclusivamente uma correção de exposição/render
  na sidebar.
- Horas de pessoal e quantidades de consumo continuam inteiras; consultoria
  continua fora da divisão automática (regras inalteradas, reaproveitadas).
- EMBRAPII e SENAI continuam respeitando seus tetos (cálculo inalterado).

## Testes

- `tools/test_v047_sidebar_optimizer_buttons.js` (novo):
  - Confirma estaticamente que `renderResume()` chama
    `renderFundingAdjustments(calc)` na view própria e
    `renderFundingAdjustments(consol.calc)` na view consolidada "Por Equipe".
  - Confirma que o gate antigo `if(calc.dist&&FOMENTO.has(...))` foi removido.
  - Testa `renderFundingAdjustments` isoladamente (extraída via `vm`):
    - vazio quando não há EMBRAPII ou `tipo_proposta==='equipe'`;
    - vazio quando o escopo do projeto (`totalProj`) é zero;
    - botão "Otimizar HH Técnico" aparece quando há déficit de horas
      econômicas;
    - botão "Otimizar origem financeira" aparece quando há origens
      passíveis de otimização;
    - mensagem de bloqueio aparece sem o botão quando
      `FUNDING.optimizationStatus` retorna `blocked:true`;
    - selo "Cota SN Atingida" aparece quando tudo está dentro da meta;
    - funciona com `calc` sem a chave `dist` (cenário da mãe consolidada).
- `tools/test_v047_financial_rules.js` (renomeado de
  `test_v046_financial_rules.js`, path atualizado para v047): continua
  passando sem alterações de regra, confirmando que `FUNDING`/
  `FUNDING_POLICY` permanecem intactos.
- Ambos os blocos `<script>` do HTML validados com `new Function(source)`
  (sem erros de sintaxe).
- Nenhum JSON/DB foi modificado.

## Limitações

- O cenário real com o DB do usuário (proposta mãe + subpropostas ESP/DAP)
  deve ser aberto manualmente no navegador para confirmar visualmente que
  os dois botões aparecem na view "Por Equipe" da proposta mãe.
- Esta correção não altera o comportamento dos otimizadores em si — apenas
  garante que os botões fiquem visíveis quando aplicável.
