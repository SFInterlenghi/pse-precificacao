'use strict';
// Fixtures SINTÉTICOS (sem dados de cliente) para os golden tests do motor.
// Cobrem um cenário representativo por fomento + um caso EMBRAPII com macros/econômico.
const { blankState } = require('./engine.js');

function withFomento(fomentos, over = {}) {
  const st = blankState();
  st.meta.fomentos = fomentos.slice();
  st.meta.fomento = fomentos[0];
  Object.assign(st.meta, over.meta || {});
  if (over.config) Object.assign(st.config, over.config);
  ['ptec', 'padm', 'viagens', 'soft', 'equip', 'cons', 'serv', 'matp'].forEach(k => { if (over[k]) st[k] = over[k]; });
  return st;
}

// Pessoas/itens determinísticos reaproveitados.
const pessoas = () => ([
  { id: 'p1', nome: 'P1', cargo: 'pesquisador_qms_iv', horas: 1200, meses: 18, enc: true, economico: false },
  { id: 'p2', nome: 'P2', cargo: 'pesquisador_qms_ii', horas: 800, meses: 18, enc: true, economico: false }
]);
const adm = () => ([{ id: 'a1', nome: 'A1', cargo: 'gerente', horas: 100, meses: 18, enc: true, economico: false }]);
const software = (eco = false) => ([{ id: 's1', nome: 'Aspen HYSYS', val_ano: 45000, meses: 18, economico: eco }]);
const consumo = () => ([{ id: 'c1', nome: 'Reagentes', valor: 28000, economico: false }]);
const servico = () => ([{ id: 'sv1', nome: 'Ensaio', tipo: 'pj', cat: 'tec', valor: 32000, economico: false }]);
const viagem = () => ([{ id: 'v1', destino: 'SP', tipo: 'nacional', n_pessoas: 2, valor_passagem: 1800,
  tem_diaria: true, diaria_valor: 500, diaria_dias: 3, diaria_pessoas: 2, economico: false }]);

function fixtures() {
  return {
    sem: withFomento(['sem'], { ptec: pessoas(), cons: consumo(), serv: servico() }),
    embrapii: withFomento(['embrapii'], { ptec: pessoas(), padm: adm(), soft: software(true), cons: consumo(), serv: servico(), viagens: viagem() }),
    anp: withFomento(['anp'], { meta: { tipo_proj: 'pdi' }, ptec: pessoas(), cons: consumo(), serv: servico(), viagens: viagem() }),
    anp_infra: withFomento(['anp'], { meta: { tipo_proj: 'infra' }, ptec: pessoas(), matp: [{ id: 'm1', nome: 'Equip', valor: 200000, economico: false }] }),
    petrobras: withFomento(['petrobras'], { ptec: pessoas(), cons: consumo(), serv: servico() }),
    aneel: withFomento(['aneel'], { ptec: pessoas(), cons: consumo() }),
    embrapii_macro_eco: (() => {
      const st = withFomento(['embrapii'], {
        meta: { precificacao_modo: 'macroentregas', tipo_proposta: 'direta',
          macroentregas: [{ id: 'm1', nome: 'M1', duracao_meses: 9, mes_inicio: 1 }, { id: 'm2', nome: 'M2', duracao_meses: 9, mes_inicio: 10 }] },
        ptec: [
          { id: 'p1', cargo: 'pesquisador_qms_iv', horas: 1200, meses: 18, enc: true, economico: false, macro_ids: ['m1'] },
          { id: 'p2', cargo: 'pesquisador_qms_ii', horas: 800, meses: 18, enc: true, economico: true, macro_ids: ['m2'] }
        ],
        soft: [{ id: 's1', nome: 'Aspen', val_ano: 45000, meses: 18, economico: true, macro_ids: ['m1', 'm2'] }]
      });
      return st;
    })()
  };
}

module.exports = { fixtures };
