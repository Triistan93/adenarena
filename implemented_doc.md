# 📜 Aden Arena — Documento de Funcionalidades Implementadas (`implemented_doc.md`)

Este documento compila a lista completa de todos os sistemas, mecânicas, zonas, chefes, sistemas de progressão, segurança e integração de banco de dados implementados no **Aden Arena**.

---

## 🎮 1. Motores de Jogo & Modos de Batalha

- **📜 Idle Chronicle (RPG de Texto e Cartas Autônomo)**:
  - Sistema de combate automático baseado em ticks de relógio.
  - Leitura de estatísticas em tempo real: HP, MP, ATK, DEF, MATK, MDEF, EVA, Taxa Crítica, Boost de XP/Gold, Lifesteal e Regen.
  - **Transição de Fundo de Zona (Crossfade Real)**: Duas camadas de fundo sobrepostas (`#stage-bg-a` e `#stage-bg-b`) com transição suave de opacidade em `0.4s` ao trocar de zona ou entrar em Raid Boss.
  - **Juice de Combate & Efeitos Confortáveis**:
    - Animação elástica squash/stretch no ataque do herói (`#stage-hero.lunge`).
    - Trepidação suave do personagem ao levar dano (`#stage-hero.hurt`).
    - Efeito visual de dissolução/desvanecimento no monstro derrotado (`#stage-monster.is-dying`).
    - **Zero Flashes Brancos**: Remoção completa de flashes de tela que incomodavam a visão.
  - **🔥 Contador de Combo / Kill Streak**:
    - Rastreamento de abates consecutivos com aviso flutuante de marcos a cada 5 abates (`🔥 STREAK x10!`).

---

## 🧭 2. Recursos de Interface (UI/UX) & Qualidade de Vida (QoL)

- **🔍 Comparação Direta de Atributos no Tooltip (Delta vs Equipado)**:
  - Ao passar o mouse ou tocar em qualquer equipamento no inventário, o tooltip exibe a seção **VS EQUIPPED** destacando em verde (`+15 ATK`) ou vermelho (`-5 DEF`) a diferença de atributos contra o item equipado no mesmo slot.
- **🔍 Caixa de Busca por Nome no Inventário**:
  - Campo de busca instantânea (`🔍 Buscar...`) na sub-barra do inventário para filtrar itens por nome em tempo real.
- **✨ Anel de Brilho de Raridade (Rim-Light Glow)**:
  - Iluminação de borda e sombra externa exclusiva para cada raridade de item nos slots (`Raro`, `Épico`, `Lendário`, `Mítico`, `S-Grade`).
- **🔴 Badges de Notificação Dinâmicos nas Abas (`.tab-badge`)**:
  - Badges pulsantes em vermelho indicando upgrades disponíveis no Inventário, SP para distribuir em Habilidades, receitas para criar na Forja e recompensas de Missões a resgatar.
- **📦 Auto-Venda Inteligente por Raridade**:
  - Seletor visual no inventário (`Desativado`, `≤ Comum`, `≤ Incomum`, `≤ Raro`) com salvamento no estado e venda automática na nuvem.
- **🛡️ Confirmação ao Vender/Sucatear Itens Valiosos**:
  - Diálogo de proteção para vendas ou sucateamentos individuais e em lote de itens de raridade `Rare`, `Epic`, `Legendary`, `Mythic` e `S-Grade`.
- **⌨️ Atalhos Globais de Teclado**:
  - Teclas `1–9`: Troca instantânea entre as abas principais.
  - Tecla `Espaço`: Alternador rápido de velocidade de combate (`1x`, `2x`, `4x`).
  - Tecla `S` / `Ctrl+S`: Salvamento instantâneo do jogo.
- **🔄 Persistência de Scroll entre Abas**:
  - Posições de navegação em listas longas mantidas ao alternar entre abas.

---

## 🧙‍♂️ 3. Raças, Classes & Subclasses

- **6 Raças Jogáveis**: Humano, Elfo, Elfo Negro, Orc, Anão e Kamael.
- **Mais de 18 Classes Especiais**:
  - *Fighters*: Paladin, Warlord, Treasure Hunter, Berserker, Tyrant, Fortune Seeker, etc.
  - *Mages*: Sorcerer, Spellhowler, Necromancer, Spellsinger, Male Soulbreaker, etc.
- **Árvore de Habilidades (Skill Tree)**:
  - Dezenas de habilidades ativas e passivas exclusivas para cada classe (ex: *Mortal Blow*, *Power Smash*, *Prominence*, *Death Spike*, *Hurricane*, *Frenzy*, *War Cry*).
  - Custo em SP com escalonamento por nível.
- **Sistema de Subclasses & Certificações**:
  - Possibilidade de adicionar até 3 subclasses ao mesmo personagem.
  - **Certificados de Subclasse**: Bônus passivos permanentes de HP, ATK, DEF e Crit acumuláveis para a classe principal.

---

## 🗺️ 4. Zonas de Caça, Sagas & Chefes de Raid Mundiais

- **Sagas de Progressão (Sagas I, II e III)**:
  - *Talking Island* (Lv 1-15), *Elven Ruins* (Lv 15-30), *Ant Nest* (Lv 30-45), *Cruma Tower* (Lv 45-60), *Dragon Valley* (Lv 60-75), *Tower of Insolence* (Lv 75-85), *Imperial Tomb* (Lv 85-90), *Antharas' Lair* (Lv 90-95), *Forge of the Gods* (Lv 95-100).
- **Chefes Globais (World Bosses)**:
  - **Queen Ant** (Lv 40), **Zaken** (Lv 60), **Baium** (Lv 80), **Antharas** (Lv 95), **Valakas** (Lv 100).

---

## 🏰 5. Torre da Insolência (End-Game Tower of Insolence)

- **Desafio de 100 Andares**: Monstruosidades e Guardiões de Torre com escalonamento de vida e dano.
- **Bônus Passivo Multiplicativo**: +1% de ATK, DEF, MATK e MDEF por andar conquistado.
- **Varredura Diária (Sweep)**: `sweepTowerDaily()` concedendo 50% de recompensas diárias para todos os andares desbloqueados.

---

## 📜 6. Missões, Diárias/Semanais & Passe de Batalha

- Resetação automática a cada 24 horas (Diárias) e 7 dias (Semanais).
- Passe de Batalha (Trilha Gratuita e Trilha Premium) com XP progressivo.

---

## 🛡️ 7. Equipamentos, Crafting Avançado & Magic Dolls

- Equips S-Grade (Imperial Crusader, Draconic, Major Arcana) e Armas Épicas.
- Crafting de receitas, Roda de Craft Aleatório e Sintetização 2:1 de Agathions (Dolls).

---

## ☁️ 8. Autenticação, Banco NoSQL & Cloud Save (Firebase)

- **Firebase Auth** (E-mail/Senha + Marca Oficial Google OAuth 4 cores).
- **Firestore Database** (`users/{userId}`).
- **Portal de Login Inicial** (`LoginScreen.tsx`).
- **Auto-Save Triplo Resiliente**:
  - Salvamento local a cada 10 segundos + ao fechar/ocultar a aba (`beforeunload`).
  - Sincronização automática em segundo plano na nuvem Firebase a cada 15 segundos.

---

## 👑 9. Sistema de Privilégios & Segurança GM

- Nível `0` (Jogador Normal) vs Nível `1` (Administrador GM).
- Controle de Autorização Servidor/Banco direto na raiz do Firestore (`users/{userId}` ➔ `privilegeLevel: 1`).
- Sanitização de salvamento sem aceitação de elevação de privilégio vinda do cliente.

---

*Documento gerado e sincronizado com o repositório oficial do Aden Arena.*
