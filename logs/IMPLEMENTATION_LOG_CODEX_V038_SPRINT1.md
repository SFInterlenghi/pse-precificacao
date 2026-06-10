# Implementation Log - V038 Sprint 1

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v037.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v038.html`
- V037 arquivada em `archive/outdated/versions/v037/`

## Implementado

- Horas técnicas e administrativas aceitam entrada inteira.
- Campo somente leitura `HH PROJ.` mostra total da pessoa dividido pelas horas.
- Petrobras usa horas semanais inteiras e deriva horas totais por `h/sem × 52/12 × meses`.
- Registros Petrobras antigos continuam legíveis pela conversão do total já salvo.
- Validações locais voltaram às subpropostas; regras consolidadas permanecem na mãe.
- Restrição EMBRAPII de compra de equipamento aparece na subproposta que contém o item.
- Otimizador econômico EMBRAPII considera o impacto do novo econômico sobre o suporte e resolve em uma execução.
- `mailto` usa `%20` para espaços, evitando `+` literal no Outlook.
- Mojibake conhecido foi corrigido, inclusive no catálogo incorporado.
- Botões de carga manual foram renomeados para `Carregar DB local`.
- Abrir ou criar proposta remove a tela dos três cards.
- Proposta direta nova exige equipe; propostas históricas tentam inferir a equipe pelo elaborador.
- Botão circular do header salva no DB conectado com reload-before-save e atualiza a tela.
- Propostas aprovadas permanecem somente leitura, com `Salvar` e `Backup DB` disponíveis a usuários envolvidos.

## Lógica tocada

- Sim, de forma localizada: normalização/conversão de horas, validação, otimizador e roteamento de persistência.
- Fórmulas financeiras de rubricas não foram alteradas.
- JSON/DB não foi modificado.

## Verificações

- JavaScript dos dois blocos `<script>` compilou sem erro.
- Navegador: sem erros de console, um workspace, uma title bar, uma sidebar e nenhum ID estático duplicado.
- Nova proposta Petrobras renderizou 13 colunas, `HORAS/SEM.` e `HH PROJ.`.
- Conversão testada: 20 h/sem por 9 meses = 780 horas totais.
- Otimizador testado com R$ 115.000 financeiro: adicionou 404 h econômicas e deixou diferença de -R$ 46,67.
- Subproposta simulada exibiu erro local de horas fracionárias e compra EMBRAPII incompatível com porte consolidado.

## Pendente

- Sprint 2: boas práticas ESP e separação visual Meta x Atual da origem de recursos.
- Sprints seguintes: macroentregas, integrações e auditoria multifomento.
