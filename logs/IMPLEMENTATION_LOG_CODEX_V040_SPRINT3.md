# Implementation Log - V040 Sprint 3

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v039.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v040.html`
- V039 arquivada em `archive/outdated/versions/v039/`

## Implementado

- Fundação backward-compatible de macroentregas em `STATE.meta`:
  - `precificacao_modo`: `tradicional` ou `macroentregas`;
  - `macroentregas`: lista com ID, nome, duração e período relativo.
- Propostas históricas sem os novos campos são normalizadas para modo tradicional.
- Opção de macroentregas exibida somente ao criar proposta mãe com EMBRAPII selecionada.
- Criação exige no mínimo 3 macroentregas, nomes preenchidos, durações inteiras positivas e soma igual ao prazo total.
- Períodos são derivados em meses genéricos sequenciais, por exemplo 1-6, 7-14 e 15-18.
- Editor posterior incluído em Configurações Gerais da proposta mãe EMBRAPII.
- Subpropostas exibem a estrutura herdada como somente leitura.
- Subpropostas criadas junto com a mãe, adicionadas posteriormente ou abertas a partir de DB antigo herdam:
  - duração total;
  - modo de precificação;
  - lista completa de macroentregas.
- Alterações feitas na mãe são propagadas às subpropostas no DB em memória e entram no conjunto de registros modificados para persistência.
- Validação de macroentregas ocorre mesmo quando a proposta ainda não possui valores financeiros.

## Fora desta sprint

- Atribuição de itens/pessoas às macroentregas.
- Rateio linear de pessoas entre múltiplas macros.
- Cronograma de desembolso EP/EB/SN.
- Visão `Por Macroentrega` na sidebar.
- Exportação e histórico específicos de macroentregas.

## Lógica tocada

- Sim, somente metadados, criação, herança e validação estrutural de macroentregas.
- `CALC`, fórmulas financeiras, workflow e persistência central não foram alterados.
- Nenhum JSON/DB foi modificado.

## Verificações

- JavaScript dos quatro blocos `<script>` compilou sem erro.
- Modelo isolado:
  - 6 + 8 + 4 meses validou para prazo de 18;
  - períodos derivados: 1-6, 7-14 e 15-18;
  - soma 17/18 foi bloqueada;
  - duas macroentregas foram bloqueadas;
  - modo histórico sem campos foi normalizado para tradicional.
- Navegador:
  - criação mãe EMBRAPII exibiu o bloco somente quando elegível;
  - três macros válidas exibiram soma 18/18;
  - criação gerou mãe, ESP e TAP;
  - mãe e ambas as subpropostas receberam cópias equivalentes das macroentregas;
  - editor posterior exibiu três linhas e estrutura válida;
  - proposta tradicional abriu sem erro de macroentrega;
  - nenhum erro de console ou ID duplicado.
- V039 arquivada é idêntica ao blob commitado.

## Próximo sprint

- Atribuir todas as rubricas às macros, permitir múltiplas macros para pessoas e implementar cálculo, cronograma e visão por macroentrega.
