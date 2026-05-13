# V032 - Validações e Exportação

Branch: dev_xlsx_premium_export_v030
Base: app/ISIB&F_precificação_de_projetos_v031.html
Saída: app/ISIB&F_precificação_de_projetos_v032.html

## Alterações
- Criada a v032 a partir da v031, sem editar a v031.
- Propostas sem fomento agora têm campo configurável de custos indiretos (`sem_ind_pct`), com padrão 30%.
- Validação de proposta sem fomento gera aviso amarelo quando indiretos ficam abaixo de 30%.
- Validação de aporte econômico EMBRAPII passa a ser aplicada somente no nível do projeto/mãe ou proposta direta, não em subpropostas de equipe.
- Validações de indiretos/suporte/DOA/CI/taxas passam a ser aplicadas somente no nível do projeto para propostas multi-equipe.
- Subpropostas continuam recebendo validações de rubricas e itens, mas não precisam bater isoladamente econômico/indiretos.
- Texto de exportação XLSX removeu “premium” das mensagens ao usuário.
- Download do XLSX ganhou revogação tardia do ObjectURL para evitar falha silenciosa de geração em navegador.
- Metadados/nomes de exportação atualizados para v032.

## Lógica tocada
- CALC: alteração pontual para indiretos sem fomento.
- VAL: alteração pontual de escopo das validações econômico/indiretos.
- EXPORT: alteração pontual de mensagens, versão e rotina de download.

## Fora de escopo
- Nenhuma mudança em persistência/OneDrive, workflow, revisão, AUTH, PRICE_CAT ou layout global.
- Nenhuma mudança nas fórmulas financeiras além da inclusão solicitada de indiretos para sem fomento.

## Checks
- v31 preservada.
- v32 existe.
- Checagem sintática dos scripts HTML passou: 4 scripts OK.
- CALC, VAL, EXPORT, REVISION, AUTH e PRICE_CAT permanecem no arquivo.

## Ajuste adicional HH
- Tabela HH antiga preservada como legacy (`ptec_roles_legacy` / `padm_roles_legacy`).
- Tabela HH atualizada passa a ser padrão para técnico e administrativo.
- Aba Pessoal Técnico ganhou checkbox `usar HH legacy?` para alternar a fonte de cargos/HH.
- Aba Pessoal Administrativo ganhou checkbox `usar HH legacy?` para alternar a fonte de cargos/HH.
- Cálculo de remuneração/encargos/total usa a tabela selecionada na configuração da proposta, com fallback legacy para compatibilidade de propostas antigas.
- Exportação XLSX também respeita a tabela HH selecionada por proposta/subproposta.
