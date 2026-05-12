# PSE - Precificacao de Servicos e Equipamentos

Ferramenta interna do Instituto SENAI de Inovacao em Biossinteticos & Fibras (ISIB&F / Firjan) para montagem, validacao e acompanhamento de propostas de PD&I.

## Versao estavel

Arquivo atual em producao/beta estavel:

`ISIB&F_precificação_de_projetos_v029.html`

Esta versao usa um JSON compartilhado sincronizado pelo OneDrive/SharePoint, escolhido pelo usuario no navegador.

## Como usar

1. Abra `ISIB&F_precificação_de_projetos_v029.html` no Edge ou Chrome.
2. Clique em `DB sincronizado`.
3. Selecione o arquivo oficial `ISIBF_DB.json` na pasta OneDrive sincronizada.
4. Confirme que a landing mostra nome do arquivo, numero de propostas, usuarios e revisao do DB.
5. Informe seu e-mail corporativo cadastrado no DB.
6. Edite/crie propostas normalmente.
7. Use `Atualizar DB` para gravar no JSON sincronizado e gerar backup local.

Firefox continua funcionando para modo local/manual, mas nao para escrita direta no mesmo arquivo sincronizado, porque nao suporta a File System Access API usada pelo modo `DB sincronizado`.

## DB oficial

O arquivo de banco de dados oficial e:

`ISIBF_DB.json`

Esse arquivo contem usuarios, propostas e dados sensiveis. Ele nao deve ser versionado no Git.

## Funcionalidades principais

- Rubricas: Pessoal Tecnico, Pessoal Administrativo, Viagens, Software, Equipamentos, Consumiveis, Servicos e Material Permanente.
- Suporte a multiplos fomentos: EMBRAPII, ANP, Petrobras, ANEEL e Sem Fomento.
- Propostas mae com subequipes.
- Colaboradores com permissao por subequipe.
- Fluxo de aprovacao/revisao com controle de alteracoes apos envio inicial para aprovacao.
- Validacoes de regramentos e barra inferior expansivel.
- Regras EMBRAPII, incluindo alta alavancagem e avisos/erros especificos.
- Catalogo real de reagentes.
- Persistencia em JSON sincronizado pelo OneDrive com releitura antes de salvar.
- Deteccao conservadora de conflito na mesma proposta.
- Backup local preservado no fluxo `Atualizar DB`.

## Estrutura relevante

```
ISIB&F_precificação_de_projetos_v029.html  <- app atual
IMPLEMENTATION_LOG_CODEX_V29.md            <- resumo consolidado da branch promovida para main
c-system.css                               <- design system de referencia
C-premium.html                             <- prototipo premium de referencia
landing.html                               <- prototipo da landing/login
HANDOVER.md                                <- regras de design e constraints
catalogo_default_reagentes.json            <- catalogo real de reagentes em JSON
precos_default_reagentes_pdi_2026.xlsx     <- fonte original dos precos
outdated/pse_v12.html                      <- baseline historico
```

## Regras de desenvolvimento

- Nao commitar `ISIBF_DB.json`, backups ou outros DBs reais.
- Nao alterar formulas financeiras sem revisao explicita.
- Nao refatorar os namespaces principais sem necessidade: `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH`, `PRICE_CAT`.
- Preservar modo local/manual JSON.
- Preservar backup local.

## Historico

| Versao | Arquivo | Status |
| --- | --- | --- |
| v29 | `ISIB&F_precificação_de_projetos_v029.html` | Atual estavel |
| v22 | `pse_v22_claude_continuation.html` | Historico no main inicial |
| v12 | `outdated/pse_v12.html` | Baseline original |
