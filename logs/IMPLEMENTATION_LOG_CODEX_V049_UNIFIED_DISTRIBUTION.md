# Implementation Log - V049 Botão Único de Distribuição EP/EB/SN

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `archive/outdated/versions/v048/ISIB&F_precificação_de_projetos_v048.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v049.html`
- `main` não foi alterada.

## Problema relatado (após teste da v048)

- O card lateral mostrava "Faltam R$ 755.994,79 de aporte econômico" enquanto a meta SN exibida
  era R$ 627.995,59 — parecia impossível (déficit maior que a própria meta).
- "Otimizar HH Técnico" adicionava pessoas e inflava o projeto.
- "Otimizar fontes" deixava o EP estourar a meta (excesso > 500 mil), porque o econômico estava
  muito abaixo de 25% e o buraco do SENAI caía todo no EP.

## Diagnóstico

- Duas definições de meta SN brigando: o card usa `(totalFin+totalEco)·25%` (sobre o total atual,
  baixo); o otimizador econômico usa `totalFin/3` (o quanto adicionar para o econômico virar 25% do
  total final). Ambas corretas para sua fórmula, mas inconsistentes na tela.
- A v048 já conservava o total no "Otimizar fontes"; o EP inchava porque, com o econômico em ~2,4%,
  o EB no teto (33%), o restante (incl. ~567 mil de SENAI faltante) caía forçosamente no EP.

## Decisão de produto (confirmada com o usuário)

- O invariante é: **o valor FINANCEIRO de cada rubrica não pode mudar.** Adicionar HH econômico como
  contrapartida (que aumenta o total) é permitido; alterar o financeiro configurado não é.
- Qualquer rubrica pode compor a contrapartida econômica.
- Unificar em **um único botão** com a ordem: 1) maximizar EB no pool financeiro sem ultrapassar a
  meta (resto na Empresa); 2) completar o econômico que falta como HH econômico; 3) distribuir o
  econômico por macroentrega.

## Implementações

- Novo `FUNDING.optimizeAll()` — botão único "Otimizar distribuição (EP/EB/SN)":
  1. Calcula o déficit econômico (com o feedback do suporte) e **adiciona HH econômico** para fechar
     os 25% do total final — primeiro, para que o teto de EB use o total final correto e o EP pare de
     inchar.
  2. Desfragmenta (idempotência), divide itens multi-macro e distribui o **pool financeiro entre
     EP/EB** maximizando a EMBRAPII até a meta (resto na Empresa).
  3. Distribui o econômico por macroentrega (horas inteiras).
- Novo `VAL._addEconomicContrapartida()` — núcleo reutilizável extraído de `optimizeEco`: calcula o
  déficit e adiciona HH econômico (cargos CLT), sem render/toast. Retorna `{added,hours,role,...}`.
- **Guard de conservação trocado**: agora valida que o **`dirFin` (financeiro direto) não muda**
  (antes validava `totalEco`, incompatível com a permissão de adicionar econômico). Se o financeiro
  mudar, cancela e reverte.
- `_assessResult` + diálogo "Sem solução automática viável" mantidos: oferece reverter ao estado
  original quando as metas não fecham dentro da tolerância.
- Sidebar (`renderFundingAdjustments`) passou a exibir **um único botão** chamando
  `FUNDING.optimizeAll()`, substituindo os dois antigos ("Otimizar HH Técnico" e "Otimizar origem
  financeira"). Mostra status do econômico e do financeiro, e um selo "Distribuição EP/EB/SN nas
  metas" quando tudo está fechado.
- `optimizeEco` e `optimizeFinancialOrigins` permanecem definidos (não removidos), mas não são mais
  acionados por botão.
- Landing page, `<title>` e exportação XLSX atualizados para v049.

## Regras preservadas

- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` foi alterada.
- O **valor financeiro direto de cada rubrica é invariante** da otimização (guard de `dirFin`).
- Itens marcados como econômicos pelo usuário permanecem econômicos (SENAI); itens financeiros nunca
  viram econômicos automaticamente — o econômico só cresce por HH novo adicionado como contrapartida.
- Horas de pessoal e quantidades de consumo permanecem inteiras.
- EB nunca ultrapassa o teto; consultoria, material permanente e indiretos permanecem em EP.

## Testes

- `tools/test_v049_unified_optimizer.js` (novo):
  - `VAL._addEconomicContrapartida` adiciona o HH econômico correto (cargo CLT, horas certas) e é
    no-op quando não há déficit;
  - verificações estruturais: `optimizeAll` calcula o econômico antes de distribuir o financeiro,
    tem guard de `dirFin`, chama `_assessResult`, e não trava por mudança do econômico;
  - a sidebar usa o botão único `FUNDING.optimizeAll()` (botões antigos removidos da sidebar).
- `tools/test_v049_funding_invariants.js`: imutabilidade do econômico, split só-`valor`, idempotência
  do `_defragment`, `_optimizeBucket` não aloca SN.
- `tools/test_v049_financial_rules.js`: cenário viável de duas macros; totais por macro preservados;
  EB ≤ teto; natureza imutável; inteiros; matp/consultoria em EP.
- `tools/test_v049_sidebar_optimizer_buttons.js`: botão único nas views própria e consolidada.
- Ambos os blocos `<script>` validados com `new Function(source)`.
- Nenhum JSON/DB foi modificado.

## Limitações

- Validação visual no navegador é necessária com o DB real (mãe + ESP/DAP): rodar o botão único deve
  (a) não alterar o valor financeiro das rubricas, (b) trazer o econômico para ~25% adicionando HH,
  (c) deixar EP≈42% e EB≈33%, e (d) ser idempotente (rodar duas vezes = mesmo resultado, sem somar
  HH de novo).
- A contrapartida econômica é adicionada como HH técnico genérico (placeholder), distribuído por
  macro; o usuário pode depois ajustar cargos/pessoas manualmente.
- O econômico é completado no nível global do projeto e rateado por macro pela duração; o fechamento
  exato dos 25% por macro individual pode ter pequenos resíduos absorvidos pela Empresa.
