'use strict';
// Especificação executável do MOTOR multi-fomento (v051), rodando CALC/VAL/FOMENTO reais.
// Regras: máx. 2 fomentos; ANP+Petrobras proibido; indiretos pelo regime mais restritivo
// (ANEEL > ANP=Petrobras > EMBRAPII); EMBRAPII em combo regulado exige EP ≥ 50%.
const assert = require('node:assert/strict');
const { loadEngine, blankState } = require('./engine.js');

const E = loadEngine();
const r2 = v => Math.round((+v || 0) * 100) / 100;

function calc(fomentos, over = {}) {
  const st = blankState();
  st.meta.fomentos = fomentos.slice(); st.meta.fomento = fomentos[0];
  if (over.config) Object.assign(st.config, over.config);
  if (over.meta) Object.assign(st.meta, over.meta);
  ['ptec', 'padm', 'soft', 'cons', 'serv', 'matp', 'viagens', 'equip'].forEach(k => { if (over[k]) st[k] = over[k]; });
  return { st, c: E.CALC.calcAll(st) };
}
function valOf(fomentos, over = {}) {
  const { st, c } = calc(fomentos, over);
  const r = E.VAL.run(st, c);
  return { reds: r.reds.map(x => x.msg), yellows: r.yellows.map(x => x.msg), calc: c };
}
const has = (l, s) => l.some(m => m.includes(s));
const ptec = (h = 1000) => ([{ id: 'p', cargo: 'pesquisador_qms_iv', horas: h, meses: 18, enc: true, economico: false }]);
let n = 0; const ok = (label, cond) => { n++; assert.ok(cond, 'FALHOU: ' + label); };

// ── resolveIndirectRegime: mais restritivo vence ──
ok('regime embrapii sozinho', E.FOMENTO.resolveIndirectRegime({ fomentos: ['embrapii'] }) === 'embrapii');
ok('regime anp sozinho', E.FOMENTO.resolveIndirectRegime({ fomentos: ['anp'] }) === 'anp');
ok('regime petrobras = anp', E.FOMENTO.resolveIndirectRegime({ fomentos: ['petrobras'] }) === 'anp');
ok('regime aneel sozinho', E.FOMENTO.resolveIndirectRegime({ fomentos: ['aneel'] }) === 'aneel');
ok('embrapii+anp → anp', E.FOMENTO.resolveIndirectRegime({ fomentos: ['embrapii', 'anp'] }) === 'anp');
ok('embrapii+aneel → aneel', E.FOMENTO.resolveIndirectRegime({ fomentos: ['embrapii', 'aneel'] }) === 'aneel');
ok('aneel+petrobras → aneel', E.FOMENTO.resolveIndirectRegime({ fomentos: ['aneel', 'petrobras'] }) === 'aneel');
ok('embrapii+petrobras → anp', E.FOMENTO.resolveIndirectRegime({ fomentos: ['embrapii', 'petrobras'] }) === 'anp');

// ── calcIndirects segue o regime governante (corrige o gap crítico C1) ──
{
  // EMBRAPII+ANP: indiretos da ANP (DOA 5% + CI 15% sobre diretos), SEM suporte EMBRAPII.
  const { c } = calc(['embrapii', 'anp'], { ptec: ptec() });
  const ids = c.inds.map(i => i.id).sort();
  ok('embrapii+anp tem DOA+CI', JSON.stringify(ids) === JSON.stringify(['ci', 'doa']));
  ok('embrapii+anp não tem suporte', !c.inds.some(i => i.id === 'suporte'));
  ok('embrapii+anp DOA=5% sobre diretos', r2(c.inds.find(i => i.id === 'doa').val) === r2(c.dirFin * 0.05));
  ok('embrapii+anp CI=15% sobre diretos', r2(c.inds.find(i => i.id === 'ci').val) === r2(c.dirFin * 0.15));
}
{
  // EMBRAPII+ANEEL: indiretos da ANEEL (5%+5%), regime mais restritivo.
  const { c } = calc(['embrapii', 'aneel'], { ptec: ptec() });
  const ids = c.inds.map(i => i.id).sort();
  ok('embrapii+aneel tem taxas ANEEL', JSON.stringify(ids) === JSON.stringify(['ci_aneel', 'doa_aneel']));
  ok('embrapii+aneel não tem suporte', !c.inds.some(i => i.id === 'suporte'));
}

// ── comboError: limite de combinação ──
ok('máx 2 fomentos: 3 dispara', !!E.FOMENTO.comboError({ fomentos: ['embrapii', 'anp', 'aneel'] }));
ok('anp+petrobras proibido', !!E.FOMENTO.comboError({ fomentos: ['anp', 'petrobras'] }));
ok('embrapii+anp válido', E.FOMENTO.comboError({ fomentos: ['embrapii', 'anp'] }) === null);
ok('fomento único válido', E.FOMENTO.comboError({ fomentos: ['embrapii'] }) === null);
ok('VAL dispara combo inválido', has(valOf(['anp', 'petrobras'], { ptec: ptec() }).reds, 'ANP + Petrobras'));

// ── EMBRAPII+regulado: EP ≥ 50% ──
ok('embrapii+anp EP<50% dispara', has(valOf(['embrapii', 'anp'], { ptec: ptec(), config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 } }).reds, 'no mínimo 50'));
ok('embrapii+anp EP=50% não dispara', !has(valOf(['embrapii', 'anp'], { ptec: ptec(), config: { ep_pct: 0.50, eb_pct: 0.33, sn_pct: 0.17 } }).reds, 'no mínimo 50'));
ok('embrapii sozinho NÃO exige 50%', !has(valOf(['embrapii'], { ptec: ptec(), config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 } }).reds, 'no mínimo 50'));

// ── ANP DOA/CI agora VALIDADO em combo (antes era silenciosamente ignorado) ──
ok('embrapii+anp valida teto DOA', has(valOf(['embrapii', 'anp'], { ptec: ptec(), config: { ep_pct: 0.50, eb_pct: 0.33, sn_pct: 0.17, doa_pct: 0.09 } }).reds, 'DOA'));

// ── defaultDistribution ──
{
  const d = E.FOMENTO.defaultDistribution({ fomentos: ['embrapii', 'anp'] });
  ok('combo default EP=50', d.ep_pct === 0.50 && d.eb_pct === 0.33 && d.sn_pct === 0.17);
  const d2 = E.FOMENTO.defaultDistribution({ fomentos: ['embrapii'] });
  ok('embrapii default EP=42', d2.ep_pct === 0.42 && d2.sn_pct === 0.25);
}

// ── Diária pré-preenchida por fomento (default, não teto) ──
ok('diária ANP=500', E.FOMENTO.defaultDiaria({ fomentos: ['anp'] }) === 500);
ok('diária ANEEL=500', E.FOMENTO.defaultDiaria({ fomentos: ['aneel'] }) === 500);
ok('diária Petrobras=500', E.FOMENTO.defaultDiaria({ fomentos: ['petrobras'] }) === 500);
ok('diária EMBRAPII=200', E.FOMENTO.defaultDiaria({ fomentos: ['embrapii'] }) === 200);
ok('diária combo regulado=500', E.FOMENTO.defaultDiaria({ fomentos: ['embrapii', 'anp'] }) === 500);

// ── Tier × distribuição (item 10): EB = teto do tier; SN 25/17; EP = resto ──
const TD = (fomentos, total) => E.FOMENTO.tierDistribution({ fomentos }, { total });
const eq3 = (d, ep, eb, sn) => r2(d.ep_pct) === ep && r2(d.eb_pct) === eb && r2(d.sn_pct) === sn;
// Standalone EMBRAPII
ok('CG puro 42/33/25', eq3(TD(['embrapii'], 1e6), 0.42, 0.33, 0.25));
ok('AA1 puro 50/25/25', eq3(TD(['embrapii'], 7e6), 0.50, 0.25, 0.25));
ok('AA2 puro 55/20/25', eq3(TD(['embrapii'], 12e6), 0.55, 0.20, 0.25));
// Combo EMBRAPII+regulado
ok('CG combo 50/33/17', eq3(TD(['embrapii', 'anp'], 1e6), 0.50, 0.33, 0.17));
ok('AA1 combo 58/25/17', eq3(TD(['embrapii', 'anp'], 7e6), 0.58, 0.25, 0.17));
ok('AA2 combo 63/20/17', eq3(TD(['embrapii', 'anp'], 12e6), 0.63, 0.20, 0.17));
// EP nunca abaixo de 50% nos combos
['anp'].forEach(() => {
  ok('combo CG EP≥50', TD(['embrapii', 'anp'], 1e6).ep_pct >= 0.50);
  ok('combo AA2 EP≥50', TD(['embrapii', 'anp'], 12e6).ep_pct >= 0.50);
});

// ── syncTierDistribution: troca ao cruzar categoria, preserva dentro da categoria ──
{
  const st = blankState(); st.meta.fomentos = ['embrapii']; st.meta.fomento = 'embrapii';
  st.config.ep_pct = 0.42; st.config.eb_pct = 0.33; st.config.sn_pct = 0.25;
  // primeira observação (CG): só marca, não altera (totalFin>0 exigido pelo guard)
  ok('sync 1ª obs não altera', E.FOMENTO.syncTierDistribution(st, { totalFin: 1, total: 1e6 }) === false && st.config.eb_pct === 0.33);
  // dentro de CG, edição preservada
  st.config.eb_pct = 0.30; st.config.ep_pct = 0.45;
  ok('sync dentro da categoria preserva', E.FOMENTO.syncTierDistribution(st, { totalFin: 1, total: 2e6 }) === false && st.config.eb_pct === 0.30);
  // cruza para AA1 → snap 50/25/25
  const r = E.FOMENTO.syncTierDistribution(st, { totalFin: 1, total: 7e6 });
  ok('sync cruza p/ AA1 ajusta', r && r.tier === 'aa1' && r2(st.config.eb_pct) === 0.25 && r2(st.config.ep_pct) === 0.50);
}

console.log(`test_engine_multifomento: OK (${n} asserções)`);
