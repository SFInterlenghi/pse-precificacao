# Implementação v052 — Regramentos e aprovadores

## Escopo

- **Branch:** `codex/dev_v052_rules_approvers`
- **Base preservada:** `app/ISIB&F_precificação_de_projetos_v051.html`
- **Nova versão:** `app/ISIB&F_precificação_de_projetos_v052.html`
- **Main:** não alterada.

## Implementado

- Aba **Regramentos** atualizada com boas práticas ESP, boa prática DAP, regras multi-fomento, macroentregas e origem/teto de serviços EMBRAPII.
- Boa prática DAP amarela para ausência de “Válvulas e conexões” e para soma inferior a R$ 15.000,00.
- York Castillo Santiago e Julliana Muniz promovidos a gestores/aprovadores ESP; senha beta segue `SENAI` pelo perfil gestor.
- Stefano Ferrari e Ana Carolina Spindola permanecem gestores ativos, marcados como legacy e excluídos das novas listas de aprovação.
- Leonardo Teixeira habilitado como aprovador de CIN, DAP e ESP, sem duplicar o usuário.
- EMBRAPII: teto consolidado de 30% aplicado à soma de todos os serviços de terceiros.
- EMBRAPII: serviços PD&I exigem origem EB; demais serviços exigem origem EP.
- Combo EMBRAPII + ANP: PD&I em EB não recebe o bloqueio genérico de ANP; ANP puro mantém a proibição existente.

## Boas práticas ANEEL

- Rubrica renomeada para **Serviços de Terceiros e Outros**.
- Categorias explícitas `publicacao` e `congresso` para taxa de publicação científica e taxa de inscrição em congresso.
- Avisos amarelos de ausência aplicados no escopo consolidado da proposta mãe ou direta.
- Lembrete amarelo permanente para verificar congresso, passagem e diárias associadas, sem adicionar campos à rubrica de viagens.
- Sem valores mínimos: a checagem considera presença com valor maior que zero.

## Verificações

- Sintaxe dos scripts inline validada.
- 10 suítes automatizadas aprovadas, incluindo 22 casos regulatórios de maior risco.
- Novo teste v052 cobre serviços, origens, DAP e registro de aprovadores.
- Nenhum JSON/DB, cálculo financeiro ou arquivo v051 foi modificado.
