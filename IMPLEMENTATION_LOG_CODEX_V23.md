# Implementação Codex V23 — Beta Fixes

Gerado em 2026-05-11.

## Base

- Branch de trabalho: `v23-codex-beta-fixes`, criada a partir de `dev`.
- Base: `pse_v22_claude_continuation.html`.
- Arquivo criado: `pse_v23_codex_beta_fixes.html`.
- README atualizado para apontar para a versão V23.

## Correções implementadas

- Nova Proposta: painel mais largo e simétrico, mantendo o fluxo existente.
- Nova Proposta mãe: seção de colaboradores com e-mail e seleção das sub-equipes onde o colaborador terá direito de revisão/acesso.
- Criação de proposta mãe: colaboradores são gravados na proposta mãe para rastreio e nas sub-propostas selecionadas como co-elaboradores.
- Menu do usuário: `Equipe & Acesso` substitui `Adicionar equipe`; removido o botão `Equipe & Acesso` da barra de workflow.
- Catálogo de consumíveis: importação agora aceita campos de preço do catálogo real (`media_preco`, `menor_preco`, `preco_unitario`, etc.) e calcula `valor = valor_unitario × quantidade`.
- Barra de validações: expansão mostra lista detalhada em formato vertical, com mensagens completas e prefixos de sub-proposta preservados.
- Distribuição EMBRAPII: soma EP + EB + SN diferente de 100% permanece erro vermelho e agora destaca visualmente o bloco de configuração com a soma atual.

## Lógica tocada

- Sim, de forma localizada em:
  - `NOVA` para colaboradores na criação de proposta mãe.
  - `CONS`/`PRICE_CAT` para mapear campos de preço do catálogo real.
  - `renderVal` para detalhamento da barra de validação.
  - `renderConfig` para realce visual da soma EMBRAPII inválida.
  - `AUTH.applyPermissions`/menu para reposicionar `Equipe & Acesso`.
- Não foram alteradas fórmulas financeiras centrais, exportação XLSX, schema de DB de forma incompatível ou namespaces.

## Limitações / decisões

- Não foi criada uma segunda aplicação ou shell. A tela de Nova Proposta foi ampliada como painel/modal premium para reduzir risco.
- O direito de revisão dos colaboradores foi implementado como co-elaboração nas sub-propostas selecionadas, usando a permissão já existente.
- Não foi feita integração automática com backend; segue standalone HTML.

## Quick checks

- `pse_v22_claude_continuation.html` permanece sem alteração.
- `pse_v23_codex_beta_fixes.html` existe.
- Namespaces críticos preservados: `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH`, `PRICE_CAT`, `NOVA`.
- JSON/DB/catalog files não foram modificados.
- Tentativa de checagem via Node foi bloqueada pelo ambiente (`node.exe: Acesso negado`).

## Testes manuais recomendados primeiro

- Criar proposta mãe com múltiplas equipes e adicionar colaborador vinculado a uma sub-equipe específica.
- Importar item do catálogo de consumíveis e confirmar que preço unitário deixa de vir zero.
- Abrir menu do usuário e confirmar `Equipe & Acesso`.
- Clicar/expandir barra de validações em proposta mãe com erros em sub-propostas.
- Alterar EP/EB/SN para soma diferente de 100% e confirmar erro vermelho + destaque no bloco.
