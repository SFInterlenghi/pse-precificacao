'use strict';
// Golden / characterization test do motor de cálculo (CALC.calcAll).
// Congela os números do comportamento ATUAL (single-fomento + macro/eco) para que
// qualquer drift silencioso futuro quebre o teste. Atualização deliberada:
//   UPDATE_SNAPSHOTS=1 node tools/test_engine_calc_golden.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine } = require('./engine.js');
const { fixtures } = require('./fixtures.js');

const SNAP = path.join(__dirname, '__snapshots__', 'calc_golden.json');
const r2 = v => Math.round((+v || 0) * 100) / 100;

const E = loadEngine();
const fx = fixtures();

function snapshotOf(calc) {
  return {
    dirFin: r2(calc.dirFin), dirEco: r2(calc.dirEco),
    indsFin: r2(calc.indsFin), totalFin: r2(calc.totalFin),
    totalEco: r2(calc.totalEco), total: r2(calc.total),
    inds: (calc.inds || []).map(i => ({ id: i.id, pct: r2(i.pct), val: r2(i.val) }))
  };
}

const actual = {};
for (const [name, st] of Object.entries(fx)) {
  actual[name] = snapshotOf(E.CALC.calcAll(st));
}

const update = process.env.UPDATE_SNAPSHOTS === '1';
if (update || !fs.existsSync(SNAP)) {
  fs.mkdirSync(path.dirname(SNAP), { recursive: true });
  fs.writeFileSync(SNAP, JSON.stringify(actual, null, 2) + '\n');
  console.log(`test_engine_calc_golden: snapshot ${update ? 'ATUALIZADO' : 'CRIADO'} (${Object.keys(actual).length} casos)`);
  process.exit(0);
}

const expected = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
let diffs = 0;
for (const name of Object.keys(actual)) {
  // Comparação canônica por string (a ordem das chaves em snapshotOf é fixa).
  if (JSON.stringify(actual[name]) !== JSON.stringify(expected[name])) {
    diffs++;
    console.error(`\n✗ DRIFT em "${name}":`);
    console.error('  esperado:', JSON.stringify(expected[name]));
    console.error('  atual   :', JSON.stringify(actual[name]));
  }
}
for (const name of Object.keys(expected)) {
  if (!(name in actual)) { diffs++; console.error(`✗ caso ausente: ${name}`); }
}
if (diffs) {
  console.error(`\ntest_engine_calc_golden: ${diffs} divergência(s). Se foi intencional, rode UPDATE_SNAPSHOTS=1.`);
  process.exit(1);
}
console.log(`test_engine_calc_golden: OK (${Object.keys(actual).length} casos conferidos)`);
