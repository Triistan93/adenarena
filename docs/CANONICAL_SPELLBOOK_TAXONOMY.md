# CANONICAL SPELLBOOK & GRADE TAXONOMY (LINEAGE II ESSENCE)

**Documento**: Auditoria e Reconciliação do Sistema de Livros e Graus  
**Origem Documental**: L2Wiki Essence Items & Spellbook Coupons  
**Status**: `CANONICAL_MODEL_PROVEN`

---

## 1. Visão Geral da Arquitetura

No **Lineage II Essence**, os requisitos de livros de habilidades e os seus respectivos Graus (**Grades**) não são atributos das tabelas de skills brutas, mas sim modelados no **Sistema de Itens**:

1. Cada habilidade que exige livro possui um item dedicado chamado:  
   `Spellbook: [Nome da Habilidade] - Sealed` (ou unsealed).
2. O item do Spellbook descreve a classe necessária e a habilidade concedida ao clicar duas vezes.
3. Os Spellbooks são categorizados em **5 Tiers/Graus Canônicos**, cada um correspondendo a um **Cupom de Livro Canônico** que permite ao jogador escolher qualquer livro daquele grau.

```
+-------------------------------+---------------------+--------------------+----------------------------+
| Cupom Canônico (L2Wiki Item)  | Grau (Grade)        | Estrelas (Stars)   | Equivalente Aden Arena     |
+-------------------------------+---------------------+--------------------+----------------------------+
| Common Spellbook Coupon       | Common              | 1★                 | book_1star / Tomo 1★       |
| Enhanced Spellbook Coupon     | Enhanced            | 2★                 | book_2star / Tomo 2★       |
| Rare Spellbook Coupon         | Rare                | 3★                 | book_3star / Tomo 3★       |
| Heroic Spellbook Coupon       | Heroic              | 3★+ (Heroic)       | book_3star / Tomo 3★       |
| Legendary Spellbook Coupon    | Legendary           | 4★                 | book_4star / Tomo 4★       |
+-------------------------------+---------------------+--------------------+----------------------------+
```

---

## 2. Detalhamento dos 5 Cupons Canônicos

### 2.1 Common Spellbook Coupon (`98075`) — 1★ (Comum)
*Link*: [Common Spellbook Coupon (98075)](https://l2wiki.com/essence/items/98075.html)
- **Função**: Permite escolher 1 Spellbook Comum (1 estrela).
- **Escopo**: Buffs fundamentais universais e magias básicas de suporte e combate.
- **Livros Canônicos Documentados**:
  - `Spellbook: Berserker Spirit` (ID 95769)
  - `Spellbook: Might` (ID 95517)
  - `Spellbook: Shield` (ID 95518)
  - `Spellbook: Empower` (ID 95533)
  - `Spellbook: Magic Barrier` (ID 95534)
  - `Spellbook: Focus` (ID 95535)
  - `Spellbook: Death Whisper` (ID 95536)
  - `Spellbook: Wind Walk` (ID 95537)
  - `Spellbook: Clarity` (ID 95770)
  - `Spellbook: Wild Magic` (ID 95771)
  - `Spellbook: Haste` (ID 95538)
  - `Spellbook: Acumen` (ID 95539)

### 2.2 Enhanced Spellbook Coupon (`97121`) — 2★ (Aprimorado)
*Link*: [Enhanced Spellbook Coupon (97121)](https://l2wiki.com/essence/items/97121.html)
- **Função**: Permite escolher 1 Spellbook Aprimorado de classe (2 estrelas).
- **Escopo**: Habilidades táticas intermediárias de classes de 2ª transferência (Lv 40+).

### 2.3 Rare Spellbook Coupon (`97123`) — 3★ (Raro)
*Link*: [Rare Spellbook Coupon (97123)](https://l2wiki.com/essence/items/97123.html)
- **Função**: Permite escolher 1 Spellbook Raro de classe (3 estrelas).
- **Escopo**: Habilidades centrais de dano elevado, controle de multidão e auras táticas (Lv 56–76).

### 2.4 Heroic Spellbook Coupon (`100053`) — Heroic (3★+ Heróico)
*Link*: [Heroic Spellbook Coupon (100053)](https://l2wiki.com/essence/items/100053.html)
- **Função**: Permite escolher 1 Spellbook Heróico ou ser utilizado como material de troca para habilidades épicas e profecias heróicas em NPCs especiais.
- **Escopo**: Profecias de suporte, skills supremas de fusão e upgrades heróicos.

### 2.5 Legendary Spellbook Coupon (`103041`) — 4★ (Lendário)
*Link*: [Legendary Spellbook Coupon (103041)](https://l2wiki.com/essence/items/103041.html)
- **Função**: Permite escolher **qualquer Livro Lendário de 4 Estrelas** do jogo para qualquer classe.
- **Escopo**: Todas as habilidades supremas de Lv 76+ (3ª Classe) que definem o poder máximo de cada classe (ex: *Legendary Archer*, *Ultimate Death Knight*, habilidades mestras de dano e transformação).

---

## 3. Resolução da Auditoria no Aden Arena

1. **A Derivação dos Tomos do Aden Arena**:
   - O Aden Arena implementou `book_1star`, `book_2star`, `book_3star` e `book_4star`.
   - Essa estrutura **coincide com precisão matemática com os 5 Cupons de Spellbooks do L2Wiki Essence**:
     - `book_1star` = Tomo Comum (Common / 1★)
     - `book_2star` = Tomo Aprimorado (Enhanced / 2★)
     - `book_3star` = Tomo Raro / Heróico (Rare / Heroic / 3★)
     - `book_4star` = Tomo Lendário (Legendary / 4★)
2. **Reconciliação das Grades**:
   - `Common` -> `1★`
   - `Enhanced` -> `2★`
   - `Rare` -> `3★`
   - `Heroic` -> `3★+`
   - `Legendary` -> `4★`
