'use strict';
// Testes das regras regulatórias de MAIOR RISCO, rodando VAL.run + CALC.calcAll REAIS.
// Cada caso: um estado que DEVE disparar o vermelho/amarelo + (quando aplicável) um
// estado conforme que NÃO dispara. Pega regressão silenciosa nos tetos que, se quebrados,
// deixam passar proposta não-conforme.
const assert = require('node:assert/strict');
const { loadEngine, blankState } = require('./engine.js');

const E = loadEngine();

function runVal(over = {}) {
  const st = blankState();
  if (over.meta) Object.assign(st.meta, over.meta);
  if (over.config) Object.assign(st.config, over.config);
  ['ptec', 'padm', 'viagens', 'soft', 'equip', 'cons', 'serv', 'matp'].forEach(k => { if (over[k]) st[k] = over[k]; });
  if (st.meta.fomentos && st.meta.fomentos.length) st.meta.fomento = st.meta.fomentos[0];
  const calc = E.CALC.calcAll(st);
  const res = E.VAL.run(st, calc);
  return { reds: res.reds.map(r => r.msg), yellows: res.yellows.map(y => y.msg) };
}
const has = (list, substr) => list.some(m => m.includes(substr));

let n = 0;
function check(label, cond) { n++; assert.ok(cond, `FALHOU: ${label}`); }

const emb = (over = {}) => ({ meta: { fomentos: ['embrapii'], tipo_proposta: 'direta', tipo_proj: 'pdi' }, ...over });
const anp = (over = {}) => ({ meta: { fomentos: ['anp'], tipo_proposta: 'direta', tipo_proj: 'pdi' }, ...over });
const aneel = (over = {}) => ({ meta: { fomentos: ['aneel'], tipo_proposta: 'direta', tipo_proj: 'pdi' }, ...over });
const petro = (over = {}) => ({ meta: { fomentos: ['petrobras'], tipo_proposta: 'direta', tipo_proj: 'pdi' }, ...over });
const ptecFin = (h = 1000) => ([{ id: 'p1', cargo: 'pesquisador_qms_iv', horas: h, meses: 18, enc: true, economico: false }]);

// ───────── EMBRAPII ─────────
// 1) Soma EP+EB+SN ≠ 100%
check('EMBRAPII soma ≠ 100% dispara', has(runVal(emb({ ptec: ptecFin(), config: ep(0.42, 0.33, 0.20) })).reds, 'exatamente 100%'));
check('EMBRAPII soma = 100% não dispara', !has(runVal(emb({ ptec: ptecFin(), config: ep(0.42, 0.33, 0.25) })).reds, 'exatamente 100%'));
// 2) EB < 10%
check('EMBRAPII EB<10% dispara', has(runVal(emb({ ptec: ptecFin(), config: ep(0.65, 0.05, 0.30) })).reds, 'abaixo do mínimo de 10%'));
// 3) EP < 10%
check('EMBRAPII EP<10% dispara', has(runVal(emb({ ptec: ptecFin(), config: ep(0.05, 0.65, 0.30) })).reds, 'Participação Empresa'));
// 4) Suporte > 15%
check('EMBRAPII suporte>15% dispara', has(runVal(emb({ ptec: ptecFin(), config: { suporte_pct: 0.16 } })).reds, 'Suporte Operacional'));
// 5) Material permanente econômico (deve ser pago pela Empresa)
check('EMBRAPII matp econômico dispara', has(runVal(emb({ ptec: ptecFin(), matp: [{ id: 'm', nome: 'Eq', valor: 1000, economico: true }] })).reds, 'só pode ser paga pela Empresa Parceira'));
// 6) Serviços PD&I de terceiros > 30% do total
check('EMBRAPII serv PD&I>30% dispara', has(runVal(emb({ ptec: ptecFin(100), serv: [{ id: 's', nome: 'X', cat: 'pdi', valor: 500000, economico: false }] })).reds, 'excede 30%'));
// 7) Aporte econômico insuficiente (meta SN)
check('EMBRAPII aporte econômico insuficiente dispara', has(runVal(emb({ ptec: ptecFin(), config: ep(0.42, 0.33, 0.25) })).reds, 'Aporte econômico insuficiente'));

// ───────── ANP ─────────
// 8) DOA acima do limite (5%)
check('ANP DOA>5% dispara', has(runVal(anp({ ptec: ptecFin(), config: { doa_pct: 0.06, ci_pct: 0.15 } })).reds, 'DOA'));
check('ANP DOA=5% não dispara', !has(runVal(anp({ ptec: ptecFin(), config: { doa_pct: 0.05, ci_pct: 0.15 } })).reds, 'acima do limite'));
// 9) CI acima de 15%
check('ANP CI>15% dispara', has(runVal(anp({ ptec: ptecFin(), config: { doa_pct: 0.05, ci_pct: 0.16 } })).reds, 'Custos Indiretos'));
// 10) Diária > R$900
check('ANP diária>900 dispara', has(runVal(anp({ ptec: ptecFin(), viagens: [{ id: 'v', destino: 'SP', tipo: 'nacional', tem_diaria: true, diaria_valor: 1000, diaria_dias: 1, diaria_pessoas: 1, n_pessoas: 1, valor_passagem: 0 }] })).reds, 'excede máximo de R$900'));
check('ANP diária=500 não dispara', !has(runVal(anp({ ptec: ptecFin(), viagens: [{ id: 'v', destino: 'SP', tipo: 'nacional', tem_diaria: true, diaria_valor: 500, diaria_dias: 1, diaria_pessoas: 1, n_pessoas: 1, valor_passagem: 0 }] })).reds, 'R$900'));
// 11) Equipamento > 30% do total
check('ANP equip>30% dispara', has(runVal(anp({ ptec: ptecFin(100), matp: [{ id: 'm', nome: 'Eq', valor: 300000, economico: false }] })).reds, 'excede 30%'));
// 12) Equipamento > R$5M (absoluto)
check('ANP equip>R$5M dispara', has(runVal(anp({ ptec: ptecFin(), matp: [{ id: 'm', nome: 'Eq', valor: 6000000, economico: false }] })).reds, 'excede R$5M'));
// 13) Serviço PD&I de terceiros é proibido em ANP
check('ANP serv PD&I proibido dispara', has(runVal(anp({ ptec: ptecFin(), serv: [{ id: 's', nome: 'X', cat: 'pdi', valor: 1000, economico: false }] })).reds, 'proíbe expressamente'));

// ───────── ANEEL ─────────
// 14) Taxa Administrativa > 5%
check('ANEEL taxa adm>5% dispara', has(runVal(aneel({ ptec: ptecFin(), config: { doa_aneel_pct: 0.06, ci_aneel_pct: 0.05 } })).reds, 'Taxa Administrativa'));
// 15) Taxa de Infraestrutura > 5%
check('ANEEL taxa infra>5% dispara', has(runVal(aneel({ ptec: ptecFin(), config: { doa_aneel_pct: 0.05, ci_aneel_pct: 0.06 } })).reds, 'Taxa de Infraestrutura'));

// ───────── Petrobras ─────────
// 16) Dedicação > 41h/sem
check('Petrobras >41h/sem dispara', has(runVal(petro({ ptec: [{ id: 'p', cargo: 'pesquisador_qms_iv', horas: 4000, meses: 18, enc: true, economico: false }] })).reds, 'h/sem'));
// 17) ICT pública > 20h/sem
check('Petrobras ICT pública >20h/sem dispara', has(runVal(petro({ ptec: [{ id: 'p', cargo: 'pesquisador_qms_iv', horas: 2000, meses: 18, enc: true, ict_pub: true, economico: false }] })).reds, '20h/sem'));

// ───────── Inteiros (todas as famílias) ─────────
// 18) Horas de pessoal fracionárias
check('Horas fracionárias dispara', has(runVal(emb({ ptec: [{ id: 'p', cargo: 'pesquisador_qms_iv', horas: 100.5, meses: 18, enc: true, economico: false }] })).reds, 'número inteiro'));
// 19) Quantidade de consumo fracionária
check('Consumo fracionário dispara', has(runVal(emb({ ptec: ptecFin(), cons: [{ id: 'c', nome: 'R', quantidade: 2.5, valor: 100, economico: false }] })).reds, 'quantidade deve ser um número inteiro'));

function ep(e, b, s) { return { ep_pct: e, eb_pct: b, sn_pct: s }; }

console.log(`test_engine_rules_risk: OK (${n} casos de regra conferidos)`);
