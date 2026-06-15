# Implementation Log - V051 Auditoria Pré-Lançamento (multi-fomento, tiers, rede de testes)

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `archive/outdated/versions/v050/ISIB&F_precificação_de_projetos_v050.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v051.html`
- `main` não foi alterada.

## Contexto

Auditoria completa antes de promover o beta para a equipe. Endereça o achado crítico do colega
(motor sem testes) e os achados da auditoria interna (multi-fomento, tiers EMBRAPII, diárias).

## Fase A — Rede de segurança (tooling, sem mudança de app)

- `tools/engine.js`: harness que carrega o MOTOR REAL (`DATA, FOMENTO, CALC, FUNDING_POLICY,
  FUNDING, MACRO, VAL, BEST_PRACTICES`) num `vm`, mockando só DOM/persistência/UI. Fim do "mockar o CALC".
- `tools/fixtures.js`: estados sintéticos (sem dado de cliente).
- `tools/test_engine_calc_golden.js`: golden snapshot do `CALC` (7 casos) — trava drift numérico.
- `tools/test_engine_rules_risk.js`: 22 regras regulatórias de risco no `VAL.run` real.
- `tools/run_tests.js`: runner único (exit ≠ 0 em qualquer falha).

## Fase B — Motor multi-fomento

- **Limite de combinação** (`FOMENTO.comboError`): máx. 2 fomentos; **ANP+Petrobras proibido**.
  `ANP = Petrobras` mantido (regras equivalentes).
- **Regime de indiretos mais restritivo** (`FOMENTO.resolveIndirectRegime`): ANEEL > ANP(=Petrobras)
  > EMBRAPII > Sem. `CALC.calcIndirects` passou a ser dirigido pelo regime.
  - **Corrige o crítico C1**: EMBRAPII+ANP agora calcula DOA/CI da ANP (suporte some) e a validação
    de teto ANP que era silenciosamente ignorada volta a disparar. Single-fomento inalterado
    (golden verde).
- **EP ≥ 50% em combo EMBRAPII+regulado** (ANP/ANEEL/Petrobras): vermelho em `VAL.run`; removido o
  antigo check de "limite combinado mínimo" (substituído pela validação por regime).
- **UI**: `NOVA`/`META` bloqueiam combos inválidos e semeiam a distribuição por
  `FOMENTO.defaultDistribution` (50/33/17 em combo regulado, 42/33/25 caso contrário).
- **Migração** (`DB.migrateFomentoRules`): propostas antigas → estado válido (ANP+Petrobras→ANP;
  >2 fomentos→2; EP<50% em combo→50/33/17), com log no histórico.

## Fase C — Tiers EMBRAPII, diárias, mensagens

- **Tier × distribuição (item 10)**: EB = teto do tier (CG 33% / AA1 25% / AA2 20%), SN 25% (puro) /
  17% (combo), EP = restante (≥50% em todo combo). `FOMENTO.tierDistribution` e
  `FOMENTO.syncTierDistribution` aplicam a distribuição **no instante em que o projeto cruza de
  categoria** (CG↔AA1↔AA2), preservando edições do usuário dentro da mesma categoria
  (marcador `meta._embrapii_tier`). Como EP+EB é constante por cenário (75% puro / 83% combo), o
  tier depende só de `totalFin` (sem oscilação). Disparado ao vivo em `UI.afterChange`, reavaliado
  no `optimizeAll` após adicionar HH econômico, e corrigido na migração para dados legados.
- **Diárias** (`FOMENTO.defaultDiaria`): pré-preenchimento R$ 500 (ANP/ANEEL/Petrobras) e R$ 200
  (EMBRAPII). Não é teto — o limite de R$ 900 da ANP segue inalterado.
- **Mensagem obsoleta** "Otimizar HH" → "Otimizar distribuição (EP/EB/SN)".

## Fase D — Verificação

- `tools/test_engine_consolidation.js` (M1): `projectScope` soma mãe + filhas sem dupla contagem;
  indiretos sobre o consolidado; idempotente.
- Suíte completa: **9/9 verde**.
- Golden permanece verde → o refactor multi-fomento **não alterou** o cálculo single-fomento.

## Regras preservadas

- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` foi alterada na essência; `calcIndirects` foi
  reescrito para ser dirigido pelo regime, mas é idêntico para fomento único (provado pelo golden).
- Horas/quantidades inteiras, consultoria/matp/indiretos em EP, conservação de valor do otimizador —
  tudo mantido das versões anteriores.

## Pendências para o lançamento (verificação manual no navegador)

- Roteiro: abrir 1 cenário por fomento + **cada combo válido** (EMBRAPII+ANP, EMBRAPII+ANEEL,
  EMBRAPII+Petrobras, ANEEL+Petrobras) + 1 mãe/filha.
- Confirmar visualmente: bloqueio de ANP+Petrobras; distribuição 50/33/17 ao montar combo; troca
  automática para AA1/AA2 ao cruzar R$ 5M/R$ 10M; diárias pré-preenchidas (500/200).
- Migração: abrir o DB do beta e conferir o log de ajustes nas propostas afetadas.
