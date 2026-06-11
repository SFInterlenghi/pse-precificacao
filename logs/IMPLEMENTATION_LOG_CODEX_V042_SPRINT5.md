# Implementation Log - V042 Sprint 5

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v041.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v042.html`
- V041 arquivada em `archive/outdated/versions/v041/`

## Implementado

- Macroentregas integradas ao XLSX:
  - IDs e nomes das macros nas rubricas, pessoas e dados brutos;
  - modo de precificação e quantidade de macros na capa;
  - cronograma executivo no dashboard;
  - dados de macro em `09_Dados_Graficos`;
  - nova aba `11_Cronograma_Macros` com período, desembolso, totais, meta/atual EP-EB-SN, diferenças e composição por rubrica/equipe.
- Exportação mantém validações críticas por macro e continua bloqueando XLSX quando há erro vermelho.
- Histórico e Track Changes exibem nomes legíveis para `macro_id` e `macro_ids`.
- Normalização compatível no carregamento e na mesclagem:
  - pessoas usam `macro_ids`;
  - demais rubricas usam `macro_id`;
  - `state` e `state_base` são normalizados juntos;
  - propostas tradicionais sem campos de macro permanecem inalteradas;
  - propostas macro recebem `macro_schema_version: 1`.
- Registro de histórico `macro_schema_normalized` é criado uma única vez quando uma proposta macro antiga precisa ser normalizada.
- Metadados visuais e nome do XLSX atualizados para v042.

## Lógica tocada

- Sim, somente normalização/auditoria da camada `MACRO` e extração/escrita do XLSX.
- `CALC`, fórmulas financeiras, status, workflow, revisão e regras de fomento não foram alterados.
- Exportar não altera valores, revisão, status, dirty state ou auditoria da proposta.
- Nenhum JSON/DB foi modificado.

## Verificações

- Dois blocos JavaScript compilados sem erro.
- Página abriu no Chrome com título v042 e sem erro de console.
- Um único `#workspace`, uma única sidebar e nenhum ID duplicado.
- Teste isolado:
  - proposta tradicional permaneceu sem qualquer mutação;
  - proposta macro e `state_base` foram normalizadas de modo coerente;
  - pessoa em duas macros foi rateada pela duração;
  - soma do cronograma permaneceu igual ao total de origem.
- XLSX contém as 12 abas esperadas, incluindo `11_Cronograma_Macros`.
- Não restaram marcadores v041 no arquivo ativo.

## Limitações conhecidas

- O XLSX usa visualizações baseadas em células; não há gráficos nativos editáveis do Excel.
- A normalização não inventa atribuições de macro para itens históricos: itens sem macro continuam pendentes e geram validação.
- A auditoria completa de regras multifomento será feita no estágio final seguinte.

