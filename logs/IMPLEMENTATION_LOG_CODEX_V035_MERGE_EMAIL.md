# IMPLEMENTATION LOG - CODEX V035 MERGE + EMAIL DRAFTS

## Branch
- `dev`

## Arquivo base
- `app/ISIB&F_precificação_de_projetos_v034.html`

## Arquivo gerado
- `app/ISIB&F_precificação_de_projetos_v035.html`

## Mudanças realizadas
- Criada a v035 a partir da v034.
- Arquivada a v034 em `archive/outdated/versions/`.
- Corrigida a normalização de metadados em mesclagens de DB com conflito de IDs.
- Adicionado reparo leve no carregamento do DB para propostas diretas sem mãe com `id_base` inconsistente.
- Ajustada a listagem para não agrupar propostas diretas como revisão de outra proposta apenas por `revisao_numero > 0`.
- Adicionado módulo `EMAIL_DRAFTS` para gerar rascunhos editáveis de e-mail, sem envio automático.
- Integrados rascunhos aos eventos:
  - envio para aprovação;
  - solicitação de revisão;
  - aprovação.
- Adicionados botões manuais no workflow para regerar rascunhos conforme o status da proposta.

## Ajuste pós-validação
- Removidos os botões manuais extras de e-mail da barra de workflow para preservar a aparência/texto original dos botões de aprovação e revisão.
- O modal de rascunho mantém a geração automática depois da transição e agora usa o botão `Enviar para e-mail` para abrir o cliente padrão/Outlook via `mailto` preenchido.

## Regras preservadas
- Nenhum e-mail é enviado automaticamente.
- Nenhuma API externa de e-mail foi adicionada.
- Valores financeiros e fórmulas não foram alterados.
- Fluxos de save, backup, revisão, aprovação e DB sincronizado foram preservados.

## Checagens realizadas
- Sintaxe JS do HTML validada com `new Function`.
- Teste em VM: proposta direta contaminada com `id_base` antigo é reparada sem alterar status/revisão.
- Teste em VM: merge de proposta direta conflitante gera novo ID e reescreve `id_base`, `id_mae` e `state.meta`.
- Teste em VM: merge de proposta mãe + subproposta remapeia `id_mae` da filha para o novo ID da mãe.
- Teste em VM: rascunho de e-mail de proposta aprovada usa destinatário do elaborador e inclui ID/título.

## Limitações conhecidas
- O modal de e-mail apenas gera texto para copiar ou abrir via `mailto`; ele não confirma envio real.
- `mailto` pode truncar corpos longos dependendo do cliente de e-mail, por isso o botão de copiar continua sendo o caminho recomendado.
