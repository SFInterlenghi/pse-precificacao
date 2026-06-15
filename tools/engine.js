'use strict';
// ============================================================================
// Harness de teste do MOTOR REAL (Fase A da auditoria pré-lançamento).
// Extrai os objetos reais do app (DATA, FOMENTO, FUNDING_POLICY, FUNDING,
// MACRO, CALC, VAL, BEST_PRACTICES) e os executa num sandbox `vm`, mockando
// apenas o que é externo ao motor (DOM, persistência, UI, autenticação).
// Assim os testes exercem as fórmulas/regras DE VERDADE — não mais mocks de CALC.
// ============================================================================
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');

function latestAppFile() {
  const dir = path.join(repoRoot, 'app');
  const files = fs.readdirSync(dir).filter(f => /^ISIB&F_precifica..o_de_projetos_v\d+\.html$/.test(f));
  if (!files.length) throw new Error('Nenhum HTML de app encontrado em app/');
  files.sort((a, b) => {
    const na = +(a.match(/_v(\d+)\.html$/)[1]);
    const nb = +(b.match(/_v(\d+)\.html$/)[1]);
    return na - nb;
  });
  return path.join(dir, files[files.length - 1]);
}

// Extrai um bloco `const NAME = {...}` (aceita com ou sem espaços ao redor do '=').
function extractConst(source, name) {
  let start = source.indexOf(`const ${name} =`);
  if (start === -1) start = source.indexOf(`const ${name}=`);
  if (start === -1) throw new Error(`Declaração const ${name} não encontrada`);
  const braceStart = source.indexOf('{', start);
  let depth = 0, quote = '', escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') { depth -= 1; if (depth === 0) return source.slice(start, i + 1); }
  }
  throw new Error(`Declaração const ${name} incompleta`);
}

function blankState(over = {}) {
  return {
    meta: { titulo: 'T', empresa: 'E', fomento: 'sem', fomentos: ['sem'], duracao: 18,
      tipo_proj: 'pdi', tipo_proposta: 'direta', equipe: null, id_mae: null,
      precificacao_modo: 'tradicional', macroentregas: [] },
    config: { suporte_pct: 0.15, doa_pct: 0.05, ci_pct: 0.15, doa_aneel_pct: 0.05, ci_aneel_pct: 0.05,
      sem_ind_pct: 0.30, ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25, hh_legacy_ptec: false, hh_legacy_padm: false },
    ptec: [], padm: [], viagens: [], soft: [], equip: [], cons: [], serv: [], matp: [],
    proposal: { id: 'TEST', tipo_proposta: 'direta' },
    ...over
  };
}

function loadEngine(opts = {}) {
  const htmlPath = opts.htmlPath || latestAppFile();
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Mocks do que é externo ao motor.
  const equipesByMae = opts.equipesByMae || {}; // { maeId: [{id, state, ...}] }
  const context = {
    console,
    setTimeout, clearTimeout,
    // sentinela: distinto de qualquer estado de teste (faz `st===STATE` ser falso)
    STATE: { meta: {}, config: {}, proposal: {} },
    fmt_r: v => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    fmt_pct: v => ((v || 0) * 100).toFixed(1) + '%',
    esc: s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    fteClass: () => '',
    toast: () => {},
    DB: { _data: { proposals: {} }, now: () => '2026-06-15T00:00:00Z',
      maybeAutoRevisionSnapshot() {}, _stateBaseFromState: () => ({}) },
    TEAM: {
      getEquipes: id => equipesByMae[id] || [],
      getMae: () => null,
      calcConsolidado: () => ({ totalFin: 0, totalEco: 0, total: 0, calc: {} })
    },
    AUTH: { currentUser: () => ({ email: 'test@firjan.com.br' }) },
    AUDIT: { log() {}, logChange() {} },
    UI: { renderAll() {}, afterChange() {} },
    CONFIRM: { open: async () => true },
    APPROVERS: { validateApproverForProposal: () => ({ reds: [], yellows: [] }), routingTeam: () => '' },
    document: { getElementById: () => null, querySelectorAll: () => [], createElement: () => ({ style: {} }) },
    window: {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }
  };

  vm.createContext(context);
  const names = ['DATA', 'FOMENTO', 'FUNDING_POLICY', 'FUNDING', 'MACRO', 'CALC', 'VAL', 'BEST_PRACTICES'];
  const blocks = names.map(n => extractConst(html, n)).join('\n');
  const assigns = names.map(n => `this.${n}=${n};`).join('');
  vm.runInContext(blocks + '\n' + assigns, context);

  return { context, htmlPath, html, blankState, ...Object.fromEntries(names.map(n => [n, context[n]])) };
}

module.exports = { loadEngine, blankState, extractConst, latestAppFile };
