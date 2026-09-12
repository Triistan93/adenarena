# DIÁRIO DE BORDO & ENGENHARIA — 12 DE SETEMBRO DE 2026
## Lineage Idle / AdenArena — Consolidação de Arquitetura, UX e Hotfixes

> **Data de Referência**: 12/09/2026  
> **Repositório**: `D:\BROWSER\AdenArena` (GitHub: `origin/main`)  
> **Branch**: `main`  
> **Commits Realizados Hoje**:
> - `4d9f6af` — `feat(ux): Master Character & Inventory UX - Player Journey, Equipment, Enchantment, Resonance & Auto-Equip`
> - `7031776` — `fix(ux): resolve AFFIX_MAP reference error and enchant modal template literals evaluation`
> - `c472ce8` — `fix(enchant): resolve scroll recognition in backpack and live state synchronization`
>
> **Status de Qualidade**: 
> - **Testes Automatizados**: 65 testes nas 9 suítes canônicas passando (100% de aprovação, 0 falhas)
> - **Build de Produção**: Vite 7.3.6 compilado com sucesso (Código de saída 0, 232 módulos)

---

## 1. RESUMO EXECUTIVO DO DIA

Neste dia de desenvolvimento, o sistema de **Personagem e Mochila** do Lineage Idle foi transformado em um motor comercial de progressão contínua guiada, eliminando bloqueios históricos de usabilidade, descompassos de estado e inconsistências de encantamento.

### Principais Entregas:
1. **Motor Canônico de Encantamento (`EnchantmentService.js`)**:
   - Implementação da máquina de 8 estados canônicos (`IDLE` $\to$ `SELECTING_ITEM` $\to$ `READY` $\to$ `CONFIRMING` $\to$ `PROCESSING` $\to$ `SUCCESS` / `FAILURE` / `CRYSTALLIZED` / `PROTECTED`).
   - Bloqueio de consumo silencioso de scrolls: clicar em `Usar` abre o modal de encanto com o scroll e alvos válidos pré-selecionados.
   - Cálculo determinístico de chances (+0 $\to$ +1 com 100% no Safe Limit), deltas de atributos ($P.Atk$, $M.Atk$, $P.Def$, $M.Def$) e ganho real de Combat Power ($CP$).
   - Proteção de falha Blessed (preserva nível sem reduzir ou quebrar) e cristalização pós-limite seguro para scrolls normais.

2. **Auto-Equip Inteligente & ERS (`EquipmentService.js` + `ItemClassificationService.js`)**:
   - Algoritmo de Pontuação de Recomendação de Equipamento (ERS) multicritério considerando classe, tipo de armadura/arma, sinergia de sets e deltas estatísticos.
   - Proteção estrita contra itens inválidos: materiais, pergaminhos, poções e consumíveis recebem pontuação $-999.999$ e nunca são equipados.
   - Regra de Armas de Duas Mãos: equipar arcos ou armas 2H limpa compulsoriamente os slots `shield` e `weapon2`.

3. **Ressonância de Armas & Procs Táticos (`WeaponResonanceService.js`)**:
   - Taxonomia completa de 27 combinações de arma primária + secundária/escudo.
   - Congelamento da fórmula de Cleave do Comandante de Falange: Espada arma Fratura Tática $\to$ próxima Lança consome desferindo dano de Cleave:
     $$\text{CleaveDamage} = \lfloor \text{BaseSpearDamage} \times 1.45 \rfloor$$
   - Baseline de Defesa Física da Ressonância:
     $$\frac{\text{PDef}_{\text{com\_ressonancia}}}{\text{PDef}_{\text{sem\_ressonancia}}} = 1.20$$

4. **NextActionAdvisor (Inteligência de Próximo Passo)**:
   - Motor de orientação contextual com 5 níveis de prioridade:
     1. Auto-Equip (slot vazio com equipamento disponível)
     2. Upgrade de Equipamento (item superior na mochila)
     3. Oportunidade de Encantamento (scroll compatível com item equipado)
     4. Forja Imperial (materiais suficientes para craft)
     5. Power Milestone (meta de CP para desbloqueio de conteúdo com barra de progresso)
   - Cards visuais renderizados nas abas de Personagem e Mochila com botões de ação imediata.

5. **Hotfixes Críticos de Runtime e Dessincronização de Estado**:
   - Correção do `ReferenceError: AFFIX_MAP is not defined` no hover de itens.
   - Correção de interpolação de template string escapada (`\${` $\to$ `${`) no modal de encantamento.
   - Correção do `ReferenceError: closeInventoryPreviewModal is not defined` na inicialização do `main.js`.
   - Correção da dessincronização de `window.state` com `getState()` do `StateManager.js` que causava `0 tipos na mochila` ao abrir o modal de encantamento.
   - Reconhecimento completo de pergaminhos No-Grade (`NG`) e Universais (`ANY`) em `parseEnchantScroll` e compatibilidade com armas No-Grade como o `Hunting Bow`.

---

## 2. MAPA DE ARQUIVOS CRIADOS E ALTERADOS

| Arquivo | Status | Linhas | Descrição da Mudança |
| :--- | :--- | :--- | :--- |
| `lineage-idle/src/services/ItemClassificationService.js` | **NOVO** | +232 | Hierarquia formal de categorias de itens, validação de elegibilidade de equipamentos, decodificação de scrolls e compatibilidade atômica. |
| `lineage-idle/src/services/EnchantmentService.js` | **NOVO** | +402 | Motor do fluxo de encantamento, preview canônico, cálculo de limites seguros, cristalização, blessed e execução atômica. |
| `lineage-idle/src/services/NextActionAdvisor.js` | **NOVO** | +305 | Algoritmo heurístico de recomendação de próximos passos e renderizador de cards DOM reativos. |
| `lineage-idle/src/services/WeaponResonanceService.js` | **MODIFICADO** | +131 | Expansão para 27 pares, ciclo de vida de estados da ressonância, armação de Fratura Tática e bônus de P.Def $1.20\times$. |
| `lineage-idle/src/engine/StatsEngine.js` | **MODIFICADO** | +16 | Injeção dos multiplicadores de atributos oriundos da ressonância de armas em `getStats()`. |
| `lineage-idle/src/services/EquipmentService.js` | **MODIFICADO** | +81 | Implementação do ERS multicritério, limpeza automática de offhand para armas 2H e aplicação definitiva de loadouts. |
| `lineage-idle/src/ui/GameUI.js` | **MODIFICADO** | +382 | Modal canônico `#enchant-flow-modal`, consumo do estado vivo via `getState()`, botões de encanto no dock e tooltip, fallback direto para `ALL_ITEMS`. |
| `src/idle/markup.ts` | **MODIFICADO** | +21 | Marcação estrutural do `#enchant-flow-modal`, container `#next-action-advisor-inv` e `#next-action-advisor-char`. |
| `lineage-idle/main.js` | **MODIFICADO** | +173 | Interceptação de scrolls em `useItem()`, sincronização viva de `window.state` via getter e `EventBus`, correção de import de modal. |
| `test/auto-equip-integrity.test.js` | **NOVO** | +146 | Validação do pipeline de auto-equip, cálculo de ERS e segurança de offhand. |
| `test/enchantment-runtime-validation.test.js` | **NOVO** | +199 | Validação de decodificação de scrolls, prévia, cálculo de chances, consumo atômico e cristalização. |
| `test/next-action-advisor-validation.test.js` | **NOVO** | +85 | Validação dos 5 níveis de prioridade do advisor e cálculo de CP remaining. |
| `test/player-journey-validation.test.js` | **NOVO** | +221 | Teste de ponta a ponta da jornada do jogador: Lv.1 $\to$ Auto-Equip $\to$ Enchant $\to$ Ressonância $\to$ Forja. |
| `test/resonance-runtime-validation.test.js` | **NOVO** | +129 | Validação dos 27 pares, Cleave $+45\%$ e baseline de Defesa Física $+20\%$. |

---

## 3. OS TRÊS CONTRATOS CANÔNICOS IMPLEMENTADOS

### Contrato 1: Encantamento Canônico
$$\text{Scroll} \longrightarrow \text{Modal} \longrightarrow \text{Target} \longrightarrow \text{Preview} \longrightarrow \text{Atomic Enchant} \longrightarrow \text{Stats} \longrightarrow CP$$
1. **Nenhum scroll é consumido às cegas**: Clicar em `Usar` ou em `✨ Encantar` na mochila intercepta o item e abre o modal.
2. **Seleção e Filtro Automático**: Apenas equipamentos elegíveis e compatíveis em grau e tipo aparecem na lista de alvos.
3. **Prévia Fiel**: Mostra a chance exata (ex: 100% até o Safe Limit), deltas de stats (+P.Atk/+P.Def), ganho de CP e aviso visual de risco (Seguro / Blessed / Risco de Cristalização).
4. **Transação Atômica**: O scroll só é deduzido após a confirmação e a atualização de atributos e CP é disparada imediatamente.

### Contrato 2: Auto-Equip com ERS e Segurança de Candidatos
$$\text{Equipamento} \longrightarrow \text{Compatibilidade} \longrightarrow \text{Auto-Equip} \longrightarrow \text{Stats} \longrightarrow CP$$
1. **Filtro Estrito**: Itens que não sejam equipamentos elegíveis recebem pontuação ERS de $-999.999$.
2. **Armas de 2 Mãos**: Equipar um Arco ou Espada 2H desequipa imediatamente o escudo e a arma secundária.
3. **Compromisso Atômico**: `commitAutoEquipProposal` persiste os slots, atualiza status `equipped` nos itens e recalcula HP/MP e CP.

### Contrato 3: Ressonância de Armas & Procs Táticos
$$\text{Combinação de Armas} \longrightarrow \text{Estado de Ressonância} \longrightarrow \text{Gatilho/Passiva} \longrightarrow \text{Efeito em Combate} \longrightarrow \text{Feedback Visual}$$
1. **Taxonomia**: 27 pares documentados e categorizados.
2. **Ciclo de Estados**: `INACTIVE` $\to$ `READY` $\to$ `ACTIVE` $\to$ `ARMED` $\to$ `COOLDOWN`.
3. **Comandante de Falange**: Golpe de Espada ativa Fratura Tática; o próximo golpe de Lança executa Cleave amplificado em $+45\%$ com efeito de float text distintivo.
4. **Defesa Física**: Aplica bônus multiplicador passivo de $1.20\times$ em `getStats()`.

---

## 4. GUIA DE SOLUÇÃO DE PROBLEMAS (POST-MORTEM DOS BUGS RESOLVIDOS)

Caso você encontre sintomas similares em outra máquina, consulte as soluções documentadas abaixo:

### Bug A: `ReferenceError: AFFIX_MAP is not defined`
- **Sintoma**: Ao passar o mouse sobre itens com afixos na mochila, o jogo lançava ReferenceError no console.
- **Causa**: `AFFIX_MAP` não estava importado no topo de `GameUI.js`.
- **Correção**: Importado `AFFIX_MAP` de `../../data/affixes.js` e adicionado fallback de segurança:
  ```javascript
  const affDef = (typeof AFFIX_MAP !== 'undefined' ? AFFIX_MAP[a.id] : null) || (gData?.AFFIX_MAP || {})[a.id];
  ```

### Bug B: Strings literais não interpoladas no modal de encanto
- **Sintoma**: O modal exibia `\${scrolls.length}` em vez de avaliar o número de pergaminhos.
- **Causa**: A template string no arquivo continha barras invertidas de escape antes das interpolações.
- **Correção**: Removidas todas as ocorrências de `\${` para `${`.

### Bug C: `ReferenceError: closeInventoryPreviewModal is not defined`
- **Sintoma**: `main.js:8886` falhava silenciosamente durante o `init()`, impedindo a criação de `window._callbacks`.
- **Causa**: Função exportada em `GameUI.js`, mas esquecida na lista de importação do `main.js`.
- **Correção**: Adicionada `closeInventoryPreviewModal` aos imports de `./src/ui/GameUI.js` em `main.js`.

### Bug D: `0 tipos na mochila` / `❌ Nenhum pergaminho encontrado`
- **Sintoma**: Jogador possuía 8x *Scroll Of Enchant Weapon* na mochila, mas o modal abria vazio.
- **Causa Raiz**: O `StateManager.js` carrega o save em um novo objeto `currentState`. O `main.js` continha uma referência inicial a `DEFAULT_STATE` (vazia) capturada antes do `loadState()`. O método `window.openEnchantModalWithScroll` passava `window.state`, que apontava para o objeto antigo com `inventory: []`.
- **Correção**: 
  1. `GameUI.js` agora importa `getState` de `StateManager.js` e garante que `openEnchantFlowModal` sempre leia o estado vivo do jogador.
  2. `main.js` agora expõe `window.state` como um *getter* reativo (`get: () => getState()`) mantido sincronizado pelo `EventBus`.
  3. `parseEnchantScroll` foi aprimorado para reconhecer tanto o ID quanto o nome de pergaminhos universais e No-Grade, garantindo compatibilidade com armas No-Grade como o `Hunting Bow`.
  4. O botão do `NextActionAdvisor` foi conectado diretamente para passar `targetUid` e `scrollUid` simultaneamente.

---

## 5. COMO RODAR O PROJETO EM UMA NOVA MÁQUINA

Para clonar e rodar o projeto em outro computador:

### 1. Clonar o repositório
```bash
git clone https://github.com/Triistan93/adenarena.git
cd adenarena
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Rodar os testes de validação canônica
Execute as suítes essenciais de integridade:
```bash
node --test test/auto-equip-integrity.test.js test/enchantment-runtime-validation.test.js test/next-action-advisor-validation.test.js test/player-journey-validation.test.js test/resonance-runtime-validation.test.js test/inventory-commercial-validation.test.js test/character-hero-pillar-validation.test.js test/character-tab-commercial-validation.test.js test/inventory-hero-pillar-validation.test.js
```
*Resultado esperado: 65/65 testes aprovados em < 1 segundo.*

### 4. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
O jogo estará acessível em `http://localhost:5173`.

### 5. Compilar o build de produção
```bash
npm run build
```
*Resultado esperado: Build Vite finalizado sem erros em ~15–25s.*

---

## 6. ESTRUTURA DO SAVE DO JOGADOR (`localStorage`)

Caso seja necessário depurar ou inspecionar o estado do jogo no console do navegador:
- **Chave primária**: `localStorage.getItem('lineageIdleSave_v2')`
- **Chave de backup**: `localStorage.getItem('lineageIdleSave_v2_backup')`
- **Acesso direto no console**:
  ```javascript
  // Ver inventário atual
  window.state.inventory;

  // Testar abertura do modal de encantamento
  window.openEnchantFlowModal();

  // Obter recomendação atual do Advisor
  NextActionAdvisor.getAdvice(window.state);
  ```

---

## 7. BACKLOG & PRÓXIMOS PASSOS SUGERIDOS

1. **Efeitos Visuais e SFX no Encantamento**:
   - Adicionar partículas visuais dedicadas ou som de sucesso/falha do Lineage 2 clássico no disparo do `executeAtomicEnchant`.
2. **Expansão de Ressonâncias Secundárias**:
   - Ampliar o feedback visual na tela de batalha quando outros pares de ressonância além de Espada+Lança estiverem armados (ex: Adaga+Arco, Cajado+Sigil).
3. **Presets de Equipamento**:
   - Adicionar suporte a abas de loadouts predefinidos (PvE Farm / PvP / Boss) integrados com o pipeline do ERS.
