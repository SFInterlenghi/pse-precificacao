# Roteiro de validação no navegador — v051 (pré-lançamento)

> Abra `ISIB&F_precificação_de_projetos_v051.html`. **Faça os testes de migração numa CÓPIA do DB**
> do beta (não salve por cima do oficial até validar). Marque `[x]` no que passar.

## 0. Setup e sanity
- [ ] Título da aba/rodapé mostra **v051**.
- [ ] Console do navegador (F12) **sem erros** ao abrir.
- [ ] Crie uma EMBRAPII direta simples (1 pesquisador + 1 software + 1 consumo): totais calculam, a sidebar mostra Meta e Distribuição Atual de EP/EB/SN, e o **export XLSX** abre com os mesmos números da sidebar.

## 1. Limite de combinação de fomentos
- [ ] Nova proposta PD&I → seleciona **EMBRAPII + ANP**: permitido (2 fomentos).
- [ ] Tenta adicionar um **3º** fomento (ex.: ANEEL): **bloqueado** com aviso "Máximo de 2 fomentos".
- [ ] Tenta **ANP + Petrobras**: **bloqueado** com aviso "ANP + Petrobras não é uma combinação válida".
- [ ] Fomento único (só EMBRAPII / só ANP) continua funcionando normal.
- [ ] Repetir o bloqueio na tela de **editar metadados** (META) de uma proposta existente.

## 2. Indiretos multi-fomento (correção do C1)
- [ ] **EMBRAPII + ANP**, com itens: os indiretos exibidos são **DOA 5% + CI 15%** (regra ANP), **não** "Suporte Operacional 15%".
- [ ] **EMBRAPII + ANEEL**: indiretos são **Taxa Adm. 5% + Taxa Infra 5%** (ANEEL, mais restritivo).
- [ ] **EMBRAPII + ANP** com DOA configurado em 9%: aparece **vermelho** de DOA acima do limite (essa regra antes era silenciosamente ignorada no combo).
- [ ] EMBRAPII puro: indireto volta a ser **Suporte 15%** (single-fomento inalterado).

## 3. EP ≥ 50% em combo EMBRAPII + regulado
- [ ] Ao montar **EMBRAPII + ANP** (ou +ANEEL/+Petrobras), a distribuição já nasce **EP 50 / EB 33 / SN 17** (ver Configurações Gerais).
- [ ] Baixar EP para 45% → **vermelho** "Empresa Parceira deve ser no mínimo 50%".
- [ ] Voltar EP ≥ 50% (somando 100%) → vermelho some. Ajustar EB/SN livremente (mantendo soma 100% e EP≥50%) é permitido.

## 4. Tiers EMBRAPII — troca automática ao cruzar de categoria
- [ ] EMBRAPII puro pequeno (**< R$ 5M** de total do projeto): EP **42** / EB **33** / SN **25**.
- [ ] Adicionar itens até o **total do projeto** (Meta de recursos) ultrapassar **R$ 5.000.000**: aparece toast "Projeto agora é Alta Alavancagem 1" e a distribuição muda para **EP 50 / EB 25 / SN 25**.
- [ ] Ultrapassar **R$ 10.000.000**: vira **AA2** → **EP 55 / EB 20 / SN 25**.
- [ ] Remover itens e voltar abaixo de R$ 5M: volta para **CG (42/33/25)**.
- [ ] Dentro da mesma categoria, editar EB manualmente (ex.: 30%) **não** é desfeito sozinho (só troca ao cruzar de faixa).
- [ ] Combo **EMBRAPII + ANP** cruzando R$ 5M → **EP 58 / EB 25 / SN 17** (EP nunca < 50%).

## 5. Otimizador respeita tier + EP 50% (botão "Otimizar distribuição (EP/EB/SN)")
- [ ] Combo EMBRAPII+ANP **≥ R$ 5M**: rodar o otimizador → **EB termina ≤ 25%**, **EP ≥ 50%**, **sem vermelho** de teto de tier.
- [ ] O otimizador **não** empurra EB para 33% num projeto AA1/AA2.
- [ ] Rodar o otimizador **duas vezes seguidas** → mesmo resultado (idempotente, sem inflar).
- [ ] Confirmar que os **valores financeiros das rubricas não mudaram** após otimizar (só a fonte EP/EB).

## 6. Diárias (pré-preenchimento, não é teto)
- [ ] Projeto **ANP / ANEEL / Petrobras**: adicionar viagem → diária pré-preenchida **R$ 500**.
- [ ] Projeto **EMBRAPII**: adicionar viagem → diária pré-preenchida **R$ 200**.
- [ ] ANP: colocar diária **R$ 1.000** (nacional) → **vermelho** do teto de R$ 900 ainda dispara (cap inalterado).

## 7. Migração de propostas antigas (USAR CÓPIA DO DB)
- [ ] Abrir o DB do beta (cópia). Não deve quebrar nenhuma proposta.
- [ ] Em propostas que eram combo inválido / EP<50% / EB acima do tier: conferir no **histórico** da proposta a entrada **"migracao_fomento_v051"** com o que foi ajustado.
- [ ] Spot-check 2–3 propostas reais: valores financeiros coerentes, distribuição válida.
- [ ] Só depois de conferir: salvar o DB.

## 8. Regressão do otimizador (v047–v050)
- [ ] Proposta **"What"** (ou similar com macroentregas): rodar o otimizador → **não** aparece "sem solução viável" indevido; EP≈42 / EB≈33 / SN≈25 (EMBRAPII puro) no projeto.
- [ ] Proposta mãe + subpropostas (ESP/DAP): o botão "Otimizar distribuição" aparece e não infla o total; SENAI não é convertido em financeiro.

## 9. Fechamento
- [ ] Export XLSX de um combo: números batem com a sidebar.
- [ ] Nenhum erro no console durante todo o roteiro.

---
**Resultado:** se tudo acima passar, autorizar o push dos 6 commits para `origin/dev_v038_beta_rules`
e promover para a branch da equipe.
