# CANONICAL SKILL DATA AUDIT

**Generated**: 2026-09-20  
**Status**: `DATASET_AUDIT_COMPLETE`  
**Datasets**: 3 files, fully processed  
**NO SCRAPING / NO PUSH / NO MERGE / NO DEPLOY**

---

## 1. Dataset Inventory

| File | Records | Type |
|---|---|---|
| `skills_detailed.json` | **2947** | Skill records (with class-level duplicates) |
| `classes_summary.json` | **147** | Class entries with skill references |
| `classes_tree_canonical.json` | **9** | Race trees with 49 lineage branches |

---

## 2. Dataset Schemas

### skills_detailed.json

All 17 fields have **100% coverage** (2947/2947), except `disabled` (12.1%, 358 records).

| Field | Type | Coverage | Notes |
|---|---|---|---|
| `wikiSkillId` | string | 100% | **839 unique** IDs across 2947 records |
| `name` | string | 100% | Skill name |
| `type` | string | 100% | Often empty string |
| `minLevel` | number | 100% | Range: 1-90 |
| `mpCost` | number | 100% | Mana cost |
| `cooldown` | string | 100% | e.g. "5 sec.", "1 min." |
| `range` | number | 100% | 0 = self/melee |
| `castTime` | string | 100% | e.g. "1.50 sec." |
| `duration` | string | 100% | e.g. "20 min." |
| `spCost` | number | 100% | Skill point cost |
| `description` | string | 100% | **Contains functional effect contracts** |
| `classesText` | string | 100% | Display-format class names |
| `url` | string | 100% | L2Wiki source URL |
| `icon` | string | 100% | Full icon URL (l2wiki.com CDN) |
| `iconFile` | string | 100% | Icon filename (e.g. `skill0082.png`), **787 unique** |
| `categories` | array | 100% | Skill category tags |
| `classes` | array | 100% | Machine-readable class slugs |
| `disabled` | boolean | 12.1% | Present on 358 skills |

**NO grade, book, tome, spellbook, star, rarity, or tier fields exist in this dataset.**

### classes_summary.json

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Machine-readable class identifier |
| `name` | string | Display name |
| `race` | string | Race identifier |
| `raceName` | string | Display race name |
| `url` | string | L2Wiki class URL |
| `description` | string | Class description text |
| `properties` | object | `{ race, role, weapons }` |
| `skillsCount` | number | Number of skills listed |
| `skills` | array | Skill references with `{ wikiSkillId, url, icon, iconFile, category }` |

Summary skill entries contain ONLY: `wikiSkillId, url, icon, iconFile, category`. No grade, book, or level data.

### classes_tree_canonical.json

| Field | Type | Notes |
|---|---|---|
| `race` | string | Race identifier (9 races) |
| `raceName` | string | Display name |
| `branches` | array | Lineage branches |
| `branches[].lineageName` | string | Descriptive lineage name |
| `branches[].role` | string | Combat role description |
| `branches[].base` | string | Stage 0 class (Lv1) |
| `branches[].first` | string | Stage 1 class (Lv20) |
| `branches[].second` | string | Stage 2 class (Lv40) |
| `branches[].third` | string | Stage 3 class (Lv76) |

---

## 3. Classes

### Races (9)
`human, elf, darkelf, orc, dwarf, kamael, sylph, highelf, ertheia`

### Class Coverage
- **147 unique classes** in skills_detailed.json
- **49 lineage branches** in classes_tree_canonical.json
- **147 class entries** in classes_summary.json

### Class Stages (from tree)

| Stage | Level Range | Example |
|---|---|---|
| 0 (Base) | 1-19 | fighter, mage, dark_fighter |
| 1 (First) | 20-39 | warrior, knight, wizard |
| 2 (Second) | 40-75 | gladiator, paladin, sorcerer |
| 3 (Third) | 76+ | duelist, phoenix_knight, archmage |

---

## 4. Skill Inventory

### Totals
- **2947** total records (with class-level duplicates)
- **839** unique wikiSkillIds
- **2587** unique skill+class combinations (manifest entries)

### MinLevel Distribution

| Range | Count | % |
|---|---|---|
| 1-19 | 82 | 3.2% |
| 20-39 | 425 | 16.4% |
| 40-75 | 824 | 31.8% |
| **76+** | **1256** | **48.6%** |

### ID Uniqueness
- **2108 duplicate IDs** — same wikiSkillId appears for different classes at different levels
- Example: `Power Strike` (id=3) appears 12 times across fighter, warrior, knight, elven_knight, etc.
- This is correct behavior: same skill has different minLevel per class stage

### Categories

| Category | Count |
|---|---|
| Buffs | 1363 |
| Physical Skills | 418 |
| Transformation/Mounting Skills | 340 |
| Debuff/Anomaly skill | 243 |
| Other Skills - Active | 163 |
| Magic Skills | 129 |
| Recovery Skills | 110 |
| Special skills - Active | 82 |
| Summoning Skills | 67 |
| Other Skills - Passive | 12 |
| Unique Skills | 11 |
| Doll effect | 6 |
| Level-up Achievement - Glory Skill | 3 |

### Skills by Race

| Race | Skills |
|---|---|
| human | 795 |
| darkelf | 545 |
| elf | 449 |
| orc | 309 |
| kamael | 206 |
| dwarf | 133 |
| highelf | 94 |
| sylph | 56 |

---

## 5. Grades — RESOLVIDO VIA SPELLBOOK COUPONS (L2WIKI)

**Descoberta Canônica**: A taxonomia de Graus (**Grades**) no Lineage II Essence está modelada nos itens de Spellbook e seus respectivos Cupons Oficiais:

- **Common** = 1★ (Common Spellbook Coupon `98075`) — Buffs universais e skills fundamentais.
- **Enhanced** = 2★ (Enhanced Spellbook Coupon `97121`) — Habilidades táticas aprimoradas de classe.
- **Rare** = 3★ (Rare Spellbook Coupon `97123`) — Habilidades raras centrais de combate.
- **Heroic** = 3★+ (Heroic Spellbook Coupon `100053`) — Habilidades heróicas e profecias.
- **Legendary** = 4★ (Legendary Spellbook Coupon `103041`) — Habilidades lendárias supremas de 4 estrelas (Lv 76+).

Documento detalhado de referência: `docs/CANONICAL_SPELLBOOK_TAXONOMY.md`.

---

## 6. Book/Tome Taxonomy — RESOLVIDO VIA ITENS CANÔNICOS

**Origem da Informação**: No Lineage II Essence, as exigências de livros residem no catálogo de Itens (`items/{id}.html`), sob a nomenclatura `Spellbook: [Skill Name] - Sealed`, e são obtidos através dos 5 Cupons Canônicos:

1. `Common Spellbook Coupon` (Item `98075`): Concede livros de 1★ como *Might* (`95517`), *Shield* (`95518`), *Empower* (`95533`), *Magic Barrier* (`95534`), *Focus* (`95535`), *Death Whisper* (`95536`), *Wind Walk* (`95537`), *Haste* (`95538`), *Acumen* (`95539`), *Berserker Spirit* (`95769`), *Clarity* (`95770`), *Wild Magic* (`95771`).
2. `Enhanced Spellbook Coupon` (Item `97121`): Concede livros de 2★ para skills intermediárias de classe.
3. `Rare Spellbook Coupon` (Item `97123`): Concede livros de 3★ para habilidades de alto impacto.
4. `Heroic Spellbook Coupon` (Item `100053`): Concede livros heróicos de classe.
5. `Legendary Spellbook Coupon` (Item `103041`): Concede qualquer livro lendário de 4★ do jogo para skills de 3ª classe (Lv 76+), incluindo *Legendary Archer*, *Master of Combat*, etc.

**Correspondência no Aden Arena Engine**:
- `book_1star` = Tomo Comum (Common / 1★)
- `book_2star` = Tomo Aprimorado (Enhanced / 2★)
- `book_3star` = Tomo Raro / Heróico (Rare / Heroic / 3★)
- `book_4star` = Tomo Lendário (Legendary / 4★)

---

## 7. Lv76+ Skills

**Total: 1256 skills** across **46 third-job classes**

Third-job classes with Lv76+ skills:
```
adventurer, arcana_lord, archmage, cardinal, crow_3 (Samurai),
delf_deathknight_3, dominator, doombringer, doomcryer, dreadnought,
duelist, elemental_master, elf_deathknight_3, evas_saint, evas_templar,
fortune_seeker, ghost_hunter, ghost_sentinel, grand_khavatari,
hell_knight, hierophant, human_deathknight_3, maestro,
moonlight_sentinel, mystic_muse, orc_rider_3, phoenix_knight,
rose_vain_3, sacred_templar_3, sagittarius, secret_assassin_female_3,
secret_assassin_male_3, shillien_saint, shillien_templar, soul_hound,
soultaker, spectral_dancer, spectral_master, spirit_3,
storm_blaster, storm_screamer, sword_muse, titan, trickster,
werewolf_3, wind_rider
```

---

## 8. Special Classes — Death Knight (Human / Elf / Dark Elf)

### 8.1 Natureza de `Change Armor` (Lv 1)
- **ID da Skill**: `45355` (`change_death_armor.png`, categoria: `Other Skills - Active`)
- **Função Canônica**: Habilidade puramente **estética/cosmética** de alternância visual da armadura/visage do Death Knight.
- **Impacto no Combate**: **Nenhum** — não causa dano físico/mágico, não cura e não concede atributos táticos.
- **Progressão Inicial (Lv 1–19)**: O Death Pilgrim (`human_deathknight_0`) luta estritamente via **ataque básico físico** com espada de uma mão (`Onehanded sword`).

### 8.2 Progressão Canônica do Human Death Knight por Estágio

#### Estágio 0: Death Pilgrim (`human_deathknight_0`, Lv 1–19)
- `[45355]` **Change Armor** (Lv 1) — *Cosmetic / Visual Toggle*

#### Estágio 1: Death Blade (`human_deathknight_1`, Lv 20–39)
- `[45301]` **Punishment** (Lv 20) — *Primeira Skill de Ataque Físico Ativo*
- `[45107]` **Wind Walk** (Lv 20) — *Buff (Speed)*
- `[45111]` **Haste** (Lv 20) — *Buff (Atk. Spd)*
- `[45104]` **Acumen** (Lv 20) — *Buff (Cast Spd)*
- `[45176]` **HP Recovery** (Lv 20) — *Buff (Regen)*
- `[45177]` **MP Recovery** (Lv 20) — *Buff (Regen)*
- `[45328]` **Roar of Death** (Lv 30) — *Buff*
- `[45112]` **Berserker Spirit** (Lv 30) — *Buff*
- `[45106]` **Wild Magic** (Lv 30) — *Buff*
- `[45108]` **Magic Barrier** (Lv 30) — *Buff (M. Def)*

#### Estágio 2: Death Messenger (`human_deathknight_2`, Lv 40–75)
- `[45303]` **Wipeout** (Lv 40) — *Physical AoE Skill*
- `[45311]` **Deadly Pull** (Lv 40) — *Physical Pull / Crowd Control*
- `[45335]` **Stigma of Death** (Lv 40) — *Physical Debuff / Attack*
- `[45329]` **Death Guard** (Lv 40) — *Defensive Buff*
- `[45301]` **Punishment** (Lv 44) — *Physical Skill (Upgrade)*
- `[45305]` **Fist of Fury** (Lv 50) — *Physical Skill*
- `[45328]` **Roar of Death** (Lv 50) — *Buff (Upgrade)*
- `[45338]` **Bone Cage** (Lv 55) — *Debuff / Anomaly (Immobilize)*
- `[45322]` **Call of Flame** (Lv 60) — *Elemental Buff*
- `[45332]` **Flaming Body** (Lv 70) — *Aura Buff*

#### Estágio 3: Death Knight (`human_deathknight_3`, Lv 76+)
- `[45312]` **Hellfire** (Lv 76) — *Assinatura Física / Fogo (Humano)*
- `[45313]` **Burning Field** (Lv 76) — *Assinatura AoE Fogo*
- `[47493]` **Flame Grip** (Lv 76) — *Debuff / Anomaly*
- `[45389]` **Devour** (Lv 76) — *Recovery Skill (Sustain)*
- `[45343]` **Deadly Ligament Rupture** (Lv 76) — *Debuff / Anomaly*
- `[54206]` **Ultimate Death Knight** (Lv 76) — *Transformation / Mounting Skill*
- `[47561]` **Rage Charge** (Lv 80) — *Physical Charge*
- `[47553]` **Stigma of Evil** (Lv 80) — *Physical Skill*
- `[45361]` **Glorious Warrior: Enhanced Abilities** (Lv 90) — *Special Active*

### 8.3 Variações Elementais entre Raças
- **Human Death Knight** (Fogo): Hellfire = `45312`, Flame Grip = `47493`, Call of Flame = `45322`
- **Elf Death Knight** (Gelo / Luz): Hellfire = `47511`, Frost Grip = `47497`, Call of Frost = `45324`, Frozen Field = `45316`
- **Dark Elf Death Knight** (Raio / Trevas): Hellfire = `47513`, Lightning Grip = `47501`, Call of Lightning = `45326`, Lightning Storm = `45319`

---

## 9. Samurai Golden Fixture

`crow_0 → crow_1 → crow_2 → crow_3` (Kamael race)

| Skill | wikiSkillId | Stage | MinLevel | Status |
|---|---|---|---|---|
| Single Flash | 89101 | crow_0/1/2/3 | 10/20/40/76 | PROVEN |
| Pursuit | 89113 | crow_1/2 | 20/40 | PROVEN |
| Maneuver | 89125 | crow_3 | 76 | PROVEN |
| Take Life | 89123 | crow_3 | 76 | PROVEN |
| Strike | 89137 | crow_2/3 | 45/77 | PROVEN |
| Twist | 89143 | crow_3 | 77 | PROVEN |
| Crippling Strike | 89151 | crow_3 | 78 | PROVEN |
| Walk in Monster Woods | 89155 | crow_3 | 78 | PROVEN |
| Thousand Wounds | 89159 | crow_3 | 78 | PROVEN |
| Battojutsu | 89171 | crow_3 | 76 | PROVEN |
| Wind | 89117 | crow_1/2/3 | 20/40/76 | PROVEN |
| Forest | 89118 | crow_1/2/3 | 20/40/76 | PROVEN |
| Fire | 89119 | crow_1/2/3 | 20/40/76 | PROVEN |
| Mountain | 89120 | crow_1/2/3 | 20/40/76 | PROVEN |
| Atsumori | 89136 | crow_2/3 | 70/77 | PROVEN |
| Determination | 89161 | crow_3 | 78 | PROVEN |
| Adamant Will | 89165 | crow_3 | 76 | PROVEN |
| Omen | 89166 | crow_3 | 76 | PROVEN |

**Not found**: Perception: Battojutsu, Advent, Embodiment, Double Flash

---

## 10. Content Gaps

| Class | Data Status | Skills Found |
|---|---|---|
| werewolf_0/1/2 | **DATA_EXISTS** | 1/10/14 skills |
| spirit_0/1/2 | **DATA_EXISTS** | 2+ skills |
| shineMakerBase | **CONTENT_GAP** | 0 |
| marauderBase | **CONTENT_GAP** | 0 |
| sayhaMageBase | **CONTENT_GAP** | 0 |

**Werewolf and Spirit have real data** in the datasets. They were incorrectly classified as CONTENT_GAP.

---

## 11. Skill Relationships

**115 skills** contain relationship patterns:
- 59 "when using" triggers
- 38 "triggers" references
- 16 "skill upgrade" chains
- 11 "can only be used" restrictions
- 28 explicit trigger rates

---

## 12. Design Conflicts

### DC-1: Hellfire as Starter for Death Knight
- **Dataset**: Change Armor at Lv1 is the ONLY base skill. Hellfire is Lv76.
- **Current**: Hellfire treated as core starter.
- **Status**: DESIGN_CONFLICT — product decision overrides data.

### DC-2: Power Strike Level Requirement
- **Dataset**: minLevel=3 for fighter classes
- **Current**: Treated as Lv1 starter
- **Status**: Minor conflict — acceptable game design override.

---

## 13. Provenance Summary

| Data Point | Status |
|---|---|
| Skill Identity | PROVEN |
| MinLevel | PROVEN |
| Class Association | PROVEN |
| Category | PROVEN |
| Effect Description | PROVEN |
| Icon | PROVEN |
| **Grade** | **UNPROVEN — NOT IN DATASETS** |
| **Book/Tome** | **UNPROVEN — NOT IN DATASETS** |
| **Book Stars** | **UNPROVEN — NOT IN DATASETS** |

---

## 14. Answers to 18 Questions

1. Skills in skills_detailed.json: **2947** records, **839** unique IDs
2. Classes covered: **147**
3. Skills with minLevel >= 76: **1514** records
4. Grades: **NONE in datasets**
5. Grade coding: **NOWHERE**
6. Book/tome coding: **NOT CODED**
7. Stars coding: **NOT CODED**
8. Skills requiring 4★+: **UNPROVEN**
9. Which skills: **Cannot determine**
10. Which classes: **Cannot determine**
11. Third job skills: **1256** across 46 classes
12. Special class starters: **22** documented
13. Upgrade relationships: **16** explicit + **59** trigger-based
14. State-dependent: **11** with use restrictions
15. Triggered: **28** with trigger rates
16. Local contradictions: See Design Conflicts
17. Local without evidence: **174** local-only IDs
18. Documented but missing: Requires per-skill reconciliation
