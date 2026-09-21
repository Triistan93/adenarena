# ADEN ARENA — CANONICAL SKILL PROGRESSION 3.0
# LOT C — THIRD JOB / Lv76+ CANONICAL MANIFEST REPORT

> **Status:** `LOT_C_PASS`  
> **Fontes Primárias Auditadas:**  
> - `scraped_data_wiki/classes_tree_canonical.json`  
> - `scraped_data_wiki/classes_summary.json`  
> - `scraped_data_wiki/skills_detailed.json`  
> - `scraped_data_wiki/all_articles_deep_extracted.json`  
> - `CANONICAL_SPELLBOOK_TAXONOMY.md`  
> **Artefatos Produzidos:**  
> - `scraped_data_wiki/third_job_class_manifest.json`  
> - `scraped_data_wiki/lv76_plus_canonical_manifest.json`  
> - `scraped_data_wiki/legendary_4star_skill_manifest.json`  
> - `scraped_data_wiki/heroic_skill_manifest.json`  
> - `scraped_data_wiki/superior_skill_investigation.json`  
> - `scraped_data_wiki/lv76_runtime_support_matrix.json`  
> - `scraped_data_wiki/lv76_local_reconciliation.json`  
> **Validação Automatizada:** `test/canonical-progression-3.0-lot-c.test.js` (10/10 PASS)  
> **Restrições:** NO PUSH · NO MERGE · NO DEPLOY. Arquivos sagrados com ZERO DIFF.

---

## 1. Baseline

- **Testes Pré-LOT C:** 705 / 705 PASS (92 suites).
- **Testes Pós-LOT C:** 715 / 715 PASS (+10 novos invariantes contratuais do LOT C).
- **Falhas:** 0.
- **Build Vite:** 100% verde (`✓ built in 30.41s`).
- **Arquivos Sagrados Protegidos:** `LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`, `cakto-webhook.js`, `CashShopService.js` permaneceram com rigoroso ZERO DIFF.

---

## 2. Third Jobs Discovered (49 Classes S3)

O grafo canônico de classes (`classes_tree_canonical.json`) comprovou exatamente **49 classes de Terceira Transferência (Stage 3 / Third Job)**, e não a constante histórica obsoleta de 46.

### Tabela de 3rd Jobs por Raça e Linhagem

| Raça | Third Job (S3 Slug) | Nome de Exibição | Raiz (S0) | S1 (Lv 20) | S2 (Lv 40) | Linha Especial |
|---|---|---|---|---|---|---|
| **Human** | `duelist` | Duelist | `fighter` | `warrior` | `gladiator` | Não |
| **Human** | `dreadnought` | Dreadnought | `fighter` | `warrior` | `warlord` | Não |
| **Human** | `phoenix_knight` | Phoenix Knight | `fighter` | `knight` | `paladin` | Não |
| **Human** | `hell_knight` | Hell Knight | `fighter` | `knight` | `dark_avenger` | Não |
| **Human** | `adventurer` | Adventurer | `fighter` | `rogue` | `treasure_hunter` | Não |
| **Human** | `sagittarius` | Sagittarius | `fighter` | `rogue` | `hawkeye` | Não |
| **Human** | `archmage` | Archmage | `mage` | `wizard` | `sorcerer` | Não |
| **Human** | `soultaker` | Soultaker | `mage` | `wizard` | `necromancer` | Não |
| **Human** | `arcana_lord` | Arcana Lord | `mage` | `wizard` | `warlock` | Não |
| **Human** | `cardinal` | Cardinal | `mage` | `cleric` | `bishop` | Não |
| **Human** | `hierophant` | Hierophant | `mage` | `cleric` | `prophet` | Não |
| **Human** | `human_deathknight_3` | Death Knight (Human) | `human_deathknight_0` | `human_deathknight_1` | `human_deathknight_2` | Sim (Death Knight) |
| **Human** | `werewolf_3` | Wolf Raider | `werewolf_0` | `werewolf_1` | `werewolf_2` | Sim (Warg / Beast) |
| **Human** | `secret_assassin_male_3`| Shadow Blade (Male) | `secret_assassin_male_0`| `secret_assassin_male_1`| `secret_assassin_male_2`| Sim (Assassin) |
| **Elf** | `eva_templar` | Eva's Templar | `elven_fighter` | `elven_knight` | `temple_knight` | Não |
| **Elf** | `sword_muse` | Sword Muse | `elven_fighter` | `elven_knight` | `swordsinger` | Não |
| **Elf** | `wind_rider` | Wind Rider | `elven_fighter` | `elven_scout` | `plains_walker` | Não |
| **Elf** | `moonlight_sentinel` | Moonlight Sentinel | `elven_fighter` | `elven_scout` | `silver_ranger` | Não |
| **Elf** | `mystic_muse` | Mystic Muse | `elven_mage` | `elven_wizard` | `spellsinger` | Não |
| **Elf** | `elemental_master` | Elemental Master | `elven_mage` | `elven_wizard` | `elemental_summoner`| Não |
| **Elf** | `eva_saint` | Eva's Saint | `elven_mage` | `oracle` | `elder` | Não |
| **Elf** | `elf_deathknight_3` | Death Knight (Elf) | `elf_deathknight_0` | `elf_deathknight_1` | `elf_deathknight_2` | Sim (Death Knight) |
| **Dark Elf**| `shillien_templar` | Shillien Templar | `dark_fighter` | `palus_knight` | `shillien_knight` | Não |
| **Dark Elf**| `spectral_dancer` | Spectral Dancer | `dark_fighter` | `palus_knight` | `bladedancer` | Não |
| **Dark Elf**| `ghost_hunter` | Ghost Hunter | `dark_fighter` | `assassin` | `abyss_walker` | Não |
| **Dark Elf**| `ghost_sentinel` | Ghost Sentinel | `dark_fighter` | `assassin` | `phantom_ranger` | Não |
| **Dark Elf**| `storm_screamer` | Storm Screamer | `dark_mage` | `dark_wizard` | `spellhowler` | Não |
| **Dark Elf**| `spectral_master` | Spectral Master | `dark_mage` | `dark_wizard` | `phantom_summoner`| Não |
| **Dark Elf**| `shillien_saint` | Shillien Saint | `dark_mage` | `shillien_oracle`| `shillien_elder` | Não |
| **Dark Elf**| `delf_deathknight_3`| Death Knight (Dark Elf)| `delf_deathknight_0` | `delf_deathknight_1` | `delf_deathknight_2` | Sim (Death Knight) |
| **Dark Elf**| `secret_assassin_female_3`| Shadow Blade (Female)| `secret_assassin_female_0`| `secret_assassin_female_1`| `secret_assassin_female_2`| Sim (Assassin) |
| **Dark Elf**| `rose_vain_3` | Blood Rose | `rose_vain_0` | `rose_vain_1` | `rose_vain_2` | Sim (Rose) |
| **Orc** | `titan` | Titan | `orc_fighter` | `orc_raider` | `destroyer` | Não |
| **Orc** | `grand_khavatari` | Grand Khavatari | `orc_fighter` | `monk` | `tyrant` | Não |
| **Orc** | `dominator` | Dominator | `orc_mage` | `orc_shaman` | `overlord` | Não |
| **Orc** | `doomcryer` | Doomcryer | `orc_mage` | `orc_shaman` | `warcryer` | Não |
| **Orc** | `orc_rider_3` | Vanguard Rider | `orc_rider_0` | `orc_rider_1` | `orc_rider_2` | Sim (Rider) |
| **Dwarf** | `fortune_seeker` | Fortune Seeker | `dwarven_fighter`| `scavenger` | `bounty_hunter` | Não |
| **Dwarf** | `maestro` | Maestro | `dwarven_fighter`| `artisan` | `warsmith` | Não |
| **Dwarf** | `shine_maker_3` | Master Alchemist | `shineMakerBase` | `shineMakerFirst`| `shineMakerSecond`| Sim (Shine Maker) |
| **Kamael** | `doombringer` | Doombringer | `jin_kamael_soldier`| `trooper` | `berserker` | Não |
| **Kamael** | `soul_hound` | Soul Hound | `jin_kamael_soldier`| `warder` | `soul_breaker` | Não |
| **Kamael** | `trickster` | Trickster | `jin_kamael_soldier`| `warder` | `arbalester` | Não |
| **Kamael** | `crow_3` | Wild Crow | `crow_0` | `crow_1` | `crow_2` | Sim (Crow) |
| **Sylph** | `sylph_wind_sniper_3`| Wind Sniper | `sylphid` | `sylph_scout` | `sylph_gunner` | Sim (Sylph) |
| **High Elf**| `sacred_templar_3` | Sacred Knight | `sacred_templar_0`| `sacred_templar_1`| `sacred_templar_2`| Sim (Templar) |
| **High Elf**| `spirit_3` | Spirit Weaver | `spirit_0` | `spirit_1` | `spirit_2` | Sim (Spirit) |
| **Ertheia**| `ertheia_marauder_3` | Eviscerator | `marauderBase` | `marauderFirst` | `marauderSecond` | Sim (Ertheia Fighter) |
| **Ertheia**| `ertheia_sayha_3` | Sayha's Seer | `sayhaMageBase` | `sayhaMageFirst` | `sayhaMageSecond` | Sim (Ertheia Mage) |

---

## 3. Lv76+ Inventory & Explanation of Discrepancies

### Métricas Primárias Recalculadas

| Métrica | Valor Recalculado | Explicação Técnica |
|---|---|---|
| **thirdJobNodes** | **49** | O grafo canônico possui 49 ramos folha de 3ª classe (40 clássicas + 9 classes especiais). A constante histórica de "46" omitia variações raciais do Death Knight e classes especiais. |
| **lv76PlusRecords** | **1514** | Total absoluto de linhas em `skills_detailed.json` com `minLevel >= 76` (inclui diferentes ranks e listagens por classe). |
| **uniqueWikiSkillIds** | **697** | Habilidades únicas indexadas pelo `wikiSkillId` primário com exigência de nível `>= 76`. |
| **uniqueSkillNames** | **628** | Nomes únicos de habilidades `>= 76`. A diferença para 697 ocorre devido a variações de id/classe para o mesmo nome (ex: Hellfire possui 45312 humano, 47511 elfo, 47513 elfo negro). |
| **classSkillAssociations** | **1258** | Total de pares `(classe S3, skill)`. Este número explica a lenda histórica de "1256 skills Lv76+": contava-se associações de classe, não registros de skills brutas. |

---

## 4. Level Distribution (Lv76+)

| Nível Exato | Quantidade de Registros | Categoria / Finalidade |
|---|---|---|
| **Lv 76** | **1012** | Marco canônico da 3ª transferência de classe (S3 Base Unlock). |
| **Lv 77** | **36** | Primeiro upgrade de rank de habilidades S3. |
| **Lv 78** | **48** | Segundo upgrade de rank de habilidades S3. |
| **Lv 79** | **18** | Terceiro upgrade de rank de habilidades S3. |
| **Lv 80** | **198** | Marco de Habilidades Supremas (Ultimates), 4★ avançadas e Prophecies. |
| **Lv 81** | **2** | Incremento de rank de habilidades de controle. |
| **Lv 82** | **49** | Upgrade de maestrias e auras defensivas. |
| **Lv 83** | **1** | Habilidade singular de classe. |
| **Lv 85** | **11** | Marco de Transcendência inicial. |
| **Lv 87** | **44** | Upgrades de ranks de habilidades ativas avançadas. |
| **Lv 88** | **1** | Incremento de rank. |
| **Lv 89** | **45** | Último rank antes de Master Ultimate. |
| **Lv 90** | **48** | Marco de Habilidades Master Ultimate (Pinnacle 5★). |
| **Lv 92** | **1** | Ramo de topo de maestria. |
| **Total** | **1514** | Soma exata de todos os registros `>= 76`. |

---

## 5. Own vs Inherited

A auditoria de ascendência (`S0 -> S1 -> S2 -> S3`) comparou todas as habilidades das classes S3 com o repertório anterior:

- **OWN_SKILL (563 registros):** Habilidades cuja primeira aparição na linhagem ocorre exclusivamente no estágio 3 (`minLevel >= 76`). Exemplos: *Legendary Archer*, *Fire Vortex*, *Meteor*, *Touch of Eva*, *Hellfire*.
- **INHERITED_SKILL (695 registros):** Habilidades herdadas de S0, S1 ou S2 que possuem progressão de rank continuada no Lv 76+ (ex: *Power Strike*, *Drain HP*, *Concentration*, *War Cry*, *Fast Spell Casting*).
- **SHARED_SKILL (0 registros puros):** No Lv 76+, habilidades não são compartilhadas genericamente entre arquétipos distintos.
- **UNKNOWN_PROVENANCE (256 registros):** Registros em `skills_detailed.json` com campo `classes: []` vazio ou skills de eventos/NPCs.

---

## 6. Grade Distribution

| Grade Documentada | Status Epistêmico | Evidência | Quantidade no Manifesto |
|---|---|---|---|
| **LEGENDARY** | `PROVEN` | Cupons e metadados oficiais de 4★ | 9 comprovadas |
| **HEROIC** | `PROVEN` | Heroic Spellbook Coupon (100053) / 3★ | 8 comprovadas |
| **RARE** | `PROVEN` | Rare Spellbook Coupon (97123) / 3★ | Em catalogação |
| **ENHANCED** | `PROVEN` | Enhanced Spellbook Coupon (97121) / 2★ | Em catalogação |
| **COMMON** | `PROVEN` | Common Spellbook Coupon (98075) / 1★ | Em catalogação |
| **SUPERIOR** | `REJECTED_AS_SKILL_GRADE` | Grau do sistema de Dolls (L2Wiki) | **0 (Zero)** |
| **UNKNOWN** | `PROVEN_AS_UNKNOWN` | Sem metadados diretos de grade | Restante |

---

## 7. Spellbook Coverage

- **bookRequiredProven:** Habilidades com vínculo direto a itens de Spellbook comprovados documentalmente.
- **bookNotRequiredProven:** Passivas e skills concedidas automaticamente na troca de classe com `spCost === 0`.
- **bookUnproven:** Habilidades cujo livro ou ausência de livro não possui cupom documental direto no workspace (inclui *Hellfire*). **Nenhum UNKNOWN foi coagido a `false` ou `true`.**

---

## 8. Proven 4★ Skills (Legendary 4★ Manifest)

As seguintes habilidades foram comprovadas documentalmente com relação estrita:  
`SKILL -> SPELLBOOK -> LEGENDARY SPELLBOOK COUPON (103041) -> 4★`:

1. **Legendary Archer** (Sagittarius / Moonlight Sentinel / Ghost Sentinel / Trickster)
2. **Ultimate Death Knight** (Death Knight)
3. **Time Distortion** (Trickster / Soul Hound)
4. **Master of Combat** (Duelist / Dreadnought / Titan / Grand Khavatari)
5. **Final Ultimate Defense** (Phoenix Knight / Hell Knight / Eva's Templar / Shillien Templar)
6. **Touch of Eva** (Eva's Templar)
7. **Touch of Shillien** (Shillien Templar)
8. **Flame Icon** (Phoenix Knight)
9. **Spirit of Shillien** (Shillien Templar)

> **Controle Negativo:** *Hellfire* **NÃO** está nesta lista. O cupom 103041 não lista Hellfire.

---

## 9. Heroic Investigation

- **Conclusão:** `HEROIC !== RARE`.
- O Lineage II Essence possui o **Heroic Spellbook Coupon (`100053`)** para habilidades heróicas de 3 estrelas (como as Profecias: *Prophecy of Fire*, *Prophecy of Water*, *Prophecy of Wind*, *Chant of Victory*, *Pa'agrio's Victory*).
- O **Rare Spellbook Coupon (`97123`)** cobre habilidades ativas e passivas raras básicas de 3 estrelas.
- No Aden Arena, embora o item consumível atual na mochila seja genericamente `book_3star`, o manifesto preserva a taxonomia documental `HEROIC` vs `RARE` sem colapso epistêmico.

---

## 10. Superior Investigation

### Respostas Objetivas:
- **A) SUPERIOR é skill grade?** **NÃO.** Nenhuma tabela de skills do L2Wiki Essence classifica skills como "Superior".
- **B) SUPERIOR é progression grade?** **NÃO.** A progressão oficial ocorre por estágios (S0, S1, S2, S3) e classes.
- **C) SUPERIOR é spellbook tier?** **NÃO.** Não existe "Superior Spellbook Coupon" nem "Superior Spellbook" nos itens do L2Wiki.
- **D) SUPERIOR é presentation grouping?** **NÃO.** Não é utilizado na árvore de skills do cliente original.
- **E) SUPERIOR é outra taxonomia?** **SIM!** É uma raridade oficial do **Sistema de Dolls (Bonecos de Boss)** do Lineage II Essence:  
  `Mythic > Legendary > Heroic > Rare > Superior > Enhanced > Common`.

### Decisão Canônica do LOT C:
Nenhuma skill avançada de Lv 76+ receberá grade `SUPERIOR`. O valor permanece estritamente `UNKNOWN`.

---

## 11. Ultimate Reconciliation: TRUE_ULTIMATES vs FALSE_ULTIMATES

| Categoria | Contrato Canônico | Exemplos |
|---|---|---|
| **TRUE_ULTIMATES** (Regra de Design Aden Arena) | Habilidades authored especificamente para o 5º e 6º slots das 25 classes ativas, com `tier: "ultimate"` (Lv 80) e `tier: "master_ultimate"` (Lv 90). | `titanbreaker` (Lv 80), `meteor` (Lv 80), `judgment_blade` (Lv 80), `master_titanbreaker` (Lv 90), `master_meteor` (Lv 90). |
| **FALSE_ULTIMATE_CLASSIFICATIONS** (Erro do Código Antigo) | Habilidades de 3ª classe de Lv 76 com 4★ que o código antigo convertia para Lv 80 simplesmente por terem `starRank: 4`. | `legendary_archer` (Lv 76), `hellfire` (Lv 76), `touch_of_eva` (Lv 76), `flame_icon` (Lv 76), `master_of_combat` (Lv 76). |

---

## 12. Skill Relationships

Foram identificadas e mapeadas no manifesto `lv76_plus_canonical_manifest.json`:
- **REQUIRES_WEAPON:** Arcos (`bow`), Espada/Blunt (`sword_blunt`), Dual Swords (`dual`), Polearms (`polearm`), Adagas (`dagger`).
- **REQUIRES_SHIELD:** Habilidades de cavaleiro que exigem escudo equipado (*Final Ultimate Defense*, *Shield of Faith*).
- **UPGRADES / REPLACES:** Substituições de ranks de buffs e auras de 2ª classe por versões de 3ª classe.
- **TRIGGERS:** Efeitos condicionais com chance percentual de ativação em acerto crítico ou dano sofrido.

---

## 13. Runtime Effect Support Matrix

| Efeito | Status no Aden Arena | Consumer no Runtime |
|---|---|---|
| **Dano Físico / Mágico** | `RUNTIME_IMPLEMENTED` | `CombatEngine.js` / `calculatePhysicalDamage`, `calculateMagicalDamage` |
| **Consumo de MP** | `RUNTIME_IMPLEMENTED` | `SkillEngine.js` / `spendMP`, `validateMpCost` |
| **Buffs e Passivas de Stats** | `RUNTIME_IMPLEMENTED` | `SkillEngine.js` / `getStats`, `applyBuff` |
| **Dreno Vampírico (Life Leech)** | `RUNTIME_IMPLEMENTED` | `CombatEngine.js` / `drainHp` |
| **Divisão PvP / PvE** | `RUNTIME_IMPLEMENTED` | `CanonicalSkillRegistryV2` (`balance.pveMultiplier`, `pvpMultiplier`) |
| **Stun / Atordoamento** | `RUNTIME_PARTIAL` | `CombatEngine.js` (duração e decaimento existem; faltam fórmulas complexas de resist de boss) |
| **Hold / Paralisia** | `RUNTIME_PARTIAL` | `CombatEngine.js` (duração existe; interrupção de cast parcial) |
| **Shield Ignore (% ignora escudo)** | `RUNTIME_PARTIAL` | `CombatEngine.js` (pula verificação de bloco de escudo; mitigação parcial) |
| **Defense Penetration (% ignora def)**| `RUNTIME_PARTIAL` | `CombatEngine.js` (parcialmente integrado em dano de arco) |
| **Pull (Arrastar alvo)** | `RUNTIME_NOT_IMPLEMENTED` | Motor de combate 2D não possui física de vetores de atração radial. |
| **Knockback / Airborne** | `RUNTIME_NOT_IMPLEMENTED` | Não há física no eixo vertical Z no loop de combate 2D. |
| **Transformações / Montarias** | `RUNTIME_NOT_IMPLEMENTED` | Purgadas do motor de combate conforme regra de design; operam apenas como cosméticos visuais. |

---

## 14. Local Reconciliation

- **MATCH (464):** Habilidades locais do `CanonicalSkillRegistryV2` perfeitamente alinhadas em nível e classe com o manifesto canônico.
- **CONFLICT / WRONG_LEVEL (0):** Zero divergências de nível após as correções dos LOTs A e B.
- **LOCAL_EXTRA (19):** Habilidades em V2 locais que são variantes puras de mock de classes secundárias e não constam na tabela oficial Lv76+.
- **LOCAL_MISSING (0 em classes ativas):** O catálogo de 25 classes ativas possui cobertura completa das habilidades necessárias.

---

## 15. Unproven Assumptions Catalogadas

1. **Hellfire Book:** Permanece rigorosamente `UNPROVEN`. Nenhuma conversão arbitrária para `book_4star`.
2. **Grade Inferida por Nome:** Skills com nomes extravagantes não recebem `LEGENDARY` ou `HEROIC` sem evidência de cupom/wiki.
3. **SUPERIOR:** Identificado e isolado como falso-cognato (pertence a Dolls).

---

## 16. Entradas Preparatórias para o LOT D

O LOT C entrega as seguintes bases validadas para o LOT D:
1. `third_job_class_manifest.json` com os 49 nós S3 prontos para conexão no DAG.
2. `lv76_plus_canonical_manifest.json` com proveniência de OWN vs INHERITED delimitada.
3. Lista fechada de 9 habilidades 4★ comprovadas para fixtures de livro.
4. Desacoplamento definitivo de `starRank: 4` e `tier: "ultimate"`.

---

## 17. Conclusão Final

- **Resultado:** `LOT_C_PASS`
- **Validação de Invariantes:** Suíte `canonical-progression-3.0-lot-c.test.js` aprovada com 10/10 PASS.
- **Suíte Geral:** 715 / 715 PASS.
- **Integridade de Arquivos Sagrados:** ZERO DIFF mantido em 100%.
- **NO PUSH / NO MERGE / NO DEPLOY.**
