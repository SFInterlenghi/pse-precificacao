# Implementation Log - V048 Reescrita do Otimizador de Origem Financeira

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `archive/outdated/versions/v047/ISIB&F_precificação_de_projetos_v047.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v048.html`
- `main` não foi alterada.

## Problema relatado (após teste da v047)

Os botões passaram a aparecer (v047), mas o otimizador produzia resultados errados:

1. A distribuição ultrapassava as metas e os valores originais (total do projeto inflava).
2. Itens de software/equipamento marcados como **econômico/SENAI** eram convertidos para EB/Empresa (proibido pelo regramento); surgiam micro-frações ("1 hora na macro").
3. Apagar um valor e rodar de novo inflava ainda mais a lista e os valores (sem idempotência).
4. Não havia caminho de "sem solução" oferecendo reverter ao estado original.

## Causas-raiz identificadas (auditoria)

- `_optimizeBucket` fazia `_setSource(entry,'ep')` em **todos** os itens, apagando `economico=true`,
  e depois realocava `target.sn` para itens escolhidos por heurística — corrompendo a classificação
  econômica definida pelo usuário (sintoma #2).
- O guard de conservação só checava `totalFin+totalEco`. Para EMBRAPII,
  `total = (dirFin+dirEco)·(1+suporte_pct)` depende só da soma, então um flip econômico↔financeiro
  passava despercebido (sintoma #1).
- `_expandMultiMacroItems` e `_splitForSource` criavam novos fragmentos a cada execução sem nunca
  remesclar → acúmulo infinito de micro-frações (sintoma #3).
- `_expandMultiMacroItems` recalculava `clone.valor = custo_hora·horas` e, para software só-`valor`
  (catálogo, sem `custo_hora`/`horas_uso`), zerava/descartava o item.
- Não existia detecção de inviabilidade com reversão (sintoma #4).

## Decisão de produto (confirmada com o usuário)

- O otimizador de origem **não pode** alterar `economico`. Itens econômicos permanecem SENAI;
  só podem ser **distribuídos entre as macroentregas a que já pertencem** (ex.: Aspen em duas macros
  é dividido nas duas, mas continua SENAI).
- O otimizador redistribui apenas o **pool financeiro entre EP e EB**.
- Sem solução viável → **avisar e oferecer reverter** ao estado original.

## Implementações

- `_optimizeBucket` reescrito: pula itens `economico` (nunca os toca), zera apenas o **financeiro**
  para EP e realoca o alvo de **EB**; não aloca mais SN. EP recebe o resíduo financeiro.
- `optimizationStatus` agora ativa o botão de origem só quando há desvio de **EP/EB** ou custos
  financeiros sem origem — falta de SENAI é tratada pelo otimizador de HH econômico, não aqui.
- Novo `_defragment`/`_mergeFragments`: antes de otimizar, remescla fragmentos de execuções
  anteriores (mesma base + macroentrega + natureza), garantindo **idempotência** e eliminando o
  acúmulo de micro-frações.
- `_expandMultiMacroItems` reescrito: divide por duração em **unidades inteiras (centavos/horas) por
  maior-resto**, preservando o total exato; trata software só-`valor` (catálogo) sem zerar; preserva
  `economico`.
- Guard reforçado em `optimizeFinancialOrigins`: além do total, valida que `totalEco` (contrapartida
  econômica) **não mudou** — cancela e reverte se mudar.
- Novo `_assessResult` + diálogo "Sem solução automática viável": se EB/SN estouram teto, EP fica
  abaixo do mínimo ou EP excede a meta além de 7 p.p., oferece reverter ao estado original.
- Chamada `this._defragment(records)` adicionada antes da expansão multi-macro.
- Landing page, `<title>` e exportação XLSX atualizados para v048.

## Regras preservadas

- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` foi alterada.
- Horas de pessoal e quantidades de consumo permanecem inteiras.
- Consultoria continua fora da divisão automática; material permanente e indiretos permanecem em EP.
- EMBRAPII (EB) não ultrapassa o teto; SENAI é definido pela contrapartida econômica do usuário.
- O valor total do projeto e a contrapartida econômica (SENAI) são invariantes da otimização de origem.

## Testes

- `tools/test_v048_funding_invariants.js` (novo):
  - software só-`valor` multi-macro dividido sem zerar, preservando `economico`;
  - pessoa multi-macro com horas inteiras e total preservado;
  - `_defragment` remescla fragmentos ep+eb e é idempotente;
  - macros/naturezas distintas não se misturam na desfragmentação;
  - `_optimizeBucket` nunca converte econômico→financeiro nem aloca SN;
  - verificações estáticas: ausência de alocação `'sn'`, skip de econômicos, chamada de
    `_defragment`, checagem de `ecoChanged` e `_assessResult`.
- `tools/test_v048_financial_rules.js` (atualizado para o novo modelo):
  - cenário viável de duas macros; totais por macro preservados; EB ≤ teto; soma das fontes == total;
    natureza imutável; inteiros preservados; matp/consultoria em EP.
- `tools/test_v048_sidebar_optimizer_buttons.js` (renomeado): botões presentes nas views própria e
  consolidada.
- Ambos os blocos `<script>` validados com `new Function(source)` (sem erros de sintaxe).
- Nenhum JSON/DB foi modificado.

## Limitações

- O cenário real com o DB do usuário (mãe + ESP/DAP com Aspen econômico) deve ser reaberto no
  navegador para validação visual: rodar "Otimizar origem financeira" não deve mais inflar o total,
  não deve converter SENAI, e rodar duas vezes seguidas deve dar o mesmo resultado.
- Quando a contrapartida econômica do usuário excede o teto SN de uma macro, o caso é genuinamente
  inviável para o otimizador de origem (ele não reduz econômicos) — o diálogo de reversão é acionado;
  o ajuste é manual ou via remoção de contrapartida.
