# PSE - Precificacao de Servicos e Equipamentos

Ferramenta interna do Instituto SENAI de Inovacao em Biossinteticos & Fibras (ISIB&F / Firjan) para montagem, validacao e acompanhamento de propostas de PD&I.

## Execucao

Arquivo atual da ferramenta:

`app/ISIB&F_precificação_de_projetos_v029.html`

Abra no Edge ou Chrome para usar o modo `DB sincronizado`.

## Como usar o DB sincronizado

1. Abra `app/ISIB&F_precificação_de_projetos_v029.html`.
2. Clique em `DB sincronizado`.
3. Selecione o arquivo oficial `ISIBF_DB.json` na pasta OneDrive sincronizada.
4. Confira na landing se aparecem nome do arquivo, numero de propostas, usuarios e revisao do DB.
5. Informe seu e-mail corporativo cadastrado no DB.
6. Edite/crie propostas normalmente.
7. Use `Atualizar DB` para gravar no JSON sincronizado e gerar backup local.

Firefox continua funcionando para modo local/manual, mas nao para escrita direta no mesmo arquivo sincronizado, porque nao suporta a File System Access API usada pelo modo `DB sincronizado`.

## DB oficial

O arquivo de banco de dados oficial e:

`ISIBF_DB.json`

Esse arquivo contem usuarios, propostas e dados sensiveis. Ele nao deve ser versionado no Git. Ele deve ficar na pasta sincronizada pelo OneDrive/SharePoint.

## Estrutura do repositorio

```text
/
  README.md
  .gitignore

  app/
    ISIB&F_precificação_de_projetos_v029.html

  logs/
    IMPLEMENTATION_LOG_CURRENT.md

  docs/
    HANDOVER.md

  docs/design/
    C-premium.html
    c-system.css
    landing.html

  data/catalog/
    catalogo_default_reagentes.json
    precos_default_reagentes_pdi_2026.xlsx

  archive/versions/
    pse_v22_claude_continuation.html
    pse_v12.html

  archive/logs/
    IMPLEMENTATION_LOG_CLAUDE_V22.md
```

## Arquivos principais

- App atual: `app/ISIB&F_precificação_de_projetos_v029.html`
- Log atual/consolidado: `logs/IMPLEMENTATION_LOG_CURRENT.md`
- Regras e constraints: `docs/HANDOVER.md`
- Catalogo real de reagentes: `data/catalog/catalogo_default_reagentes.json`
- Fonte original de precos: `data/catalog/precos_default_reagentes_pdi_2026.xlsx`
- Historico arquivado: `archive/`

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

## Regras de desenvolvimento

- Nao commitar `ISIBF_DB.json`, backups ou outros DBs reais.
- Nao alterar formulas financeiras sem revisao explicita.
- Nao refatorar os namespaces principais sem necessidade: `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH`, `PRICE_CAT`.
- Preservar modo local/manual JSON.
- Preservar backup local.

## Historico

| Versao | Arquivo | Status |
| --- | --- | --- |
| v29 | `app/ISIB&F_precificação_de_projetos_v029.html` | Atual estavel |
| v22 | `archive/versions/pse_v22_claude_continuation.html` | Historico |
| v12 | `archive/versions/pse_v12.html` | Baseline original |
