# Implementation Log - V045 Otimização por Macroentrega

## Base e branch

- Branch: `dev_v038_beta_rules`
- Base preservada e arquivada: `archive/outdated/versions/v044/ISIB&F_precificação_de_projetos_v044.html`
- Arquivo ativo: `app/ISIB&F_precificação_de_projetos_v045.html`
- `main` não foi alterada.

## Implementações

- Otimizador de origens executado separadamente em cada macroentrega.
- Metas de EP, EMBRAPII e SENAI calculadas sobre o valor total de cada macro.
- SENAI é preenchido primeiro até o teto configurado; EMBRAPII é preenchida depois até seu teto; todo resíduo permanece na Empresa Parceira.
- EMBRAPII e SENAI nunca podem exceder suas metas.
- Empresa Parceira pode absorver diferença de até 7 pontos percentuais acima da meta sem bloquear; a divergência aparece como aviso.
- Acima de 7 pontos percentuais adicionais de EP, ou abaixo da participação mínima de EP, a validação é bloqueante.
- Pessoas e materiais de consumo permanecem com quantidades inteiras.
- O otimizador recusa execução quando encontra material de consumo com quantidade fracionária.
- Prioridade de divisão mantida: pessoal, material de consumo, software, uso de equipamentos e serviços de PD&I.
- Consultoria não é dividida automaticamente nesta versão.
- Viagens e serviços não classificados como PD&I permanecem indivisíveis.
- Material permanente e custos indiretos permanecem integralmente na Empresa Parceira.
- O valor total do projeto é verificado antes/depois; a operação é revertida se houver alteração.

## Exportação

- Rubricas, pessoas e dados brutos incluem a fonte do recurso.
- A aba `11_Cronograma_Macros` mostra metas e valores atuais por macro.
- A aba `12_Macro_Rubrica_Fontes` detalha rubrica e fonte EP/EB/SN por macroentrega.
- Avisos de pequenas diferenças permitidas entram na planilha sem bloquear a exportação.

## Testes

- Criado `tools/test_v045_financial_rules.js`.
- Casos cobertos:
  - metas 42% / 33% / 25%;
  - tolerância com resíduo em EP;
  - bloqueio de EMBRAPII acima do teto;
  - bloqueio de EP mais de 7 p.p. acima da meta;
  - otimização independente de duas macroentregas;
  - preservação do valor total;
  - horas e quantidades inteiras;
  - material permanente e consultoria mantidos em EP;
  - presença da visão de rubrica/fonte por macro no XLSX.
- Sintaxe dos blocos JavaScript validada.
- `git diff --check` sem erros.

## Limitações

- A solução busca o melhor encaixe abaixo dos tetos respeitando a ordem de prioridade dos itens; granularidade inteira pode deixar pequeno resíduo em EP.
- A cobertura automatizada ainda não abrange as 85 regras financeiras/regulatórias. Esta versão cria a fundação inicial; a matriz completa de `CALC`, `VAL`, fomentos e consolidação permanece como backlog de alta prioridade.
- A abertura automatizada do arquivo local foi bloqueada pela política do navegador integrado; o teste manual em Chrome com DB real continua necessário.

