# Implementation Log - V044 Otimizadores e Macroentregas

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada: `app/ISIB&F_precificação_de_projetos_v043.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v044.html`
- V043 arquivada em `archive/outdated/versions/v043/`

## Implementações

- Precificação por macroentregas habilitada também para propostas diretas EMBRAPII.
- Seletor de macroentregas de pessoal convertido em opções visíveis, sem menu suspenso nem scroll interno.
- Cards de distribuição atual usam vermelho para falta, âmbar para excesso e verde para meta atendida.
- O mesmo tratamento foi aplicado à distribuição atual de cada macroentrega.
- Regra de exibição do otimizador econômico centralizada; ele só aparece em mãe/direta EMBRAPII com déficit superior a R$ 100.
- Custos indiretos passam a ser classificados integralmente como Empresa Parceira na distribuição de recursos.
- Novo otimizador de origem financeira EP/EMBRAPII:
  - executado pela proposta mãe ou direta;
  - mãe pode ajustar itens das subpropostas;
  - prioriza pessoal e depois material de consumo;
  - divide pessoal preservando nome, HH e total de horas inteiras;
  - divide consumo preservando valor unitário e quantidade total;
  - pode dividir software e uso de equipamentos preservando custo/hora;
  - divide apenas serviços classificados como PD&I;
  - consultoria não foi tratada como categoria divisível;
  - viagens e demais serviços permanecem inteiros;
  - material permanente permanece inteiro e obrigatoriamente na Empresa Parceira;
  - mantém o valor financeiro e econômico total do projeto;
  - no modo macroentrega, otimiza cada macro separadamente.

## Persistência e revisão

- Alterações da proposta mãe seguem o snapshot de revisão existente.
- Subpropostas alteradas entram no conjunto de registros modificados do DB.
- O salvamento central continua usando reload, detecção de conflito e merge do arquivo sincronizado.
- Nenhuma gravação automática adicional foi criada.

## Verificações

- Dois blocos JavaScript compilam sem erro.
- Um único `#workspace`; namespaces principais preservados.
- Teste isolado dividiu pessoa de 100h em 40h EP e 60h EMBRAPII e usou consumo para absorver resíduo de R$ 50.
- Horas, quantidade, valor unitário e valor total foram preservados.
- Material permanente permaneceu EP e serviço técnico permaneceu inteiro.
- Rateio de pessoa entre três macroentregas preservou 101 horas inteiras.
- Nenhum JSON/DB foi alterado.

## Limitações

- Itens indivisíveis podem impedir o encaixe exato; a ferramenta informa o resíduo.
- Consultoria está fora da divisão automática nesta versão.
- A validação final deve ser feita no Chrome com casos reais antes de promover para `main`.
