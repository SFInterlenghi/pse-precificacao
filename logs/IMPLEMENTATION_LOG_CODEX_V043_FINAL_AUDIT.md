# Implementation Log - V043 Auditoria Final

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v042.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v043.html`
- V042 arquivada em `archive/outdated/versions/v042/`

## Correções da auditoria

- Validações agregadas de proposta mãe agora usam um escopo consolidado:
  - itens próprios da mãe;
  - itens das subpropostas;
  - indiretos calculados uma única vez sobre a base consolidada.
- Mãe sem itens próprios não encerra mais a validação antes de avaliar as subpropostas.
- Limite EMBRAPII de Serviços de Terceiros PD&I usa o total consolidado.
- Limites ANP de equipamentos/material permanente usam valor e total financeiro consolidados.
- Validações de suporte/DOA/CI/ANEEL usam o cálculo consolidado no nível do projeto.
- Percentuais configurados como `0%` passam a ser respeitados em Suporte, DOA, CI, Taxa Administrativa e Taxa de Infraestrutura.
- Campos de configuração também exibem corretamente `0%`, sem substituir visualmente pelo default.
- Novas propostas ANP/Petrobras de infraestrutura começam com DOA de `3%`; propostas históricas acima do teto continuam sinalizadas e não são alteradas silenciosamente.
- Metadados e exportação atualizados para v043.

## Auditoria multifomento

- Normalização legada preservada:
  - `anp_petrobras` -> `["anp", "petrobras"]`;
  - `sem` é removido quando há outro fomento selecionado.
- Regras específicas de cada fomento continuam cumulativas.
- Petrobras permanece uma chave independente, herdando a base ANP e acrescentando regras SIGITEC existentes.
- Família equivalente de suporte/indiretos/admin/infra usa o limite mais conservador:
  - EMBRAPII + ANP: `15%`;
  - EMBRAPII + ANEEL: `10%`;
  - ANP + ANEEL: `10%`;
  - ANP + Petrobras: `20%`.
- Combinações acima do teto geram erro vermelho e passam após ajuste para o limite efetivo.
- Macroentregas permanecem disponíveis quando EMBRAPII está entre os fomentos selecionados; demais regras continuam sendo avaliadas em paralelo.
- Material permanente e Suporte Operacional permanecem na contrapartida Empresa quando EMBRAPII está selecionada.
- SENAI permanece restrito a valores econômicos.

## Decisão mantida, sem automação

- Para combinações como ANP + ANEEL, a ferramenta representa uma única família de indiretos e exige que a soma configurada respeite o teto mais conservador.
- A ferramenta não redistribui automaticamente o teto entre DOA e CI, pois não há regra fornecida dizendo qual componente deve absorver a redução.
- Exemplo aceito: DOA `5%` + CI `5%` para teto combinado de `10%`.

## Verificações

- Dois blocos JavaScript compilados sem erro.
- Página v043 abriu no Chrome sem erros de console.
- Um único workspace, uma única sidebar e nenhum ID duplicado.
- Mãe vazia com itens somente nas filhas executou validações consolidadas.
- Serviço PD&I EMBRAPII acima de 30% foi detectado no consolidado.
- Equipamento ANP acima de 30% foi detectado no consolidado.
- Percentuais zero foram preservados nos quatro tipos de indiretos.
- Matriz multifomento testada para EMBRAPII, ANP, Petrobras e ANEEL.
- Nenhum JSON/DB foi modificado.

## Limitações

- A composição não cria duas rubricas paralelas de indiretos para dois fomentos; aplica uma família equivalente com teto conservador.
- Uma política automática diferente de repartição DOA/CI exige decisão de negócio antes de implementação.

