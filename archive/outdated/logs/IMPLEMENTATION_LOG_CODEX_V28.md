# Implementation Log - Codex V28

Base: `pse_v27_codex_validation_bar.html`

Criado:
- `pse_v28_embrapii_rules.html`

Alterado:
- `README.md`
- `IMPLEMENTATION_LOG_CODEX_V28.md`

Mudanças:
- Adicionada validação amarela para contrapartida EMBRAPII acima de R$ 2.999.999,00, exigindo aprovação da diretoria EMBRAPII.
- Adicionada validação vermelha impedindo compra de equipamentos/material permanente em projetos EMBRAPII com valor total inferior a R$ 5.000.000,00.
- Adicionadas faixas EMBRAPII CG - Alta Alavancagem 1 e 2:
  - R$ 5M a R$ 10M: EB máximo 25%; compra de equipamentos até 15% do valor total.
  - Acima de R$ 10M: EB máximo 20%; compra de equipamentos até 30% do valor total.
- Rótulo EMBRAPII passa a exibir `Alta Alavancagem 1/2` quando há cálculo suficiente para determinar a faixa.
- Regramentos EMBRAPII no modal receberam as novas regras.
- Landing atualizada para `v0.28`.

Lógica tocada:
- Sim, pontualmente em `FOMENTO` e `VAL`.
- `CALC`, fórmulas financeiras centrais, DB, catálogo e exportação não foram reestruturados.

Decisões conservadoras:
- As novas regras são validações; a ferramenta não autoajusta EP/EB/SN.
- "Compra de equipamento" foi aplicada a `Material Permanente / Equipamentos (Aquisição)`, não a `Uso de Equipamentos (custo-hora)`.
- Para propostas mãe, as regras de faixa usam o total consolidado disponível da mãe + subpropostas.

Checks rápidos:
- Base V27 mantida como arquivo separado.
- V28 criada.
- `CALC`, `VAL`, `EXPORT`, `REVISION`, `AUTH` e `PRICE_CAT` permanecem no HTML.
- Nenhum JSON/DB/catalog foi modificado.
