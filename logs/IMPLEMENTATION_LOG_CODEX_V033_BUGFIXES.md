# V033 - Correções beta de acesso, notificações e exclusão

Branch: dev  
Base: app/ISIB&F_precificação_de_projetos_v032.html  
Saída: app/ISIB&F_precificação_de_projetos_v033.html

## Alterações
- Criada a v033 a partir da v032.
- Usuário novo que cria proposta direta passa a ser reconhecido como elaborador/pesquisador da própria proposta e pode editar.
- Login de usuário novo/externo ao cadastro do DB agora também mostra a tela de cards inicial.
- Banner de notificações é limpo ao trocar usuário e antes de recalcular notificações do usuário atual.
- Menu do usuário fecha ao clicar fora ou pressionar Escape.
- Gestores ganharam ação `Excluir proposta atual` no menu do usuário, com confirmação.
- Exclusão de proposta mãe remove também suas subpropostas associadas.
- Em modo DB sincronizado, exclusão grava diretamente no arquivo conectado e verifica conflito simples antes de remover.
- v032 foi arquivada em `archive/outdated/versions/`; v033 fica como versão ativa em `app/`.

## Lógica tocada
- AUTH: ajuste pontual de papel/permissão para proposta direta criada pelo próprio usuário e limpeza de notificações.
- LANDING: ajuste pontual para mostrar a home de cards em login de usuário novo.
- UI: fechamento do menu do usuário por clique externo/Escape.
- DB: exclusão controlada de proposta por gestor.

## Fora de escopo
- Sem mudanças em fórmulas financeiras, CALC, PRICE_CAT, export XLSX, validações de regramento ou layout global.

## Checks
- Checagem sintática dos scripts HTML.
- CALC, VAL, EXPORT, REVISION, AUTH e PRICE_CAT permanecem no arquivo.
