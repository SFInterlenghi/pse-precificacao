# Implementation Log - V041 Sprint 4

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v040.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v041.html`
- V040 arquivada em `archive/outdated/versions/v040/`

## Implementado

- Associação obrigatória de itens às macroentregas no modo EMBRAPII por macro:
  - pessoas técnicas e administrativas podem atuar em uma ou mais macros;
  - viagens, software, equipamentos, consumíveis, serviços e material permanente pertencem a uma única macro.
- Novos itens começam sem macro definida para exigir decisão explícita do usuário.
- Itens históricos permanecem compatíveis e passam a exibir erro de atribuição somente quando a proposta usa o modo por macroentregas.
- Pessoas são rateadas linearmente entre as macros selecionadas, proporcionalmente à duração de cada etapa.
- Itens não pessoais entram integralmente na macro escolhida.
- Custos indiretos do projeto mãe são distribuídos proporcionalmente à base direta de cada macro, sem alterar a fórmula de `CALC`.
- Suporte Operacional EMBRAPII permanece financeiro e alocado à Empresa Parceira.
- Nova visão `Por Macroentrega` na sidebar:
  - valor total e período de cada macro;
  - mês genérico do desembolso inicial;
  - composição por rubrica;
  - composição por equipe na proposta mãe;
  - meta EP/EB/SN;
  - distribuição atual e diferenças por fonte.
- Validações vermelhas para:
  - item sem macro;
  - referência a macro removida;
  - valor financeiro sem origem EP/EB;
  - distribuição EP/EB/SN divergente da meta em cada macro.
- O otimizador econômico associa automaticamente as pessoas geradas a todas as macros, pois o ajuste é consolidado para todo o projeto.

## Lógica tocada

- Sim, somente a nova camada `MACRO` de atribuição, rateio, cronograma e validação.
- `CALC` e suas fórmulas financeiras não foram alterados.
- Nenhum JSON/DB foi modificado.

## Verificações

- JavaScript dos quatro blocos `<script>` compilou sem erro.
- Teste isolado de mãe + subproposta:
  - total consolidado: `R$ 9.890,00`;
  - macros: `R$ 6.440,00`, `R$ 1.840,00` e `R$ 1.610,00`;
  - diferença entre cronograma e consolidado: zero;
  - inícios derivados: meses 1, 7 e 15;
  - pessoa em múltiplas macros foi rateada pelas durações;
  - item sem macro gerou um erro;
  - desvios de contrapartida por macro foram detectados.
- A página v041 abriu com título e versão corretos e sem erro de console.
- Todos os oito grupos de rubricas possuem controle de macro.
- `git diff --check` passou.

## Limitações conhecidas

- A exportação XLSX ainda não inclui o cronograma por macroentrega.
- Histórico e relatório de revisão ainda usam os nomes técnicos `macro_id` e `macro_ids`.
- Propostas históricas em modo tradicional não são alteradas.

## Próximo sprint

- Integrar macroentregas à exportação, histórico, revisão, migração e demais superfícies de auditoria.
