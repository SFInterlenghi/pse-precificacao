const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(repoRoot, 'app', 'ISIB&F_precificação_de_projetos_v049.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractObjectDeclaration(source, name) {
  const marker = `const ${name}=`;
  let start = source.indexOf(marker);
  if (start === -1) start = source.indexOf(`const ${name} =`);
  assert.notEqual(start, -1, `${name} não encontrado`);
  const braceStart = source.indexOf('{', start);
  let depth = 0, quote = '', escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') { depth -= 1; if (depth === 0) return source.slice(start, i + 2); }
  }
  throw new Error(`Declaração ${name} incompleta`);
}

// ── 1) VAL._addEconomicContrapartida: adiciona HH econômico (SENAI) sem tocar no financeiro ──
const STATE = {
  meta: { tipo_proposta: 'direta', fomentos: ['embrapii'], duracao: 18 },
  config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25, suporte_pct: 0 },
  ptec: [],
  _seq: 0,
  uid() { this._seq += 1; return `uid_${this._seq}`; }
};

const context = {
  console,
  fmt_r: v => `R$ ${Number(v || 0).toFixed(2)}`,
  fmt_pct: v => `${(Number(v || 0) * 100).toFixed(1)}%`,
  STATE,
  DATA: { MAX_H_MES: 176 },
  AUDIT: { log() {} },
  FOMENTO: { has: () => true, embrapiiTier: () => ({ label: 'CG' }), syncMeta() {} },
  MACRO: { isEnabled: () => false, normalizeList: l => Array.isArray(l) ? l : [] },
  TEAM: { getEquipes: () => [] },
  DB: { _data: { proposals: {} } },
  CALC: {
    calcAll: () => ({ totalFin: 900, totalEco: 0, dirFin: 900, dirEco: 0, config: STATE.config }),
    roles: () => [{ id: 'r1', sal: 1000, label: 'Pesquisador' }, { id: 'b1', sal: 800, label: 'Bolsista' }],
    hhTotal: () => 10
  }
};

vm.createContext(context);
vm.runInContext(`
${extractObjectDeclaration(html, 'VAL')}
this.VAL = VAL;
`, context);
const { VAL } = context;

// déficit = totalFin/3 - totalEco = 900/3 - 0 = 300 ; hhTotal=10 → 30h ; 1 pessoa CLT (ignora bolsista b1)
{
  STATE.ptec = [];
  const res = VAL._addEconomicContrapartida();
  assert.equal(res.added, 1, 'deve adicionar 1 pessoa');
  assert.equal(res.hours, 30, 'deve precisar de 30h econômicas');
  assert.equal(STATE.ptec.length, 1);
  const p = STATE.ptec[0];
  assert.equal(p.economico, true, 'HH adicionado é econômico (SENAI)');
  assert.equal(p.fonte_recurso, 'sn');
  assert.equal(p.cargo, 'r1', 'usa cargo CLT (não bolsista)');
  assert.equal(p.horas, 30);
}

// sem déficit (econômico já no alvo) → não adiciona nada
{
  STATE.ptec = [];
  context.CALC.calcAll = () => ({ totalFin: 900, totalEco: 300, dirFin: 900, dirEco: 300, config: STATE.config });
  const res = VAL._addEconomicContrapartida();
  assert.equal(res.added, 0, 'sem déficit não adiciona HH');
  assert.equal(STATE.ptec.length, 0);
}

// ── 2) Verificações estruturais do fluxo unificado optimizeAll ──────────────────
const optAll = html.slice(html.indexOf('async optimizeAll(){'), html.indexOf('sidebar(calc){'));
assert.match(optAll, /VAL\._addEconomicContrapartida\(\)/, 'optimizeAll deve completar a contrapartida econômica');
assert.match(optAll, /this\._defragment\(records\)/, 'optimizeAll deve desfragmentar (idempotência)');
assert.match(optAll, /this\._optimizeBucket\(/, 'optimizeAll deve distribuir o financeiro entre EP/EB');
assert.match(optAll, /beforeFin[\s\S]*?afterFin[\s\S]*?alteraria o valor financeiro das rubricas/, 'guard de conservação do dirFin (financeiro) presente');
assert.match(optAll, /_assessResult\(records\)/, 'avalia viabilidade e oferece reversão');
assert.doesNotMatch(optAll, /ecoChanged/, 'optimizeAll NÃO deve travar por mudança do econômico (adicionar é permitido)');

// O HH adicionado é econômico e a etapa econômica vem antes da distribuição financeira
const econPos = optAll.indexOf('_addEconomicContrapartida');
const distPos = optAll.indexOf('_optimizeBucket');
assert.ok(econPos !== -1 && distPos !== -1 && econPos < distPos, 'contrapartida econômica é calculada antes da distribuição financeira');

// ── 3) Botão único na sidebar chama FUNDING.optimizeAll() (substitui os dois antigos) ──
const sidebarFn = html.slice(html.indexOf('function renderFundingAdjustments('), html.indexOf('function renderResume('));
assert.match(sidebarFn, /onclick="FUNDING\.optimizeAll\(\)"/, 'sidebar usa o botão unificado optimizeAll');
assert.doesNotMatch(sidebarFn, /onclick="VAL\.optimizeEco\(\)"/, 'botão antigo de HH econômico removido da sidebar');
assert.doesNotMatch(sidebarFn, /onclick="FUNDING\.optimizeFinancialOrigins\(\)"/, 'botão antigo de origem financeira removido da sidebar');

// ── 4) _addEconomicContrapartida adiciona com economico:true (preserva financeiro por construção) ──
const ecoSrc = html.slice(html.indexOf('_addEconomicContrapartida(){'), html.indexOf('_addEconomicContrapartida(){') + 2400);
assert.match(ecoSrc, /economico:\s*true/, 'HH adicionado marcado como econômico');
assert.match(ecoSrc, /fonte_recurso:\s*'sn'/, "HH adicionado em fonte 'sn'");

console.log('test_v049_unified_optimizer: OK');
