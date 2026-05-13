# Implementation Log - Codex V27

Base: `pse_v26_codex_revision_cleanup.html`

Criado:
- `pse_v27_codex_validation_bar.html`

Alterado:
- `README.md`
- `IMPLEMENTATION_LOG_CODEX_V27.md`

Mudanças:
- Barra inferior de validações agora expande como painel fixo sobreposto, ocupando a parte inferior da tela e exibindo lista detalhada.
- Cada validação expandida mostra tipo, equipe/subproposta quando disponível, rubrica, mensagem, valor detectado e regra/regramento inferido da mensagem.
- Botão `Otimizar HH Técnico` agora só aparece para déficit EMBRAPII acima do mesmo limiar da validação.
- Otimização de HH atualiza EP/EB/SN sem arredondamento intermediário, evitando resíduo falso de déficit após o ajuste econômico.
- Landing atualizada para `v0.27`.

Lógica tocada:
- Sim, pontualmente em `VAL.optimizeEco()` e no renderer da barra de validações.
- Cálculos financeiros centrais (`CALC`) não foram alterados.

Riscos / limitações:
- O campo "regra" da lista detalhada é derivado da mensagem de validação atual; regras futuras com mensagens novas podem precisar de um rótulo mais explícito.
- A expansão da barra é visualmente sobreposta e não altera o layout principal.

Checks rápidos:
- `pse_v26_codex_revision_cleanup.html` mantido como base intocada.
- `pse_v27_codex_validation_bar.html` criado.
- `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH` e `PRICE_CAT` permanecem no HTML.
- Nenhum JSON/DB/catalog foi modificado.
