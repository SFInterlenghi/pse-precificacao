# Implementation Log - V050 Viabilidade por Projeto e Contrapartida por Macro

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `archive/outdated/versions/v049/ISIB&F_precificação_de_projetos_v049.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v050.html`
- `main` não foi alterada.

## Problema relatado (após teste da v049)

- Na proposta direta "What" (`ISIB&F-2026-0030`, 3 macroentregas de 6 meses), o otimizador reportou
  "sem solução automática viável", mas ao prosseguir o resultado ficou ótimo (no projeto: EP excesso
  R$ 93,26; EB faltam R$ 172,05; SN excesso R$ 78,79 — desvios < R$200 em ~R$2,6M).

## Diagnóstico (confirmado com o backup do usuário)

- A v049 adicionava a contrapartida econômica dividida **por duração** das macros. Como as 3 macros
  tinham a mesma duração, o econômico foi distribuído em **partes iguais** (~1.795h por macro).
- Mas o **financeiro por macro era desigual**: a macro_2 tinha R$ 30.000 de Consultoria a mais que
  as macros 1 e 3. Logo, macros 1 e 3 (menos financeiro, mesmo econômico) ficaram com SN ~0,4% acima
  do seu 25% individual.
- `_assessResult` avaliava **macro a macro** com regra dura ("SENAI acima do teto" = inviável).
  Como duas macros ficaram marginalmente acima do 25% por-macro, disparou o falso "sem solução" —
  mesmo o **projeto inteiro** estando dentro das metas.

## Correção

1. **Contrapartida econômica distribuída por macro proporcional ao financeiro** de cada uma
   (`VAL._addEconomicContrapartida`): em vez de ratear o aporte por duração, ele agora usa o peso do
   `m.financial` de cada macroentrega (via `MACRO.buildSchedule`), de modo que cada macro tende a
   ~25% de SN. O total adicionado continua sendo exatamente o déficit. Para propostas sem macro, o
   comportamento é o mesmo de antes.
2. **Viabilidade avaliada no nível de PROJETO** (`_assessResult`): a meta EMBRAPII (25%/33%/42%) é de
   projeto; resíduos minúsculos por macro (arredondamento de horas inteiras) não invalidam mais uma
   distribuição globalmente correta. O `FUNDING_POLICY.assess` (que detecta EB/SN acima do teto, EP
   abaixo do mínimo e EP além de 7 p.p.) passou a ser aplicado sobre o consolidado.

## Regras preservadas

- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` foi alterada.
- O valor financeiro direto das rubricas (`dirFin`) continua invariante (guard de `optimizeAll`).
- Itens econômicos do usuário permanecem econômicos; o econômico só cresce por HH novo adicionado.
- Horas inteiras; EB nunca acima do teto; consultoria/matp/indiretos em EP.
- O cálculo do déficit econômico (com feedback do suporte) é o mesmo da v044+.

## Testes

- `tools/test_v050_unified_optimizer.js` (atualizado):
  - novo caso: com macroentregas, o aporte econômico vai para a macro com mais financeiro
    proporcionalmente (m1 com 3× o financeiro recebe ~3× a contrapartida); total ≈ déficit/rate;
  - verificação estrutural: `_assessResult` usa o consolidado do projeto e não itera macro a macro.
- `tools/test_v050_funding_invariants.js`, `test_v050_financial_rules.js`,
  `test_v050_sidebar_optimizer_buttons.js`: inalterados em conteúdo, repassando em v050.
- Ambos os blocos `<script>` validados com `new Function(source)`.
- Nenhum JSON/DB foi modificado.

## Limitações

- A contrapartida é adicionada como HH técnico genérico (cargo CLT mais econômico em cabeças),
  agora segmentada por macroentrega; o usuário pode ajustar cargos/pessoas manualmente.
- O fechamento por macro fica próximo de 25% (resíduo de arredondamento de horas inteiras absorvido
  pela Empresa); a meta é garantida no consolidado do projeto.
- Validação visual no navegador com o DB real ("What") recomendada: rodar o botão único não deve mais
  reportar "sem solução" e deve trazer EP≈42%, EB≈33%, SN≈25% no projeto.
