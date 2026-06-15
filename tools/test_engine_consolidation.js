'use strict';
// Cobre M1: consolidação mãe + subpropostas (VAL.projectScope) — soma mãe + filhas SEM dupla
// contagem, e a validação roda no escopo consolidado.
const assert = require('node:assert/strict');
const { loadEngine, blankState } = require('./engine.js');

const r2 = v => Math.round((+v || 0) * 100) / 100;
const HH = 112.70; // pesquisador_qms_iv
const ptec = (id, h) => ([{ id, cargo: 'pesquisador_qms_iv', horas: h, meses: 18, enc: true, economico: false }]);

// Estados: mãe (100h próprias) + 2 filhas (200h, 300h).
const mae = blankState({ meta: { fomentos: ['embrapii'], fomento: 'embrapii', tipo_proposta: 'mae' },
  proposal: { id: 'MAE', tipo_proposta: 'mae' }, ptec: ptec('m', 100) });
const f1 = blankState({ meta: { fomentos: ['embrapii'], fomento: 'embrapii', tipo_proposta: 'equipe', id_mae: 'MAE' }, ptec: ptec('f1', 200) });
const f2 = blankState({ meta: { fomentos: ['embrapii'], fomento: 'embrapii', tipo_proposta: 'equipe', id_mae: 'MAE' }, ptec: ptec('f2', 300) });

const E = loadEngine({ equipesByMae: { MAE: [{ id: 'E1', state: f1 }, { id: 'E2', state: f2 }] } });
// projectScope localiza a mãe pela referência de estado em DB._data.proposals.
E.context.DB._data.proposals = { MAE: { id: 'MAE', tipo_proposta: 'mae', state: mae } };

let n = 0; const ok = (l, c) => { n++; assert.ok(c, 'FALHOU: ' + l); };

const maeCalc = E.CALC.calcAll(mae);
ok('mãe sozinha = só itens próprios', r2(maeCalc.dirFin) === r2(HH * 100));

const scope = E.VAL.projectScope(mae, maeCalc);
// Consolidado = mãe (100) + filhas (200+300) = 600h
ok('projectScope soma mãe + filhas', r2(scope.dirFin) === r2(HH * 600));
ok('projectScope > mãe sozinha (consolidou)', scope.dirFin > maeCalc.dirFin);
// Indiretos EMBRAPII sobre o consolidado (suporte 15%)
ok('indiretos sobre o consolidado', r2(scope.indsFin) === r2(HH * 600 * 0.15));
ok('totalFin consolidado coerente', r2(scope.totalFin) === r2(HH * 600 * 1.15));

// VAL.run na mãe roda no escopo consolidado sem quebrar.
const res = E.VAL.run(mae, maeCalc);
ok('VAL.run da mãe executa', Array.isArray(res.reds) && Array.isArray(res.yellows));

// Sem dupla contagem: rodar projectScope 2x dá o mesmo valor (idempotente, não acumula).
const scope2 = E.VAL.projectScope(mae, E.CALC.calcAll(mae));
ok('projectScope idempotente', r2(scope2.dirFin) === r2(scope.dirFin));

console.log(`test_engine_consolidation: OK (${n} asserções)`);
