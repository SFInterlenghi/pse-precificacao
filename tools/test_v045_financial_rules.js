const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(repoRoot, 'app', 'ISIB&F_precificação_de_projetos_v045.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractObjectDeclaration(source, name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} não encontrado no HTML`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 2);
    }
  }
  throw new Error(`Declaração ${name} incompleta`);
}

const context = {
  console,
  setTimeout,
  clearTimeout,
  fmt_r: value => `R$ ${Number(value || 0).toFixed(2)}`,
  STATE: {
    meta: {
      tipo_proposta: 'mae',
      macroentregas: [
        { id: 'm1', nome: 'Macro 1', duracao_meses: 3 },
        { id: 'm2', nome: 'Macro 2', duracao_meses: 3 }
      ]
    },
    config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 }
  },
  CALC: {
    hhTotal: () => 100,
    pessoalCusto: item => 100 * Number(item.horas || 0),
    viagemTotal: item => Number(item.valor || 0),
    softCusto: item => Number(item.valor || (Number(item.custo_hora || 0) * Number(item.horas_uso || 0))),
    equipCusto: item => Number(item.valor || (Number(item.custo_hora || 0) * Number(item.horas_uso || 0)))
  },
  MACRO: {
    normalizeList: list => Array.isArray(list) ? list : [],
    validSelectedIds(item, meta, multiple) {
      const valid = new Set((meta.macroentregas || []).map(macro => macro.id));
      const selected = multiple
        ? (Array.isArray(item.macro_ids) ? item.macro_ids : [item.macro_id])
        : [item.macro_id || (Array.isArray(item.macro_ids) ? item.macro_ids[0] : '')];
      return selected.filter(id => valid.has(id));
    },
    itemValue(key, item, state) {
      if (key === 'ptec' || key === 'padm') return context.CALC.pessoalCusto(item, key, state);
      if (key === 'soft') return context.CALC.softCusto(item);
      if (key === 'equip') return context.CALC.equipCusto(item);
      return Number(item.valor || 0);
    }
  }
};

vm.createContext(context);
vm.runInContext(`
${extractObjectDeclaration(html, 'FUNDING_POLICY')}
${extractObjectDeclaration(html, 'FUNDING')}
this.FUNDING_POLICY = FUNDING_POLICY;
this.FUNDING = FUNDING;
`, context);

const { FUNDING_POLICY, FUNDING } = context;

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} deveria ser aproximadamente ${expected}`);
}

function blankState() {
  return { ptec: [], padm: [], viagens: [], soft: [], equip: [], cons: [], serv: [], matp: [] };
}

function totalForMacro(records, macroId) {
  return FUNDING._entriesForBucket(records, macroId).reduce((sum, entry) => sum + FUNDING._entryValue(entry), 0);
}

function actualForMacro(records, macroId) {
  return FUNDING._entriesForBucket(records, macroId).reduce((out, entry) => {
    const source = FUNDING.sourceOf(entry.item, entry.key === 'matp' ? 'ep' : null);
    out[source] += FUNDING._entryValue(entry);
    return out;
  }, { ep: 0, eb: 0, sn: 0, unclassified: 0 });
}

function runPolicyTests() {
  const target = FUNDING_POLICY.targets(100000, context.STATE.config);
  assert.deepEqual(JSON.parse(JSON.stringify(target)), { ep: 42000, eb: 33000, sn: 25000 });

  const acceptable = FUNDING_POLICY.assess(
    { ep: 44000, eb: 31000, sn: 25000, unclassified: 0 },
    target,
    100000,
    'Teste'
  );
  assert.equal(acceptable.reds.length, 0);
  assert.ok(acceptable.yellows.length >= 1);

  const overCap = FUNDING_POLICY.assess(
    { ep: 40000, eb: 35000, sn: 25000, unclassified: 0 },
    target,
    100000,
    'Teste'
  );
  assert.ok(overCap.reds.some(message => message.includes('EMBRAPII')));

  const excessiveEp = FUNDING_POLICY.assess(
    { ep: 50000, eb: 25000, sn: 25000, unclassified: 0 },
    target,
    100000,
    'Teste'
  );
  assert.ok(excessiveEp.reds.some(message => message.includes('7,0 p.p.')));
}

function runMacroOptimizerTests() {
  const stateA = blankState();
  stateA.ptec.push({ id: 'p1', cargo: 'pesquisador', horas: 100, macro_ids: ['m1'], fonte_recurso: 'ep', economico: false });
  stateA.cons.push({ id: 'c1', nome: 'Reagente A', quantidade: 101, valor_unitario: 10, valor: 1010, macro_id: 'm1', fonte_recurso: 'ep', economico: false });
  stateA.matp.push({ id: 'mp1', nome: 'Equipamento permanente', valor: 500, macro_id: 'm1', fonte_recurso: 'ep', economico: false });
  stateA.serv.push({ id: 's1', nome: 'Consultoria', cat: 'consultoria', valor: 700, macro_id: 'm1', fonte_recurso: 'ep', economico: false });

  const stateB = blankState();
  stateB.ptec.push({ id: 'p2', cargo: 'pesquisador', horas: 53, macro_ids: ['m2'], fonte_recurso: 'ep', economico: false });
  stateB.cons.push({ id: 'c2', nome: 'Reagente B', quantidade: 41, valor_unitario: 17, valor: 697, macro_id: 'm2', fonte_recurso: 'ep', economico: false });
  stateB.serv.push({ id: 's2', nome: 'Ensaio PD&I', cat: 'pdi', valor: 333.33, macro_id: 'm2', fonte_recurso: 'ep', economico: false });

  const records = [
    { proposalId: 'MAE', st: stateA },
    { proposalId: 'SUB', st: stateB }
  ];

  const beforeM1 = totalForMacro(records, 'm1');
  const beforeM2 = totalForMacro(records, 'm2');
  const resultM1 = FUNDING._optimizeBucket(records, 'm1', FUNDING_POLICY.targets(beforeM1, context.STATE.config), 0);
  const resultM2 = FUNDING._optimizeBucket(records, 'm2', FUNDING_POLICY.targets(beforeM2, context.STATE.config), resultM1.serial);
  assert.ok(resultM2.serial >= resultM1.serial);

  approx(totalForMacro(records, 'm1'), beforeM1);
  approx(totalForMacro(records, 'm2'), beforeM2);

  for (const macroId of ['m1', 'm2']) {
    const total = totalForMacro(records, macroId);
    const target = FUNDING_POLICY.targets(total, context.STATE.config);
    const actual = actualForMacro(records, macroId);
    assert.ok(actual.eb <= target.eb + 0.02, `${macroId}: EMBRAPII ultrapassou o teto`);
    assert.ok(actual.sn <= target.sn + 0.02, `${macroId}: SENAI ultrapassou o teto`);
    approx(actual.ep + actual.eb + actual.sn, total);
    assert.ok(FUNDING_POLICY.assess(actual, target, total, macroId).reds.length === 0);
  }

  records.forEach(record => {
    record.st.ptec.forEach(item => assert.ok(Number.isInteger(Number(item.horas)), 'Horas de pessoal devem permanecer inteiras'));
    record.st.cons.forEach(item => assert.ok(Number.isInteger(Number(item.quantidade)), 'Quantidade de consumo deve permanecer inteira'));
  });
  assert.equal(stateA.matp[0].fonte_recurso, 'ep');
  assert.equal(stateA.serv[0].fonte_recurso, 'ep', 'Consultoria não deve ser dividida nesta versão');
}

function runExportStructureChecks() {
  assert.match(html, /12_Macro_Rubrica_Fontes/);
  assert.match(html, /fundingSource/);
  assert.match(html, /rubricSources/);
}

runPolicyTests();
runMacroOptimizerTests();
runExportStructureChecks();
console.log('OK: regras de contribuição, otimização por macro, inteiros e exportação v045.');
