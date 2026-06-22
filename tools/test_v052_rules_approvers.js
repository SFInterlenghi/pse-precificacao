'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadEngine, blankState, extractConst } = require('./engine.js');

const E = loadEngine();
const calcAndValidate = st => E.VAL.run(st, E.CALC.calcAll(st));
const has = (items, text) => items.some(x => String(x.msg || '').includes(text));
const embState = serv => {
  const st = blankState();
  st.meta.fomento = 'embrapii';
  st.meta.fomentos = ['embrapii'];
  st.config.suporte_pct = 0;
  st.ptec = [{ id:'p1', nome:'Pessoa', cargo:'pesquisador_qms_iv', horas:1000, meses:12, enc:true, economico:false, fonte_recurso:'ep' }];
  st.serv = serv;
  return st;
};

// O teto EMBRAPII considera todos os serviços, não apenas PD&I.
let st = embState([{ id:'s1', nome:'Ensaio', cat:'tec', valor:100000, economico:false, fonte_recurso:'ep' }]);
let result = calcAndValidate(st);
assert.ok(has(result.reds, 'excedem 30% do total consolidado'), 'serviço técnico deve entrar no teto geral de 30%');

// Origem obrigatória: PD&I em EB; demais serviços em EP.
st = embState([{ id:'s1', nome:'Desenvolvimento', cat:'pdi', valor:10000, economico:false, fonte_recurso:'ep' }]);
result = calcAndValidate(st);
assert.ok(has(result.reds, 'recursos EMBRAPII (EB)'), 'PD&I em EP deve ser recusado');
st.serv[0].fonte_recurso = 'eb';
result = calcAndValidate(st);
assert.ok(!has(result.reds, 'recursos EMBRAPII (EB)'), 'PD&I em EB deve ser aceito pela regra de origem');

st = embState([{ id:'s1', nome:'Ensaio', cat:'tec', valor:10000, economico:false, fonte_recurso:'eb' }]);
result = calcAndValidate(st);
assert.ok(has(result.reds, 'Empresa Parceira (EP)'), 'serviço não PD&I em EB deve ser recusado');

// No combo EMBRAPII + ANP, PD&I em EB segue a regra EMBRAPII sem bloqueio ANP genérico.
st = embState([{ id:'s1', nome:'Desenvolvimento', cat:'pdi', valor:10000, economico:false, fonte_recurso:'eb' }]);
st.meta.fomentos = ['embrapii', 'anp'];
result = calcAndValidate(st);
assert.ok(!has(result.reds, 'Agência proíbe expressamente'), 'combo EMBRAPII + ANP não deve bloquear PD&I alocado em EB');

// ANP puro mantém a proibição de terceirização de atividade central de PD&I.
st.meta.fomento = 'anp'; st.meta.fomentos = ['anp'];
result = calcAndValidate(st);
assert.ok(has(result.reds, 'Agência proíbe expressamente'), 'ANP puro deve bloquear serviço central de PD&I');

// Boa prática DAP: ausência e valor abaixo de R$ 15 mil geram avisos distintos.
E.context.APPROVERS.routingTeam = () => 'DAP';
st = blankState();
st.ptec = [{ id:'p1', nome:'Pessoa', cargo:'pesquisador_qms_iv', horas:100, meses:12, enc:true, economico:false }];
result = calcAndValidate(st);
assert.ok(has(result.yellows, 'inclua em Material de Consumo'), 'DAP sem rubrica deve gerar aviso');
st.cons = [{ id:'c1', nome:'Válvulas e conexões', valor:10000, quantidade:1, economico:false }];
result = calcAndValidate(st);
assert.ok(has(result.yellows, 'abaixo da referência'), 'DAP abaixo de R$ 15 mil deve gerar aviso');
st.cons[0].valor = 15000;
result = calcAndValidate(st);
assert.ok(!result.yellows.some(x => String(x.msg||'').startsWith('Boa prática DAP:')), 'DAP em R$ 15 mil deve atender a boa prática');

// Registro versionado: novos gestores e múltiplas equipes de aprovação do Leonardo.
const ctx = { DB:{ _data:{ users:{} } } };
vm.createContext(ctx);
vm.runInContext(`${extractConst(E.html,'DATA')}\n${extractConst(E.html,'APPROVERS')}\nthis.DATA=DATA;this.APPROVERS=APPROVERS;`, ctx);
const esp = ctx.APPROVERS.getManagersByTeam('ESP').map(x => x.email);
assert.deepEqual([...esp].sort(), ['jmgoncalves@firjan.com.br','lvteixeira@firjan.com.br','ysantiago@firjan.com.br'].sort());
assert.ok(!esp.includes('sferrari@firjan.com.br') && !esp.includes('acsdias@firjan.com.br'), 'gestores legacy não devem aparecer como aprovadores ESP');
assert.ok(ctx.APPROVERS.getManagersByTeam('DAP').some(x => x.email === 'lvteixeira@firjan.com.br'));
assert.ok(ctx.APPROVERS.getManagersByTeam('CIN').some(x => x.email === 'lvteixeira@firjan.com.br'));

const db = { users:{ 'ysantiago@firjan.com.br':{ nome:'York', papel_global:'pesquisador', ativo:true } } };
ctx.APPROVERS.ensureDbUsers(db);
assert.equal(db.users['ysantiago@firjan.com.br'].papel_global, 'gestor');
assert.equal(db.users['jmgoncalves@firjan.com.br'].papel_global, 'gestor');

// ANEEL: categorias explícitas e lembrete de viagem sempre amarelo, inclusive no início vazio.
E.context.APPROVERS.routingTeam = () => '';
st = blankState(); st.meta.fomento='aneel'; st.meta.fomentos=['aneel'];
result = calcAndValidate(st);
assert.ok(has(result.yellows, 'taxa de publicação de artigos científicos'));
assert.ok(has(result.yellows, 'taxa de inscrição em congresso'));
assert.ok(has(result.yellows, 'viagem associada'));
st.ptec=[{ id:'p1', cargo:'pesquisador_qms_iv', horas:100, meses:12, enc:true, economico:false }];
st.serv=[
  {id:'a1',nome:'Publicação',cat:'publicacao',valor:1,economico:false},
  {id:'c1',nome:'Inscrição',cat:'congresso',valor:1,economico:false}
];
result = calcAndValidate(st);
assert.ok(!has(result.yellows, 'preveja valor para taxa de publicação'));
assert.ok(!has(result.yellows, 'preveja valor para taxa de inscrição'));
assert.ok(has(result.yellows, 'viagem associada'), 'lembrete de viagem ANEEL deve permanecer não bloqueante');

console.log('v052 regras/aprovadores: OK');
