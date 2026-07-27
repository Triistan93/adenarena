# 📜 Aden Arena — Documento de Funcionalidades Implementadas (`implemented_doc.md`)

Este documento compila a lista completa de todos os sistemas, mecânicas, zonas, chefes, sistemas de progressão, segurança e integração de banco de dados implementados no **Aden Arena**.

---

## 🎮 1. Motores de Jogo & Modos de Batalha

- **📜 Idle Chronicle (RPG de Texto e Cartas Autônomo)**:
  - Sistema de combate automático baseado em ticks de relógio.
  - Leitura de estatísticas em tempo real: HP, MP, ATK, DEF, MATK, MDEF, EVA, Taxa Crítica, Boost de XP/Gold, Lifesteal e Regen.
  - Palco visual com artes em SVG estilizadas para heróis e monstros.
  - **Juice de Combate & Animações Visual**: Efeito squash/stretch no golpe do herói (`heroSquashAtk`), trepidação no palco ao sofrer dano (`stageHeroHurtShake`) e efeito flash no abate de monstro (`stageKillFlash`).
  - Textos flutuantes de dano, cura, bloqueio e esquiva.
  - Sistema de áudio e efeitos sonoros imersivos.
- **⚔️ 3D Arena (Ação Survival RPG)**:
  - Renderizador 3D em HTML5 Canvas de alto desempenho (60 FPS).
  - Controles WASD / Direcionais / Thumbstick para dispositivos móveis.
  - Mira automática no inimigo mais próximo, hordas de monstros graduais e tabela de melhores pontuações (*Hall of Legends*).
- **🔄 Alternador de Modos (ModeSwitch)**:
  - Menu hambúrguer colapsável no topo permitindo transição fluida entre Idle Chronicle e 3D Arena.

---

## 🧙‍♂️ 2. Raças, Classes & Subclasses

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

## 🧭 3. Recursos de Interface (UI/UX) & Qualidade de Vida (QoL)

- **🔴 Badges de Notificação Dinâmicos nas Abas (`.tab-badge`)**:
  - Badges pulsantes em vermelho indicando upgrades disponíveis no Inventário, SP para distribuir em Habilidades, receitas para criar na Forja e recompensas de Missões a resgatar.
- **🛡️ Confirmação ao Vender/Sucatear Itens Valiosos**:
  - Diálogo de proteção para vendas ou sucateamentos individuais e em lote de itens de raridade `Rare`, `Epic`, `Legendary`, `Mythic` e `S-Grade`.
- **⌨️ Atalhos Globais de Teclado**:
  - Teclas `1–9`: Troca instantânea entre as abas principais.
  - Tecla `Espaço`: Alternador rápido de velocidade de combate (`1x`, `2x`, `4x`).
  - Tecla `S` / `Ctrl+S`: Salvamento instantâneo do jogo.
- **🔄 Persistência de Scroll entre Abas**:
  - Posições de navegação em listas longas mantidas ao alternar entre abas.
- **📦 Auto-Venda Inteligente por Raridade**:
  - Filtro para auto-vender loots recebidos abaixo de raridade configurada (Common, Uncommon, Rare) concedendo Gold direto.
- **🎨 Aura Dinâmica de Poder no Portrait**:
  - Contorno e iluminação do portrait do personagem derivados da raridade do melhor equipamento equipado (`topEquipRarityColor`).
- **📱 Responsividade & Layout Adaptativo**:
  - Adaptadores CSS para telas de tablet e mobile sem sobreposição de colunas ou quebra de drag.

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

---

## 👑 9. Sistema de Privilégios & Segurança GM

- Nível `0` (Jogador Normal) vs Nível `1` (Administrador GM).
- Controle de Autorização Servidor/Banco direto na raiz do Firestore (`users/{userId}` ➔ `privilegeLevel: 1`).
- Sanitização de salvamento sem aceitação de elevação de privilégio vinda do cliente.

---

*Documento gerado e sincronizado com o repositório oficial do Aden Arena.*
