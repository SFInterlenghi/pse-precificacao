# Implementation Log - V046 Refinamento dos Otimizadores

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `archive/outdated/versions/v045/ISIB&F_precificação_de_projetos_v045.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v046.html`
- `main` não foi alterada.

## Implementações

- Software e uso de equipamentos podem ser associados a uma ou mais macroentregas, como pessoal.
- O valor de software/equipamento com múltiplas macros é distribuído linearmente pela duração das macros selecionadas.
- Durante a otimização, registros multi-macro são separados por macro preservando custo/hora, horas totais e valor total.
- Depois de uma otimização aceita, itens de todas as rubricas são reordenados pela sequência das macroentregas.
- Quando a Empresa Parceira fica mais de 5% acima do seu valor-meta em qualquer macro, a ferramenta oferece:
  - manter a solução encontrada; ou
  - reverter integralmente e fazer a distribuição manual.
- A reversão restaura itens, origens, divisão, estado-base e histórico anterior ao otimizador.
- Corrigida dupla consolidação nos estados de disponibilidade:
  - `Otimizar HH Técnico`;
  - `Otimizar origem financeira`.
- Custos financeiros ainda sem origem EP/EB mantêm o otimizador de fontes disponível na proposta mãe.
- Landing page, HTML e exportação atualizados para v046.

## Regras preservadas

- Consultoria continua fora da divisão automática.
- Somente serviços classificados como PD&I podem ser divididos.
- Material permanente e indiretos permanecem em EP.
- Horas de pessoal e quantidades de consumo permanecem inteiras.
- EMBRAPII e SENAI não ultrapassam seus tetos.
- Nenhuma fórmula de `CALC` foi alterada.

## Testes

- `tools/test_v046_financial_rules.js` cobre:
  - metas e tetos de contribuição;
  - tolerância e validações;
  - duas macroentregas independentes;
  - software econômico em múltiplas macros;
  - preservação de totais;
  - inteiros de pessoal e consumo;
  - consultoria/material permanente preservados em EP;
  - ordenação por macro;
  - detecção de EP mais de 5% acima do valor-meta;
  - disponibilidade do otimizador com custos sem origem;
  - estrutura de exportação por macro/rubrica/fonte.
- Sintaxe e namespaces principais validados.
- V046 aberta por HTTP local sem erros no console.
- Nenhum JSON/DB foi modificado.

## Limitações

- O cenário real DAP + ESP do print deve ser repetido manualmente com o DB do usuário para validar os dois botões na proposta mãe.
- A visualização consolidada da mãe continua agrupando subpropostas por equipe; dentro de cada estado editável, os itens são ordenados por macro.

