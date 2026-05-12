# PSE v11 — Handover de Redesign Visual (Direção C · Premium Editorial)

> **Para:** Claude Code (ou desenvolvedor)
> **Origem:** `uploads/pse_v11.html` (single-file app, ~4400 linhas)
> **Objetivo:** aplicar o redesign visual da **Direção C** em todas as telas/modais sem alterar lógica, IDs, nomes de funções, regras de cálculo ou validação.
> **Referências visuais já produzidas neste projeto:**
> - `screens/c-system.css` — design system completo (tokens, componentes, diff)
> - `screens/C-premium.html` — tela de proposta protótipo (rubricas + sidebar)
> - `screens/landing.html` — landing/login redesenhada
> - `screens/A-corporativa.html`, `screens/B-saas.html` — direções rejeitadas (referência de comparação apenas)
>
> **Use estes arquivos como ground truth visual.** Quando este documento mencionar "ver C-premium.html", abra o arquivo e reproduza fielmente o tratamento visual.

---

## 0. REGRAS INVIOLÁVEIS

Antes de qualquer coisa, leia. Violar qualquer item abaixo quebra a aplicação.

### 0.1. NÃO ALTERAR
- **Nomes de funções, métodos e módulos JS.** Toda a lógica é organizada em namespaces globais que outras partes do código chamam por nome. Lista completa (todos devem permanecer com mesmo nome, mesma assinatura, mesmo comportamento):
  - `STATE`, `CALC`, `VAL`, `DATA`, `LS`, `UI`, `CONFIRM`, `META`
  - `PTEC`, `PADM`, `VIAG`, `SOFT`, `EQUIP`, `CONS`, `SERV`, `MATP` (rubricas)
  - `TEAM`, `EXPORT`, `REVISION`, `NOVA`, `DB`, `LANDING`, `CONC`
  - `DASHBOARD`, `ADDTEAM`, `AUTH`, `AUDIT`, `UMGR`, `REG`, `REG_DATA`
  - Funções globais: `renderAll`, `renderResume`, `toast`, etc.
- **IDs HTML referenciados pelo JS.** Lista mínima a preservar (não exaustiva — o JS faz `getElementById` em dezenas; preserve TODOS os IDs existentes):
  - Header: `app`, `hdr`, `hinfo`, `h-titulo`, `h-empresa`, `h-modo`, `h-prop`, `h-prop-id`, `h-prop-status`, `huser-chip`, `huser-name`, `huser-role`, `btn-users`, `btn-dashboard`, `btn-add-team`, `btn-exp`
  - Workspace: `workspace`, `main-col`, `aside`, `readonly-banner`, `workflow-bar`, `wf-id`, `wf-status`, `wf-comment`, `wf-actions`, `team-switcher`, `team-switcher-btns`
  - Seções/rubricas: `sec-ptec`, `sec-padm`, `sec-viag`, `sec-soft`, `sec-equip`, `sec-cons`, `sec-serv`, `sec-matp` + `cnt-*`, `tot-*`, `sdot-*`, `list-*` correspondentes
  - Resumo: `resume` e tudo dentro dela renderizada por `renderResume()` no JS — preserve estrutura, troque apenas o CSS
  - Modais: `db-modal`, `save-modal`, `nova-modal`, `meta-modal`, `confirm-modal`, `audit-modal`, `auth-modal`, `umgr-modal`, `reg-modal`, `merge-modal` (e todos os IDs internos a eles)
  - Validação: `valbar`, `val-toggle`, `val-content`, etc.
  - Landing: `landing-screen`, `landing-email`
- **Estrutura de dados.** O `STATE.proposal` e o formato do `db.json` não mudam. Você está mexendo em apresentação, não em modelo.
- **Regras de validação e cálculo.** `VAL.run`, `CALC.*`, `REVISION.*` permanecem byte-a-byte iguais.
- **Atributos `onclick="…"` inline.** Mantenha. O app inteiro é construído com handlers inline; reescrever para `addEventListener` é fora de escopo e arriscado.
- **Estrutura do DOM gerado por JS** (ex.: `PTEC.render()` cria `<div class="row-item">…`). Você pode mudar **classes e markup interno** desde que o JS continue achando os elementos por ID/seletor que ele já usa. Faça uma busca por `querySelector` / `getElementById` em cada módulo antes de mudar markup gerado.

### 0.2. PODE (E DEVE) ALTERAR
- **CSS inteiro** — substitua o `<style>` no topo do arquivo pelo conteúdo de `screens/c-system.css` adaptado.
- **Markup decorativo** que não tem ID nem é referenciado por seletor JS (ex.: emojis em headings, ícones, wrappers visuais).
- **Emojis → SVG icons.** Substituir todos os emojis (🔬 📋 ✈️ 💻 ⚗️ 🧪 🔧 📦 ⚙️ 👥 ➕ ＋ 🗄 📖 ⬇ 🔑 ✅ 🔄 🏗 📂 💾 🔀 ✕ 🔍) por ícones SVG inline outline 1.6px (estilo Lucide/Phosphor). Lista de mapeamento na §6.
- **Tamanhos, espaçamentos, fontes, cores** — todos vêm dos tokens de `c-system.css`.
- **Strings de UI puramente decorativas** (títulos, labels, legendas) — pode reescrever em tom mais editorial, *desde que* não seja texto que o JS lê via `textContent === '…'`.

### 0.3. METODOLOGIA SUGERIDA
1. **Não reescreva o arquivo do zero.** Edite `pse_v11.html` em camadas:
   - **Camada 1:** substituir o `<style>` inteiro por `c-system.css` + estilos específicos de tela (ver §3).
   - **Camada 2:** trocar emojis por SVG (busca/substitui).
   - **Camada 3:** ajustar markup de cada componente para casar com o novo CSS (ex.: header, section-header, modais).
   - **Camada 4:** revisar funções de render JS (`PTEC.render`, `VIAG.render`, etc.) para emitir o markup novo.
2. **Após cada camada, abra o arquivo no navegador** e teste fluxo crítico: carregar DB → login → abrir proposta → adicionar item de pessoal → salvar → exportar.
3. **Faça uma cópia `pse_v11.html` → `pse_v12_premium.html`** e edite a v12. Não destrua o original.

---

## 1. SISTEMA DE DESIGN — DIREÇÃO C

### 1.1. Identidade
> **Premium Editorial Financial.** Dashboard como "publicação financeira": tipografia editorial (serif Fraunces para títulos e números-protagonistas, sans Inter Tight para UI, mono JetBrains Mono para valores e códigos). Paleta paper-white com acentos ouro. Densidade alta mas com respiro. Cor é semântica — usada para *significado* (status, fomento, diff), não para decorar.

### 1.2. Tokens (do `c-system.css`)

**Surface / Paper**
```
--bg:#FAFAF9       (fundo geral, off-white quente)
--paper:#FFFFFF    (cards, modais, áreas de conteúdo)
--paper-2:#F6F5F1  (estados hover, headers de tabela, footers de modal)
--paper-3:#EFEDE5  (zebra stripes, highlights sutis)
--hairline:#E8E5DC          (bordas padrão)
--hairline-soft:#F0EEE7     (bordas internas/divisores leves)
--hairline-strong:#D5D1C4   (bordas de input, divisores fortes)
```

**Ink / Text**
```
--ink:#0F1115      (primário — títulos, números importantes)
--ink-2:#2A2D33    (texto corpo)
--ink-3:#5C5F66    (texto secundário, labels)
--ink-4:#8E9098    (texto muted, placeholders)
--ink-5:#B8B9BD    (separadores, ícones decorativos)
```

**Brand & Accent**
```
--gold:#B8893B        (CTA primário "Exportar", focus rings, marcador editorial)
--gold-soft:#FAF4E6
--gold-deep:#8C6520   (hover gold)
--gold-border:#ECDDB7
```

**Semantic**
```
--pos:#0E7E4F   --pos-soft:#EDF7F0   --pos-border:#C7E4D2   (sucesso/positivo/aprovado)
--neg:#B43A2C   --neg-soft:#FAEFEC   --neg-border:#F2C8BF   (erro/negativo)
--warn:#B26500  --warn-soft:#FBF0DA  --warn-border:#F1D9A6  (aviso/aguardando)
--info:#1F4E8C  --info-soft:#EAF1F9  --info-border:#C8D8EC  (informação)
```

**Status de proposta** (cores próprias — preservar distinção)
```
--st-elab        cinza neutro    "Em Elaboração"
--st-aprov       âmbar           "Aguardando Aprovação"
--st-revis       púrpura #7C3AED "Em Revisão"
--st-aprovado    verde           "Aprovado"
--st-arquiv      cinza muted     "Arquivado"
```
Cada um tem sua variante `*-soft` e `*-border`. Ver `c-system.css`.

**Fomentos** (cores próprias — preservar distinção)
```
--f-embrapii   azul navy   #1F4E8C
--f-anp        verde       #0E5A4A
--f-petrobras  teal escuro #005A4F
--f-aneel      vinho       #7A2E2E
--f-sem        cinza       #5C5F66
```

**Diff de revisão** (sistema novo — ver §4)
```
--diff-add  verde   adicionado / aumento
--diff-rem  vermelho removido / decréscimo
--diff-mod  púrpura  modificado / alterado
```

**Tipografia** — Fraunces (serif), Inter Tight (sans), JetBrains Mono (mono).
- `t-display` — Fraunces 30–56px para totais e títulos editoriais
- `t-h1` 30px / `t-h2` 22px / `t-h3` 17px / `t-h4` 14px (todos Fraunces 500, letter-spacing negativo)
- Body 13px Inter / Meta 12px / Caption 11px / Eyebrow 10.5px uppercase tracking 1.4px
- Números: `t-num` aplica `font-feature-settings: "tnum" 1` (tabular nums) — **obrigatório em qualquer coluna numérica de tabela** para alinhamento perfeito.

**Espaçamento** — escala 4/8/12/16/20/24/32/40/48 (vars `--s1`…`--s9`). Use só essas.

**Radius** — 4 / 6 / 8 / 10 / 14. Default = 6px.

**Shadows** — 5 níveis. Modal sempre `--shadow-modal`. Cards interativos `--shadow-sm` em hover.

### 1.3. Componentes-base

Todos definidos em `c-system.css`. Use-os em vez de reinventar.

- `.btn` + variantes: `.btn-primary` (preto), `.btn-secondary` (outline), `.btn-gold` (CTA financeiro), `.btn-ghost`, `.btn-danger`, `.btn-link`. Modificadores `.btn-sm`, `.btn-lg`, `.btn-block`.
- `.icon-btn` para botões só-ícone 32×32px.
- `.input`, `.select`, `.textarea` — borda 1px, focus ring ouro. Variante `.input-borderless` para inputs em tabelas (revelar borda no hover/focus).
- `.tag` + status (`.tag-elab`, `.tag-aprov`, `.tag-revis`, `.tag-aprovado`), fomento (`.tag-embrapii`, `.tag-anp`…), severity (`.tag-err`, `.tag-warn`, `.tag-ok`, `.tag-info`), `.tag-mono` (código uppercase neutro).
- `.card` (paper + border + radius 8) e `.card-pad` (padding s5).
- `.modal-overlay`, `.modal-box`, `.modal-sm/md/lg/xl`, `.modal-hdr`, `.modal-body`, `.modal-foot` — sistema unificado de tamanhos (consolidar todos os tamanhos atuais nestes 4).
- `.avatar` (Fraunces italic em círculo preto), variantes `-sm`, `-lg`, `.avatar-stack`.
- `.icn` (16×16 stroke 1.6) para todos os ícones inline. Variantes `-sm` (13) e `-lg` (20).
- `.diff-add` / `.diff-rem` / `.diff-mod` / `.diff-arrow` / `.diff-marker` — sistema de revisão (§4).

---

## 2. ARQUITETURA DE TELAS

### 2.1. Header global (`<header id="hdr">`)

**Antes:** 54px, navy escuro, badge vermelho ISIB&F + título + ~5 chips coloridos + 7 botões fantasma + emojis.

**Depois:** 54px, branco com border-bottom hairline. Ver `screens/landing.html` topo e `screens/C-premium.html` linhas 116-148.

**Estrutura proposta** (preservar IDs!):
```html
<header id="hdr" class="app-hdr">
  <!-- Brand cluster -->
  <div class="brand">
    <div class="brand-mark">P</div>            <!-- círculo preto Fraunces italic -->
    <div class="brand-name">
      <b>PSE</b>
      <span>Firjan · ISIB&F</span>
    </div>
  </div>
  <div class="brand-divider"></div>

  <!-- Breadcrumb + project meta (substitui hinfo + chips) -->
  <div class="crumb" id="hinfo">
    <a href="#" onclick="DB.openList()">Propostas</a>
    <span class="sep">›</span>
    <span class="current" id="h-titulo">Novo Projeto</span>
    <span class="proj-id-chip" id="h-prop-id"></span>
    <!-- IDs preservados; classes novas -->
    <span class="tag tag-embrapii" id="h-modo">EMBRAPII</span>
    <span class="tag tag-elab" id="h-prop-status"></span>
    <span class="tag" id="h-empresa" style="display:none"></span>
  </div>

  <div class="hdr-spacer" style="flex:1"></div>

  <!-- Command palette trigger (novo, opcional) -->
  <div class="cmd-trigger">⌘K Buscar</div>

  <!-- Actions cluster — TODOS botões mantêm onclick + id originais -->
  <div class="hacts hdr-actions">
    <button class="icon-btn" id="btn-users" onclick="UMGR.open()" title="Usuários">[users svg]</button>
    <button class="icon-btn" id="btn-dashboard" onclick="DASHBOARD.open()" title="Painel">[dashboard svg]</button>
    <button class="icon-btn" id="btn-add-team" onclick="ADDTEAM.open()" title="Add Equipe">[plus-team svg]</button>
    <button class="btn btn-secondary btn-sm" onclick="NOVA.open()">Nova proposta</button>
    <button class="btn btn-ghost btn-sm" onclick="DB.openList()">Propostas</button>
    <button class="btn btn-ghost btn-sm" onclick="REG.open()">Regramentos</button>
    <button class="btn btn-gold btn-sm" id="btn-exp" onclick="EXPORT.run()" disabled>
      [download svg] Exportar
    </button>
  </div>

  <!-- User chip → avatar -->
  <div class="huser hdr-user" id="huser-chip" style="display:none">
    <div class="avatar avatar-sm" id="huser-avatar">A</div>
    <!-- IDs huser-name, huser-role permanecem; podem virar tooltip ou dropdown -->
    <span id="huser-name" style="display:none"></span>
    <span id="huser-role" style="display:none"></span>
    <button class="huser-switch" onclick="AUTH.switchUser()">↻</button>
  </div>
</header>
```

**Regras:**
- Use o `tag-{fomento}` correspondente em `#h-modo` (já mapeado em `DATA.modes` no JS — você muda só a classe CSS aplicada, não o conteúdo).
- Use `tag-{status}` em `#h-prop-status` baseado no `STATE.proposal.workflow.status`.
- Botões `icon-btn` para ações secundárias (Usuários, Painel, Add Equipe), botões com texto para ações de navegação (Nova, Propostas, Regramentos), botão `btn-gold` para CTA primário (Exportar).

### 2.2. Sub-header / Title bar (acima do workspace)

Novo componente — adicionar entre `</header>` e `<div id="workspace">`.
Substitui visualmente os chips de proposta dispersos do header antigo.

Ver `screens/C-premium.html` linhas 161-190.

```html
<div class="title-bar" id="title-bar" style="display:none"> <!-- só quando há proposta aberta -->
  <div class="left">
    <div class="title-eyebrow">
      <span class="dot"></span>
      <span id="tb-status-text">Em elaboração</span> · revisão <span id="tb-rev">3</span> · <span id="tb-updated">12s atrás</span>
    </div>
    <h1 class="t-h1" id="tb-title">[título da proposta]</h1>
    <div class="title-meta">
      <span><b id="tb-empresa">Petrobras</b> · <span id="tb-tipo">contrato firme</span></span>
      <span class="pip"></span>
      <span id="tb-fomento">EMBRAPII · subvenção 50%</span>
      <span class="pip"></span>
      <span id="tb-prazo">18 meses</span>
      <span class="pip"></span>
      <span id="tb-equipe"></span>
      <span class="pip"></span>
      <span>Líder: <b id="tb-lider"></b></span>
    </div>
  </div>
  <div class="title-actions" id="tb-actions">
    <!-- botões de workflow renderizados dinamicamente por workflow logic existente -->
  </div>
</div>
```

Esta title-bar deve ser populada pelo mesmo código que hoje atualiza `#h-titulo`, `#h-empresa`, `#h-modo`, `#h-prop`. Você pode duplicar (atualizar ambos com a mesma info) ou refatorar uma função `updateProjectHeader()` que escreve em ambos.

### 2.3. Workspace (`#workspace`)

Layout permanece `flex: main-col + aside`. Ajustes:
- `#main-col` → padding `22px 28px 12px`, fundo `--bg`.
- `#aside` → 380px (era 292), fundo `--paper`, border-left hairline.

### 2.4. Seções de rubricas (`.section`)

Hoje cada seção (`#sec-ptec`, `#sec-padm`, etc.) é um card com header colapsável + body com lista de items + botão "Adicionar".

**Novo tratamento — "ledger row":** ver `screens/C-premium.html` linhas 327-354 e CSS `.section`, `.sec-hdr`, `.sec-num`, `.sec-title`, `.sec-spark`, `.sec-pct`, `.sec-total`.

```html
<div class="section open" id="sec-ptec">
  <div class="sec-hdr" onclick="UI.toggle('sec-ptec')">
    <span class="sec-num">01</span>                                    <!-- numerar 01..08 -->
    <div class="sec-title-wrap">
      <span class="sec-title">Pessoal técnico</span>
      <span class="sec-sub">5 pesquisadores · 2,35 FTE/mês · 18 meses</span> <!-- preencher via render() -->
    </div>
    <span class="sec-status warn" id="sdot-ptec" style="display:none">  <!-- ID preservado -->
      <span class="dot"></span><span class="sec-status-text">2 avisos</span>
    </span>
    <svg class="sec-spark" viewBox="0 0 64 18">…</svg>                  <!-- opcional: distribuição mensal -->
    <span class="sec-pct" id="pct-ptec">64,8%</span>                    <!-- novo ID, % do total -->
    <span class="sec-total t-num" id="tot-ptec">                        <!-- ID preservado -->
      <span class="currency">R$</span>0
    </span>
    <svg class="icn sec-toggle" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
  </div>
  <div class="sec-body">
    <div id="list-ptec"></div>                                          <!-- ID preservado -->
    <button class="btn btn-link btn-sm" onclick="PTEC.add()">
      <svg class="icn icn-sm">[plus]</svg> Adicionar pesquisador
    </button>
  </div>
</div>
```

**Replicar para todas as 8 rubricas** (mesma estrutura, mesmos IDs `sec-{rubrica}`, `cnt-{rubrica}`, `tot-{rubrica}`, `sdot-{rubrica}`, `list-{rubrica}`):

| # | ID | Nome | Módulo |
|---|---|---|---|
| 01 | `sec-ptec` | Pessoal técnico | `PTEC` |
| 02 | `sec-padm` | Pessoal administrativo & gestão | `PADM` |
| 03 | `sec-viag` | Viagens, passagens & diárias | `VIAG` |
| 04 | `sec-soft` | Software | `SOFT` |
| 05 | `sec-equip` | Uso de equipamentos | `EQUIP` |
| 06 | `sec-cons` | Material de consumo | `CONS` |
| 07 | `sec-serv` | Serviços de terceiros | `SERV` |
| 08 | `sec-matp` | Materiais permanentes | `MATP` |

**Status pill da seção** (`#sdot-{rubrica}`):
- 0 erros / 0 avisos → não exibe
- N erros → `tag-err` "N erro(s)"
- N avisos → `tag-warn` "N aviso(s)"
- Mix → mostra a mais grave primeiro

### 2.5. Items dentro das seções

Cada módulo (`PTEC.render`, `VIAG.render`, etc.) renderiza seus items dentro de `#list-{rubrica}`. **Você pode mudar o markup gerado** desde que o JS continue achando inputs por ID.

#### 2.5.1. Pessoal técnico (`PTEC`) — tabela ledger
Ver `screens/C-premium.html` linhas 357-419 e CSS `.ledger`, `.l-name`, `.l-num`, `.l-fte`, `.l-tag`, `.tfoot`.

```html
<table class="ledger">
  <thead><tr>
    <th>Pesquisador</th>
    <th>Categoria</th>
    <th class="r">FTE/mês</th>
    <th class="r">Salário base</th>
    <th class="r">Encargos</th>
    <th class="r">Total proposta</th>
  </tr></thead>
  <tbody>
    <!-- por item PTEC: -->
    <tr data-item-id="…">
      <td>
        <div class="l-name">
          <b>{nome}</b>
          <span>{cargo} · {sub-equipe} · {email}</span>
        </div>
      </td>
      <td><span class="tag-mono">EMBRAPII</span></td>
      <td>
        <div class="l-fte {over-class-if-fte>limit}">
          <div class="l-fte-bar"><div style="width:{pct}%"></div></div>
          {fte}
        </div>
      </td>
      <td class="l-num muted">R$ {sal}</td>
      <td class="l-num muted">R$ {enc}</td>
      <td class="l-num tot">R$ {tot}</td>
    </tr>
  </tbody>
  <tfoot class="tfoot"><tr>
    <td colspan="2" class="tfoot-lbl">Subtotal · pessoal técnico</td>
    <td class="l-num">{ftetotal}</td>
    <td></td>
    <td class="l-num muted">R$ {encsoma}</td>
    <td class="l-num tot">R$ {total}</td>
  </tr></tfoot>
</table>
```

**Modo edição:** linhas viram editáveis com inputs `.input-borderless` (sem borda até hover). **Mantenha os mesmos atributos** (`onchange`, `id`, `data-*`) que o `PTEC.render` atual gera; só envolva em `<td>` e aplique classes.

**FTE bar visual:** se `fte > limite`, aplicar `.over` para virar âmbar.

#### 2.5.2. Viagens (`VIAG`) — linhas ledger
Ver `screens/C-premium.html` linhas 449-491 e CSS `.viag-row`, `.viag-route`, `.viag-title`, `.viag-meta`, `.viag-days`, `.viag-tot`.

#### 2.5.3. Software, Equipamentos, Consumo, Serviços, Mat. Permanente
Mesma lógica: tabela ledger ou linhas ledger. Aplicar a mesma estética. Cada uma com 4-6 colunas relevantes.
- **Equipamentos:** Equipamento | Categoria | Custo-hora | Horas | Total
- **Consumo:** Item | Quantidade | Valor unit. | Cotação | Total
- **Serviços:** Serviço | Tipo (PJ/PF) | Categoria | Valor | Origem
- **Software:** Licença | Tipo | Período | Valor

### 2.6. Sidebar (`#aside`) — Resumo financeiro

Ver `screens/C-premium.html` linhas 533-620 e CSS `.aside`, `.aside-hdr`, `.hero-kpi`, `.hero-num`, `.chart-block`, `.bar-row`, `.stack`, `.kpi-grid`.

**Estrutura nova** (preservar `#resume` e qualquer ID que `renderResume()` use; *envolva* a estrutura nova em torno deles):

1. **Header** — eyebrow "Resumo financeiro · {fomento}" + h2 "Visão consolidada"
2. **Hero KPI** — Valor total (Fraunces 44px) + delta vs versão anterior + sparkline
3. **Distribuição por rubrica** — bar chart horizontal (top 7 rubricas), top 1 em ouro, resto em ink
4. **Origem dos recursos** — stacked bar (EMBRAPII / Empresa / Contrapartida) + legenda detalhada
5. **Indicadores** — grid 2×2 de KPI cards (Custo/FTE-mês, Bens de capital, BDI/indireto, TRL)

**Importante:** o JS atual chama `renderResume()` que escreve no DOM da sidebar. Refatore essa função para emitir o markup novo, **mantendo qualquer cálculo** (números vêm de `CALC.calcAll(STATE)`).

### 2.7. Barra de validação (rodapé)

Ver `screens/C-premium.html` linhas 622-642 e CSS `.val-bar`, `.val-count`, `.val-chip`.

**Antes:** rodapé branco/cinza com chips coloridos misturados.

**Depois:** **rodapé preto** (fundo `--ink`) com:
- Eyebrow "Validações" (Fraunces italic)
- Counts pill: `1 erro` (vermelho), `2 avisos` (âmbar), `14 ok` (verde) — com fundos sutis sobre preto
- Chips clicáveis com bullet de severidade — clicar deveria scroll-to o item correspondente (lógica existente; preservar `onclick`)
- Indicador "Validação ativa · 12s" com pulso verde à direita

**Quando expandida:** vira drawer subindo de baixo (200px de altura), agrupando por severidade > rubrica. Cada validação é um link clicável com seção/item destacado.

```html
<div class="val-bar" id="valbar">
  <span class="val-title">Validações</span>
  <div class="val-counts">
    <span class="val-count err"><b id="val-cnt-err">0</b> erros</span>
    <span class="val-count warn"><b id="val-cnt-warn">0</b> avisos</span>
    <span class="val-count ok"><b id="val-cnt-ok">0</b> ok</span>
  </div>
  <div class="val-chips" id="val-content">
    <!-- preenchido por VAL.render() — preservar lógica -->
  </div>
  <div class="val-time"><span class="val-pulse"></span>Validação ativa · <span id="val-time">agora</span></div>
  <button class="icon-btn" id="val-toggle" onclick="UI.toggleValBar()">[chevron-up]</button>
</div>
```

---

## 3. SISTEMA DE DIFF (REVISÃO) — NOVO

Quando uma proposta está em `status=em_revisao`, a tela mostra **base vs revisada** lado a lado. Hoje o módulo `REVISION` calcula os diffs; visualmente está fraco. Aplicar este sistema:

### 3.1. Modo de visualização "diff"

Quando `STATE.proposal.workflow.status === 'em_revisao'` E há `STATE.proposal.revision_base`:
- Banner sticky no topo do main-col: `tag-revis` + texto "Comparando com revisão anterior · v2 → v3" + botão "Ocultar diffs"
- Cada `tot-{rubrica}` mostra o número novo + deltinha colorido abaixo (`+R$ 12.400 · +1,8%` em verde ou vermelho)
- Cada item tem `diff-marker` à esquerda (3px de cor):
  - verde se foi adicionado
  - vermelho se foi removido (mostra com texto riscado)
  - púrpura se foi alterado
- Para campos numéricos alterados, usar `.diff-arrow`:
  ```
  R$ 12.400 → R$ 14.800   +R$ 2.400
  ```
  (from riscado cinza, to ink, delta verde/vermelho)

### 3.2. Tabela de diff

Para revisão completa (modal "Ver alterações"), tabela:
| Rubrica | Item | Campo | Antes | Depois | Δ |
|---|---|---|---|---|---|
| Pessoal Técnico | Ana C. Dias | Horas | 800 | 960 | +160 (+20%) |
| Viagens | RJ→MAC | Diária | R$ 1.000 | R$ 1.200 | +R$ 200 |
| Equipamentos | (novo) | — | — | Cromatógrafo… | + adicionado |

Use `.diff-add`, `.diff-rem`, `.diff-mod` como background na linha. Use `.diff-arrow` na coluna de comparação.

### 3.3. Cores
- **`--diff-add`** (verde) — campo/item adicionado OU valor aumentou
- **`--diff-rem`** (vermelho) — item removido OU valor diminuiu (line-through quando texto)
- **`--diff-mod`** (púrpura) — campo modificado sem +/- semântico (ex.: trocou nome, troca de cargo)

### 3.4. Onde aplicar
- Tela de proposta inteira (quando em revisão)
- Tela de aprovação (próxima seção) — sempre mostra diffs
- Histórico de revisões (modal/tela) — viewer paginado das versões

---

## 4. MODAIS — REDESIGN

Consolidar os 10+ modais em **4 tamanhos padrão** usando `c-system.css`:

| Tamanho | Largura | Uso |
|---|---|---|
| `.modal-sm` | 480px | Confirmações, auth simples |
| `.modal-md` | 640px | Save, Nova proposta, Configuração |
| `.modal-lg` | 880px | Lista de propostas (DB), Painel, Audit |
| `.modal-xl` | 1120px | Regramentos, Merge DBs, Diff completo |

**Estrutura unificada (todos os modais):**
```html
<div class="modal-overlay" id="{modal-id}" style="display:none">
  <div class="modal-box modal-{size}">
    <div class="modal-hdr">
      <div>
        <div class="modal-eyebrow">{categoria}</div>
        <div class="modal-title">{título}</div>
      </div>
      <div style="flex:1"></div>
      <button class="icon-btn" onclick="…closeModal…"><svg>[x]</svg></button>
    </div>
    <div class="modal-body">…</div>
    <div class="modal-foot">
      <div class="left">{botões secundários, hint, status}</div>
      <button class="btn btn-secondary" onclick="…">Cancelar</button>
      <button class="btn btn-primary" onclick="…">Confirmar</button>
    </div>
  </div>
</div>
```

### 4.1. Lista de Propostas (`#db-modal`) → `modal-lg`

**Antes:** modal cheio de filtros + listagem cinza-claro.
**Depois:**
- Header: eyebrow "Banco de propostas", título "Propostas"
- Toolbar: search (input com prefix de lupa) + 2 selects (status, fomento) + tags ativas + botões "Nova", "Carregar DB", "Backup", "Mesclar"
- Stat bar (5 cards horizontais — total, em elaboração, aguardando, aprovado, R$ total) com `.kpi-card` mini
- Lista: cada proposta como linha grid. Estrutura:
  - Avatar do líder · ID mono · Título serif · Empresa muted · `tag-{status}` · `tag-{fomento}` · Valor mono à direita · ações (abrir, duplicar, ⋯)
  - Hover revela linha de divisor inteira em `.paper-2`
- Empty state: ícone outline + título serif "Nenhuma proposta encontrada" + sub
- Footer: contador "Mostrando X de Y" + paginação se >50

### 4.2. Nova Proposta (`#nova-modal`) → `modal-md` (multi-step opcional)

**Antes:** form único com cards de tipo de proposta + grid 2-col.
**Depois:** wizard de 2 etapas (ou tabs):

**Etapa 1 — Tipo:** 3 cards `.card-pad` selecionáveis:
- "Direta" (uma equipe — descrição)
- "Mãe" (consolida sub-equipes)
- "Sub-equipe" (vinculada a uma mãe)
Cards com border 2px transparent → ouro ao selecionar. Ícone serif italic decorativo no canto.

**Etapa 2 — Dados:** form 2-col com campos do `META`:
- Título (input full-width, font Fraunces no display após preencher)
- Empresa, Tipo de empresa
- Fomento (radio cards horizontais com `.tag-{fomento}` aplicado)
- Datas de início/fim, duração calculada
- ID gerado automaticamente (mono, readonly, "ISIB&F-2026-NNNN")

Botões footer: ← Voltar | Cancelar | Criar →

### 4.3. Configuração de Projeto (`#meta-modal`) → `modal-md`

Mesma estrutura da etapa 2 da Nova, mas em modo edição. Adicionar tabs internos: **Geral** | **Equipe** | **Workflow** | **Avançado**.

### 4.4. Confirmação (`#confirm-modal`) → `modal-sm`

Eyebrow categoria · título serif claro · texto explicativo · botões alinhados direita. Para destrutivo: `btn-danger` no confirmar + ícone alerta (`tag-err` no eyebrow).

### 4.5. Save (`#save-modal`) → `modal-md`

Tabs por destino: **Local (download)** | **DB compartilhado** | **Backup**. Cada um com explicação + botão claro. Mostrar hash/timestamp da última versão salva em mono.

### 4.6. Audit log (`#audit-modal`) → `modal-lg`

Lista cronológica de eventos (ação + rubrica + item + quem + quando + diff resumido). Sidebar de filtros (data, ação, usuário). Cada evento usa cores de diff (`add`, `rem`, `mod`).

### 4.7. Auth / Login modal (`#auth-modal`) → `modal-sm`

Já redesenhada na landing. Para o modal in-app, mesma estética compacta.

### 4.8. User Manager (`#umgr-modal`) → `modal-lg`

Tabela de usuários: Avatar · Nome · Email · Papel · Permissões · Última atividade · Ações. Linha clicável expande detalhes/edição inline.

### 4.9. Regramentos (`#reg-modal`) → `modal-xl`

Tabs por fomento (EMBRAPII, ANP, ANEEL, ANP/Petrobras) com cores próprias. Cada tab tem sub-seções (Pessoal e Encargos, Viagens, etc.) renderizadas a partir de `REG_DATA`. Estética de "manual editorial":
- Sidebar esquerda com índice (Fraunces 13px)
- Conteúdo: cada regra é uma linha com **título serif** + **descrição body** + **tag-{severity}** se for limite numérico
- Search no topo com `cmd+K`

### 4.10. Merge DBs (`#merge-modal`) → `modal-xl`

3 colunas: DB A (esquerda) · Diff/preview (centro) · DB B (direita). Cada item conflitante mostra `.diff-arrow`. Botões "Aceitar A", "Aceitar B", "Aceitar ambos" por item.

### 4.11. Painel (Dashboard / `#dashboard-modal`) → `modal-xl` ou tela cheia

Tabs: **Aprovação** | **Histórico** | **Indicadores**.
- **Aprovação:** lista de propostas pendentes com diff resumido inline. Cada uma tem botões "Aprovar", "Solicitar revisão", "Reprovar". Clicar abre split-view (proposta vs alterações da revisão).
- **Histórico:** timeline editorial das ações (quem fez o quê, quando) com filtros por proposta/usuário.
- **Indicadores:** gráficos agregados (R$ total em pipeline, propostas por status, distribuição por fomento, tempo médio de aprovação).

### 4.12. Add Team (`#addteam-modal`) → `modal-md`

Form para vincular nova sub-equipe a uma proposta-mãe: select de mãe + dados da equipe + permissões.

---

## 5. PAINEL MULTI-EQUIPE (modo "mãe")

Quando `STATE.proposal.tipo_proposta === 'mae'`:

- **Title-bar** mostra "Proposta Mãe · 4 sub-equipes" e tag `tag-info`
- **Team switcher** (`#team-switcher`) ganha tratamento de tabs editorial: cada equipe é um chip `.tag-mono` com indicador de status, valor e contagem de itens. Tab "Consolidado" sempre primeiro.
- **Quando "Consolidado":** sidebar mostra agregação de TODAS as equipes; main-col mostra cada rubrica com sub-rows por equipe (collapsible), totais em ouro.
- **Quando uma equipe específica:** comportamento normal de proposta.

---

## 6. ICONOGRAFIA — MAPEAMENTO EMOJI → SVG

Use ícones outline 1.6px estilo Lucide/Phosphor inline. Dimensões: 16×16 padrão (`.icn`), 13×13 (`.icn-sm`), 20×20 (`.icn-lg`). Tabela de mapeamento:

| Emoji atual | Onde aparece | SVG icon (Lucide/Phosphor name) |
|---|---|---|
| 🔬 | sec-ptec | `flask-conical` ou `microscope` |
| 📋 | sec-padm, btn-dashboard | `clipboard-list` |
| ✈️ | sec-viag | `plane` |
| 💻 | sec-soft | `monitor` |
| ⚗️ | sec-equip | `flask` |
| 🧪 | sec-cons | `test-tube` |
| 🔧 | sec-serv | `wrench` |
| 📦 | sec-matp | `package` |
| ⚙️ | meta config | `settings` |
| 👥 | btn-users | `users` |
| ➕ | btn-add-team | `user-plus` |
| ＋ | NOVA, add buttons | `plus` |
| 🗄 | DB.openList | `database` |
| 📖 | REG.open | `book-open` |
| ⬇ | btn-exp | `download` |
| 🔑 | login | `key` ou `log-in` |
| ✅ | confirmar/aprovado | `check` |
| 🔄 | revisão/reload | `refresh-cw` |
| 🏗 | multi-equipe | `building-2` |
| 📂 | carregar DB | `folder-open` |
| 💾 | backup/save | `save` |
| 🔀 | merge | `git-merge` |
| ✕ | fechar | `x` |
| 🔍 | buscar | `search` |
| 👁 | readonly banner | `eye` |
| 🎯 | TRL | `target` |
| ↻ | switch user | `repeat` ou rotate-cw |
| ↑↓ | sort | `arrow-up`/`arrow-down` |
| ▼ | collapse | `chevron-down` |
| ⋮⋯ | menu | `more-horizontal` |

**Não use emoji em lugar nenhum da UI nova.** Único uso aceitável é em texto inserido pelo usuário (notas de revisão, comentários).

---

## 7. ESTADOS

### 7.1. Read-only (`#readonly-banner`)
Banner sticky no topo do main-col, **fundo `--paper-2`**, border-left 3px ouro, ícone `eye` à esquerda + texto "Modo visualização — você não tem permissão para editar esta proposta ou seção." + link discreto "Solicitar acesso".

### 7.2. Aguardando aprovação
- Title-bar muda eyebrow para `tag-aprov` "Aguardando aprovação · enviado há 2h"
- Botões de edição desabilitados visualmente (cinza), mas inputs ainda lá (estado read-only)
- Workflow-bar (`#workflow-bar`) mostra ações disponíveis ao aprovador: "Aprovar", "Solicitar revisão" (`btn-warn` outline), "Reprovar" (`btn-danger`)

### 7.3. Em revisão
- Banner roxo no topo: "Em revisão · comparando v2 → v3 · 8 alterações" + toggle "Ver diffs" / "Ocultar diffs"
- Marcadores diff em items alterados/adicionados/removidos
- Workflow-bar com "Concluir revisão e enviar" (`btn-gold`) + "Descartar alterações"

### 7.4. Aprovado
- Title-bar com tag-aprovado "Aprovado · 12/jan/2026 por Carlos S."
- Tudo read-only com banner verde no topo
- Botão "Exportar" em destaque (já é `btn-gold`)

### 7.5. Validações
Estados visuais já cobertos:
- `tag-err` (vermelho) — bloqueia envio para aprovação
- `tag-warn` (âmbar) — não bloqueia, aparece na val-bar
- `tag-ok` (verde) — passou em todas

### 7.6. Loading / vazio
- Skeleton: blocos `--paper-2` com shimmer suave
- Empty state: usar `.empty` (ícone outline + título serif + sub + CTA)

---

## 8. RESPONSIVIDADE

A ferramenta é desktop-first (1440+ ideal). Limites mínimos:
- **≥1280px:** layout completo (main + aside 380px)
- **1024–1279px:** aside encolhe para 320px, oculta sparklines de seção
- **<1024px:** aside vira drawer overlay (botão "Resumo" no header). Avise com banner que <1024 é experiência reduzida — não otimizar pesadamente.

Não há requisito mobile.

---

## 9. ANIMAÇÕES & MICRO-INTERAÇÕES

- **Transições:** `all .12s ease` em hovers (botões, inputs, cards). `all .2s ease-out` em colapso de seção (animar `max-height`).
- **Modal entry:** fade `--shadow-modal` + scale 0.98→1 em 180ms ease-out.
- **Counter animation:** quando o total muda (após edit), animar de valor antigo → novo em 400ms (use `requestAnimationFrame` simples). Aplicar em `.hero-num`, `.sec-total`, `.l-num.tot`.
- **Pulse dot:** animação `c-pulse` 2s infinite em indicadores "ativo" (validação ativa, status em elaboração).
- **Toast:** slide-up + fade do canto inferior direito, 3s auto-dismiss. Cores: `tag-ok` / `tag-warn` / `tag-err` no border-left.

---

## 10. CHECKLIST DE IMPLEMENTAÇÃO

Ordem sugerida. Marque após cada passo testar smoke (carregar DB, abrir proposta, editar item, salvar):

- [ ] Copiar `screens/c-system.css` para um `<style>` no topo do v12, ou linkar como external. Substituir o `<style>` existente.
- [ ] Atualizar `<header id="hdr">` para nova estrutura (preservando IDs).
- [ ] Adicionar `.title-bar` entre header e workspace; popular com mesmos dados de `#hinfo`.
- [ ] Substituir emojis dos `section-icon` por SVG (mapa §6).
- [ ] Reescrever markup das `.section` para nova estrutura (sec-num, sec-title-wrap, sec-spark, sec-pct, etc.).
- [ ] Atualizar funções `*.render()` de cada rubrica para emitir markup ledger novo. Testar PTEC primeiro (mais complexo).
- [ ] Refatorar `renderResume()` para emitir nova sidebar (hero KPI + bar chart + stack + indicadores).
- [ ] Aplicar nova `.val-bar` preta no rodapé. Refatorar `VAL.render` para emitir chips novos.
- [ ] Para cada modal, substituir markup pela estrutura unificada `modal-hdr/body/foot`.
- [ ] Implementar sistema de diff visual quando `status === 'em_revisao'`.
- [ ] Implementar painel multi-equipe (team-switcher novo + modo consolidado).
- [ ] Substituir landing page por `screens/landing.html` (adaptar IDs do form para os usados pelo `LANDING` module).
- [ ] Smoke test completo: criar proposta → adicionar 5 itens em cada rubrica → enviar para aprovação → aprovador revisa → solicita revisão → elaborador faz mudança → vê diff → aprova → exporta XLSX.
- [ ] Test multi-equipe: criar mãe → 3 sub-equipes → consolidado → exportar.

---

## 11. ARMADILHAS COMUNS

1. **`getElementById` em IDs antigos.** Antes de remover qualquer `id="…"` do markup, faça grep no JS — provavelmente é referenciado.
2. **Strings de UI lidas pelo JS.** Alguns `if (textContent === '…')` podem existir. Faça grep por `textContent` e `innerText`.
3. **Inputs gerados com `onchange="MODULE.update(this, …)"`.** O `this` é o elemento — preserve onchange. Mude apenas wrapping.
4. **CSS `!important`.** O `<style id="__om-edit-overrides">` no fim do arquivo (se existir) tem regras `!important` salvas pelo editor. Remover apenas se obsoleto após redesign; senão, regras novas ganham especificidade.
5. **`box-shadow` inline.** Há vários elementos com shadow inline ad-hoc. Trocar por `var(--shadow-*)`.
6. **Cores hard-coded fora dos vars.** `#1e6fde`, `#0e7490`, `#5a1fb8`, `#fff8e6` aparecem dispersos. Substituir por tokens semânticos do system.
7. **Z-index dos modais.** Hoje variam (2500, 2000…). Padronizar: overlay backdrop = 2000, modal = 2001, toast acima = 2100, valbar drawer = 1500.

---

## 12. ENTREGÁVEIS ESPERADOS

Ao concluir, deve haver:
- `pse_v12_premium.html` — single-file aplicado e testado
- `c-system.css` — embutido no `<style>` ou linkado externo (recomendo embutir, mantendo o single-file deployment)
- README curto com lista de quebras conhecidas (se houver) e features que ficaram pendentes
- Sem regressão funcional vs v11

Em caso de dúvida sobre tratamento visual de algum componente não documentado, **assumir os padrões do `screens/c-system.css` e do protótipo `screens/C-premium.html`** como verdade. Quando ainda assim ambíguo, escolher: editorial sobre técnico, hairline sobre sombra, mono em números, serif em totais grandes, cor com semântica.

---

*Fim do handover. Boa implementação.*
