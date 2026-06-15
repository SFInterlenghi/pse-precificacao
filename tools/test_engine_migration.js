'use strict';
// Testa a MIGRAÇÃO real (DB.migrateFomentoRules) de propostas antigas para estado válido (v051):
// ANP+Petrobras → ANP; >2 fomentos → 2; EMBRAPII+regulado com EP<50% → 50/33/17.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadEngine } = require('./engine.js');

const E = loadEngine();

// Extrai o corpo de um método `name(args){...}` por balanceamento de chaves.
function extractMethod(src, name) {
  // Pega a DEFINIÇÃO do método (não a chamada `this.name(...)`): name não precedido por '.'/letra.
  const re = new RegExp(`(?<![.\\w])${name}\\s*\\([^)]*\\)\\s*\\{`);
  const m = re.exec(src);
  assert.ok(m, `${name} (definição) não encontrado`);
  const start = m.index;
  const braceStart = start + m[0].length - 1; // posição do '{' que inicia o corpo
  let depth = 0, q = '', esc = false;
  for (let i = braceStart; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === q) q = ''; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error('incompleto');
}

const mig = extractMethod(E.html, 'migrateFomentoRules');
const logm = extractMethod(E.html, '_logMigration');
vm.runInContext(`this.__DB = { now:()=>'2026-06-15', ${mig}, ${logm} };`, E.context);
const DB = E.context.__DB;

let n = 0; const ok = (l, c) => { n++; assert.ok(c, 'FALHOU: ' + l); };

// ANP + Petrobras → mantém só ANP
{
  const rec = { state: { meta: { fomentos: ['anp', 'petrobras'] }, config: { ep_pct: 0.5, eb_pct: 0.3, sn_pct: 0.2 } } };
  const c = DB.migrateFomentoRules(rec);
  ok('anp+petrobras migrado', c >= 1 && JSON.stringify(rec.state.meta.fomentos) === JSON.stringify(['anp']));
  ok('migração registrada no histórico', (rec.historico || []).some(h => h.acao === 'migracao_fomento_v051'));
}
// >2 fomentos → 2
{
  const rec = { state: { meta: { fomentos: ['embrapii', 'anp', 'aneel'] }, config: { ep_pct: 0.5, eb_pct: 0.33, sn_pct: 0.17 } } };
  DB.migrateFomentoRules(rec);
  ok('>2 fomentos cortado para 2', E.FOMENTO.getSelected(rec.state.meta).length === 2);
}
// EMBRAPII + regulado com EP<50% → força 50/33/17
{
  const rec = { state: { meta: { fomentos: ['embrapii', 'anp'] }, config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 } } };
  DB.migrateFomentoRules(rec);
  ok('EP forçado para 50%', rec.state.config.ep_pct === 0.50 && rec.state.config.eb_pct === 0.33 && rec.state.config.sn_pct === 0.17);
}
// EMBRAPII + regulado já com EP≥50% → não mexe
{
  const rec = { state: { meta: { fomentos: ['embrapii', 'aneel'] }, config: { ep_pct: 0.55, eb_pct: 0.30, sn_pct: 0.15 } } };
  const c = DB.migrateFomentoRules(rec);
  ok('EP≥50% preservado (sem mudança)', c === 0 && rec.state.config.ep_pct === 0.55);
}
// Proposta single-fomento (ANP) válida → nenhuma mudança
{
  const rec = { state: { meta: { fomentos: ['anp'] }, config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 } } };
  ok('single-fomento ANP intacto', DB.migrateFomentoRules(rec) === 0);
}
// EMBRAPII legado Alta Alavancagem 1 (≥R$5M) com EB acima do teto → alinhado a 50/25/25
{
  const st = { meta: { fomentos: ['embrapii'], tipo_proposta: 'direta', tipo_proj: 'pdi', duracao: 18, macroentregas: [] },
    config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25, suporte_pct: 0.15 },
    ptec: [{ id: 'p', cargo: 'pesquisador_qms_iv', horas: 30000, meses: 18, enc: true, economico: false }],
    padm: [], viagens: [], soft: [], equip: [], cons: [], serv: [], matp: [] };
  const rec = { state: st };
  const changes = DB.migrateFomentoRules(rec);
  ok('AA1 legado ajustado (EB≤25%)', changes >= 1 && st.config.eb_pct === 0.25 && st.config.ep_pct === 0.50 && st.config.sn_pct === 0.25);
  ok('marcador de tier gravado', st.meta._embrapii_tier === 'aa1');
}

console.log(`test_engine_migration: OK (${n} asserções)`);
