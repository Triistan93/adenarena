# SKILL DATASET SCHEMA AUDIT

**Generated**: 2026-09-20  
**Status**: `SCHEMA_AUDIT_COMPLETE`

---

## Files

### 1. skills_detailed.json

**Path**: `scraped_data_wiki/skills_detailed.json`  
**Records**: 2947  
**Format**: JSON Array of Objects  
**Source**: L2Wiki scraped data

#### Schema

```json
{
  "wikiSkillId": "string | number — UNIQUE per skill definition, NOT per skill+class",
  "name": "string — skill display name",
  "type": "string — skill type (often empty)",
  "minLevel": "number — minimum level to learn this skill for this class",
  "mpCost": "number — mana cost",
  "cooldown": "string — e.g. '5 sec.', '1 min.'",
  "range": "number — attack range in game units, 0 = self/melee",
  "castTime": "string — e.g. '1.50 sec.'",
  "duration": "string — e.g. '20 min.'",
  "spCost": "number — skill point cost to learn",
  "description": "string — full effect description with stat modifiers",
  "classesText": "string — display-format class names",
  "url": "string — L2Wiki source URL",
  "icon": "string — full icon URL from l2wiki.com CDN",
  "iconFile": "string — icon filename, e.g. 'skill0082.png'",
  "categories": "string[] — category tags, e.g. ['Buffs', 'Physical Skills']",
  "classes": "string[] — machine-readable class slugs",
  "disabled": "boolean? — only present on 358 records (12.1%)"
}
```

#### Key Observations

1. **Duplicate IDs**: 839 unique wikiSkillIds across 2947 records. Same skill appears multiple times with different class associations and minLevel values.
2. **No grade/book fields**: The schema contains NO fields for grade, rarity, tier, book, tome, spellbook, stars, or acquisition type.
3. **Description is the richest field**: Contains stat modifiers, trigger conditions, upgrade chains, and use restrictions.
4. **Icon coverage**: 100% — 787 unique icon files.

---

### 2. classes_summary.json

**Path**: `scraped_data_wiki/classes_summary.json`  
**Records**: 147  
**Format**: JSON Array of Objects

#### Schema

```json
{
  "slug": "string — machine-readable class identifier",
  "name": "string — display name",
  "race": "string — race identifier",
  "raceName": "string — display race name",
  "url": "string — L2Wiki class page URL",
  "description": "string — class description",
  "properties": {
    "race": "string",
    "role": "string",
    "weapons": "string"
  },
  "skillsCount": "number — count of skills listed",
  "skills": [
    {
      "wikiSkillId": "string — references skills_detailed.json",
      "url": "string — skill page URL",
      "icon": "string — icon URL",
      "iconFile": "string — icon filename",
      "category": "string — single category"
    }
  ]
}
```

#### Key Observations

1. **Skill references are minimal**: Only `wikiSkillId, url, icon, iconFile, category` — no level, description, or grade data.
2. **Category per skill**: Each skill has ONE category in summary (vs. potentially multiple in skills_detailed.json).
3. **properties field**: Contains `race`, `role`, `weapons` — useful for class archetype validation.

---

### 3. classes_tree_canonical.json

**Path**: `scraped_data_wiki/classes_tree_canonical.json`  
**Records**: 9 (one per race)  
**Format**: JSON Array of Objects

#### Schema

```json
{
  "race": "string — race identifier",
  "raceName": "string — display name",
  "branches": [
    {
      "lineageName": "string — descriptive lineage name",
      "role": "string — combat role description",
      "base": "string — Stage 0 class slug",
      "first": "string — Stage 1 class slug",
      "second": "string — Stage 2 class slug",
      "third": "string — Stage 3 class slug"
    }
  ]
}
```

#### Key Observations

1. **49 lineage branches** across 9 races.
2. **Stage mapping is definitive**: `base=0, first=1, second=2, third=3`.
3. **Special classes included**: Death Knights, Samurai (crow), Sacred Templar, Spirit, Rose Vain, etc.
4. **Ertheia race**: Has `eviscerator` and `sayhaSeeker` as third-job classes.

---

## Cross-File Relationships

```
classes_tree_canonical.json
  ├── race → branches[].{base, first, second, third}
  │     Maps class slugs to stages (0-3)
  │
  ├── JOIN ON: branch.{base|first|second|third} = classes_summary.slug
  │
classes_summary.json
  ├── slug → skills[]
  │     Maps classes to skill references
  │
  ├── JOIN ON: skills[].wikiSkillId = skills_detailed.wikiSkillId
  │
skills_detailed.json
      └── wikiSkillId + classes[] + minLevel
            Full skill data with class-specific level requirements
```

## Missing Data Points

The following data points are **NOT present** in any of the three datasets:

| Data Point | Status |
|---|---|
| Skill Grade (Common→Legendary) | NOT PRESENT |
| Book/Tome Requirement | NOT PRESENT |
| Book Star Level (1★-5★) | NOT PRESENT |
| Acquisition Method | NOT PRESENT |
| Skill Rank / Max Rank | NOT PRESENT |
| Prerequisites (other skills) | NOT PRESENT (partially in descriptions) |
| Class-stage-specific descriptions | PARTIALLY PRESENT (minLevel varies) |
