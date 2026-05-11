# PSE — Precificação de Serviços e Equipamentos

Ferramenta interna do **Instituto SENAI de Inovação em Biossintéticos & Fibras (ISIB&F / Firjan)** para montagem, validação e acompanhamento de propostas de PD&I.

## Tecnologia

Aplicação single-file HTML auto-contida (~395 KB). Todo o CSS, HTML e JavaScript está em um único arquivo. Sem dependências de servidor, sem build step — abre direto no browser.

## Funcionalidades

- Rubricas: Pessoal Técnico, Pessoal Administrativo, Viagens, Software, Equipamentos, Consumíveis, Serviços, Material Permanente
- Suporte a múltiplos fomentos: EMBRAPII, ANP, Petrobras, ANEEL, Sem Fomento
- Fluxo de aprovação: elaboração → revisão → aprovação
- Propostas mãe com agregação de sub-propostas por equipe
- Catálogo de preços com sugestão automática
- Exportação XLSX
- Validações em tempo real contra regramentos das agências
- Co-elaboradores por proposta
- Notificações de mudanças no login

## Como usar

1. Abra `pse_v23_codex_beta_fixes.html` em qualquer browser moderno (Chrome / Edge)
2. Carregue o arquivo `ISIBF_DB.json` (banco de dados local — **não versionado**)
3. Faça login com seu e-mail corporativo

> ⚠️ O arquivo de banco de dados (`ISIBF_DB.json`) contém dados de usuários e propostas — **nunca commitar**.

## Estrutura do repositório

```
pse_v23_codex_beta_fixes.html      ← app atual (correções beta Codex)
pse_v22_claude_continuation.html   ← base anterior
c-system.css                       ← design system (tokens, componentes)
C-premium.html                     ← protótipo visual de referência
landing.html                       ← protótipo da tela de login
HANDOVER.md                        ← regras de design e constraints invioláveis
IMPLEMENTATION_LOG_CODEX_V23.md    ← log de implementação mais recente
IMPLEMENTATION_LOG_CLAUDE_V22.md   ← log anterior
precos_default_reagentes_pdi_2026.xlsx  ← fonte original dos preços
catalogo_default_reagentes.json    ← catálogo de preços em JSON
outdated/pse_v12.html              ← versão original (baseline de referência)
```

## Regras invioláveis de desenvolvimento

Ver `HANDOVER.md` para a lista completa. Resumo:

- **Nunca alterar** `outdated/pse_v12.html`
- **Nunca refatorar** os namespaces JavaScript (`CALC`, `VAL`, `STATE`, etc.)
- **Preservar todos os IDs HTML** referenciados pelo JS
- **Nunca commitar** arquivos `*.json` de banco de dados

## Versões

| Versão | Arquivo | Descrição |
|--------|---------|-----------|
| v23 | `pse_v23_codex_beta_fixes.html` | Correções beta: Nova Proposta, catálogo, validações e acesso |
| v22 | `pse_v22_claude_continuation.html` | Base anterior — correções beta aplicadas |
| v12 | `outdated/pse_v12.html` | Versão original de referência |
