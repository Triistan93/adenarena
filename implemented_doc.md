# 📜 Aden Arena — Documento de Funcionalidades Implementadas (`implemented_doc.md`)

Este documento compila a lista completa de todos os sistemas, mecânicas, zonas, chefes, sistemas de progressão, segurança e integração de banco de dados implementados no **Aden Arena**.

---

## 🎮 1. Motores de Jogo & Modos de Batalha

- **📜 Idle Chronicle (RPG de Texto e Cartas Autônomo)**:
  - Sistema de combate automático baseado em ticks de relógio.
  - Leitura de estatísticas em tempo real: HP, MP, ATK, DEF, MATK, MDEF, EVA, Taxa Crítica, Boost de XP/Gold, Lifesteal e Regen.
  - Palco visual com artes em SVG estilizadas para heróis e monstros.
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

## 🗺️ 3. Zonas de Caça, Sagas & Chefes de Raid Mundiais

- **Sagas de Progressão (Sagas I, II e III)**:
  - *Talking Island* (Lv 1-15)
  - *Elven Ruins* (Lv 15-30)
  - *Ant Nest* (Lv 30-45)
  - *Cruma Tower* (Lv 45-60)
  - *Dragon Valley* (Lv 60-75)
  - *Tower of Insolence* (Lv 75-85)
  - *Imperial Tomb* (Lv 85-90)
  - *Antharas' Lair* (Lv 90-95)
  - *Forge of the Gods* (Lv 95-100)
- **Chefes Globais (World Bosses)**:
  - **Queen Ant** (Lv 40) ➔ Drop: *Ring of Queen Ant* (Crit Rate & Atk)
  - **Zaken** (Lv 60) ➔ Drop: *Zaken's Earring* (Lifesteal & Resistências)
  - **Baium** (Lv 80) ➔ Drop: *Baium's Ring* (Cast Speed & Atk Speed)
  - **Antharas** (Lv 95) ➔ Drop: *Antharas' Earring & Dragon Slayer Blade*
  - **Valakas** (Lv 100) ➔ Drop: *Necklace of Valakas*

---

## 🏰 4. Torre da Insolência (End-Game Tower of Insolence)

- **Desafio de 100 Andares**:
  - Monstruosidades e Guardiões de Torre com escalonamento de vida e dano.
  - Chefes Especiais da Torre a cada 5 andares.
- **Bônus Passivo Multiplicativo**:
  - Concede +1% de ATK, DEF, MATK e MDEF para cada andar conquistado na Torre.
- **Varredura Diária (Sweep)**:
  - Função `sweepTowerDaily()` concedendo 50% de recompensas diárias para todos os andares desbloqueados.

---

## 📜 5. Missões, Diárias/Semanais & Passe de Batalha

- **Sistema de Missões Automáticas**:
  - Resetação automática a cada 24 horas (Diárias) e 7 dias (Semanais).
  - Objetivos de abate de monstros, chefes de raid, acúmulo de gold e andares da torre.
- **Passe de Batalha (Battle Pass)**:
  - Trilha Gratuita e Trilha Premium com XP progressivo.
  - Recompensas em Gold, SP, Mats Raros e Scroll de Encantamento.

---

## 🛡️ 6. Equipamentos, Crafting Avançado & Magic Dolls

- **Sistema de Equipamentos & Graus**:
  - Slots completos: Arma, Escudo, Elmo, Peitoral, Calça, Luvas, Botas, Acessórios Épicos, Cinto, Capa, Talismã, Agathion.
  - Graus de Raridade: Common, Uncommon, Rare, Epic, Legendary, Mythic, S-Grade.
  - **Armaduras S-Grade**: Imperial Crusader Set (Heavy), Draconic Leather Set (Light), Major Arcana Set (Robe).
  - **Armas S-Grade**: Dragon Slayer, Angel Slayer, Arcana Mace, Draconic Bow.
- **Receitas de Crafting Avançado**:
  - Criação de armas/armaduras S-Grade consumindo Cristais S, Oriharukon, Escamas/Ossos de Dragão e Relíquias Antigas.
- **Roda de Craft Aleatório (Random Craft Wheel)**:
  - Roleta de prêmios com acúmulo de pontos de craft.
- **Sintetização de Agathions (Magic Dolls)**:
  - Coleção de mascotes/dolls com roleta de fusão 2 para 1 para upgrade de raridade.

---

## ☁️ 7. Autenticação, Banco de Dados NoSQL & Cloud Save (Firebase)

- **Integração Firebase (`src/firebase.ts`)**:
  - Conexão configurada para o projeto `adenarena-6e448`.
  - **Firebase Auth**: Login por E-mail/Senha e marca oficial do Google OAuth (4 cores).
  - **Firestore NoSQL Database**: Coleção `users/{userId}` para armazenamento de progresso.
- **Portal de Login Inicial (`src/components/LoginScreen.tsx`)**:
  - Tela de entrada temática que bloqueia o acesso direto ao jogo até que o jogador entre na sua conta ou escolha "Jogar como Convidado".
  - Exibe resumo do personagem (Nível, Classe, Gold, Torre e Privilégio) ao reconectar.
- **Sincronização & Sanitização**:
  - Sanitização de dados com `JSON.parse(JSON.stringify(state))` para impedir falhas de gravação.
  - Botões de controle no topo do jogo: **`☁️ Salvar`** e **`📥 Carregar`**.

---

## 👑 8. Sistema de Privilégios & Segurança GM

- **Níveis de Acesso**:
  - **`0` (Jogador Normal)**: Acesso padrão. Comandos iniciados por `//` são bloqueados com mensagem **`⛔ Acesso Negado`**.
  - **`1` (Administrador / GM)**: Acesso concedido ao Painel de Administrador (`//admin`) e comandos de chat GM.
- **Controle de Autorização Servidor/Banco**:
  - O `privilegeLevel` é verificado diretamente na raiz do documento Firestore (`users/{userId}` ➔ `privilegeLevel: 1`).
  - Remoção de qualquer comando não autenticado de elevação de privilégios no cliente.
- **Segurança de Infraestrutura & Rede**:
  - `.env.example` e `import.meta.env.VITE_FIREBASE_*` para isolamento de credenciais.
  - Proteção de segredos no `.gitignore`.
  - Proteção contra DDoS e balanceamento de carga global via Vercel Cloudflare Edge CDN.

---

*Documento gerado e sincronizado com o repositório oficial do Aden Arena.*
