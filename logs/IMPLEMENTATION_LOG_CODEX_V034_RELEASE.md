# V034 - Promoção de versão

Branch: dev -> main  
Base: app/ISIB&F_precificação_de_projetos_v033.html  
Saída: app/ISIB&F_precificação_de_projetos_v034.html

## Alterações
- Criada a v034 a partir da v033 corrigida.
- Nomes internos, título HTML, metadados de exportação XLSX e nome de arquivo exportado atualizados de v033 para v034.
- v033 arquivada em `archive/outdated/versions/`.
- v034 mantida como único HTML ativo em `app/`.

## Conteúdo funcional herdado da v033
- Correções de acesso de usuário novo.
- Cards iniciais para usuários novos.
- Limpeza de notificações ao trocar usuário.
- Fechamento do menu do usuário por clique externo/Escape.
- Exclusão de proposta atual por gestor, com confirmação.
- Correção financeira EMBRAPII: Suporte Operacional usa diretos financeiros + econômicos.
- Consolidação de proposta mãe inclui itens próprios da mãe e subpropostas, com indiretos calculados uma vez no nível do projeto.

## Checks
- Checagem sintática dos scripts HTML.
- CALC, VAL, EXPORT, REVISION, AUTH e PRICE_CAT permanecem no arquivo.
- v034 copiada para a pasta compartilhada OneDrive.
