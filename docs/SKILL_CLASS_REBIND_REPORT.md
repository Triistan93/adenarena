# ⚔️ RELATÓRIO DE REBINDING DE HABILIDADES E COMBATE
## Aden Arena — Rebinding Canônico de Habilidades, Equipamentos, Shots e CP

> **Status:** AUDITADO E ESTRUTURADO  
> **Escopo:** Rebinding das habilidades aos 159 nós canônicos, herança cumulativa em DAG, blindagem do consumo de Soulshots/Spiritshots, maestria condicional de equipamentos e calibração de Combat Power (CP).

---

## 1. RESUMO EXECUTIVO E OBJETIVOS

Com o desmantelamento das definições legadas e a consolidação da árvore canônica de **9 Raças**, **49 Linhagens** e **159 Classes Únicas**, o sistema de combate e progressão deve obedecer estritamente aos seguintes princípios:

1. **Fidelidade 100% à L2Wiki Essence (Celestial Destiny 3629)**: Sem invenção de classes fictícias ou habilidades artificiais.
2. **Zero Duplicação Sintética**: Uma habilidade possui um identificador semântico único em `CanonicalSkillRegistryV2.js`.
3. **Herança Ascendente Formal (DAG)**: Classes avançadas herdando automaticamente habilidades desbloqueadas nos estágios anteriores via cadeia de `parentClass`.
4. **Blindagem do Consumo de Shots**: Eliminação do risco de classes mágicas consumirem Soulshots por falha de string matching.
5. **Maestria Condicional de Equipamentos**: Bônus de maestria em `StatsEngine.js` aplicados apenas quando o equipamento correspondente estiver efetivamente equipado.
6. **Escalabilidade Determinística de CP**: Cálculo de CP balanceado por estágio e nível de habilidade.

---

## 2. MAPEAMENTO CANÔNICO: 159 CLASSES E REGISTRO DE SKILLS

### A. Resolução de Classes (142 -> 159)
O registro transitório `CanonicalClassRegistryV2.js` continha 142 classes divididas em 46 linhagens. A nova arquitetura expande para os **159 nós canônicos em 49 linhagens**, restaurando:
- **Elf Death Knight** (`elf_deathknight_0` -> `elf_deathknight_1` -> `elf_deathknight_2` -> `elf_deathknight_3`)
- **Dark Elf Death Knight** (`darkelf_deathknight_0` -> `darkelf_deathknight_1` -> `darkelf_deathknight_2` -> `darkelf_deathknight_3`)
- **Female Assassin** (`secret_assassin_female_0` -> `secret_assassin_female_1` -> `secret_assassin_female_2` -> `secret_assassin_female_3`)

### B. Estrutura de Habilidades por Nó
Cada nó de classe no Grafo Canônico armazena:
- `unlockedSkillIds`: Lista de habilidades introduzidas naquele estágio exato.
- `parentClass`: ID do nó ancestral direto (ou `null` para Base Classes).
- `lineageId`: Slug da linhagem (terceira classe correspondente).
- `stage`: 0 (Base, Lv 1–19), 1 (1st Class, Lv 20–39), 2 (2nd Class, Lv 40–75), 3 (3rd Class, Lv 76+).
- `archetype`: Arquétipo funcional (`fighter`, `knight`, `rogue`, `archer`, `mage`, `healer`, `summoner`, `enchanter`).
- `archetypeGroup`: Grupo macro (`fighter` ou `mage`).

---

## 3. ARQUITETURA DE HERANÇA E PROGRESSÃO DE HABILIDADES

### A. Regra Canônica do Essence
> *"Habilidades aprendidas em classes anteriores permanecem ativas e utilizáveis em estágios posteriores."*

A resolução cumulativa de habilidades para qualquer personagem é calculada através de travessia ascendente no Grafo:
```javascript
export function getCumulativeSkillsForClass(classId, classRegistry) {
  const skills = new Set();
  let currentId = classId;
  const visited = new Set();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = classRegistry[currentId];
    if (!node) break;
    
    if (Array.isArray(node.unlockedSkillIds)) {
      node.unlockedSkillIds.forEach(id => skills.add(id));
    }
    currentId = node.parentClass;
  }
  return Array.from(skills);
}
```

### B. Isolamento de Habilidades Compartilhadas (Shared Pool)
- **`SHARED_MAGE_SKILL_IDS`**: `['wind_strike', 'flame_strike', 'hydro_strike', 'heal_light', 'ice_bolt']` (Disponíveis no Lv 1 para classes com `archetypeGroup === 'mage'`).
- **`SHARED_FIGHTER_SKILL_IDS`**: `['power_strike', 'mortal_blow', 'iron_punch', 'energy_burst', 'power_shot']` (Disponíveis no Lv 1 para classes com `archetypeGroup === 'fighter'`).

---

## 4. BLINDAGEM DE COMBATE E CONSUMO DE TIROS (SHOTS)

### A. Diagnóstico da Falha Legada
Em `main.js`, a detecção de classe mágica era realizada por:
```javascript
// ❌ VULNERÁVEL: Classes avançadas como archmage ou storm_screamer falhavam
const isMageClass = state.class === 'mage' || state.class === 'soulbreaker' || (getClass(state.class)?.archetype === 'mage');
```

### B. Solução Canônica Desacoplada
Implementada a função canônica unificada `isMageClass(classId)` consultando diretamente o Grafo:
```javascript
export function isMageClass(classId) {
  const cls = getClass(classId);
  return cls?.archetypeGroup === 'mage' || cls?.archetype === 'mage';
}
```
Isso garante 100% de precisão para:
- Soulshots consumidos por combatentes físicos.
- Spiritshots consumidos por magos, healers e buffers.
- Consumo unificado de exatamente **1 tiro por ataque**, com +100% de bônus para tiro dedicado e +30% para tiro universal.

---

## 5. MAESTRIA CONDICIONAL DE EQUIPAMENTOS

### A. Falha Legada em `StatsEngine.js`
Passivos de maestria eram aplicados incondicionalmente no cálculo de status:
- Personagem com `heavy_armor_mastery` ganhava DEF mesmo vestindo Robe.
- Personagem com `sword_blunt_mastery` ganhava ATK mesmo usando Arco.

### B. Nova Regra de Aplicação Condicional
No cálculo de `getStats(state)`:
```javascript
// Maestrias de Armas
const equippedWeaponType = getWeaponType(equippedWeaponDef);
if (equippedWeaponType === 'sword' || equippedWeaponType === 'blunt') {
  baseAtk += sk('sword_blunt_mastery') * 5;
}
if (equippedWeaponType === 'dual') {
  baseAtk += sk('dual_weapon_mastery') * 6;
}
if (equippedWeaponType === 'bow') {
  baseAtk += sk('bow_mastery') * 6;
}
if (equippedWeaponType === 'dagger') {
  baseAtk += sk('dagger_mastery') * 5;
}

// Maestrias de Armadura
const equippedArmorType = getArmorType(equippedArmorDef);
if (equippedArmorType === 'heavy') {
  baseDef += sk('heavy_armor_mastery') * 12;
}
if (equippedArmorType === 'light') {
  baseDef += sk('light_armor_mastery') * 8;
}
if (equippedArmorType === 'robe') {
  baseDef += sk('robe_mastery') * 6;
}
```

---

## 6. CALIBRAÇÃO DE COMBAT POWER (CP)

O CP do personagem integra formalmente o estágio da classe e as habilidades ativas:
- **CP Base da Classe**:
  - Estágio 0 (Base Class): `+0 CP`
  - Estágio 1 (1st Class): `+250 CP`
  - Estágio 2 (2nd Class): `+500 CP`
  - Estágio 3 (3rd Class): `+750 CP`
- **CP por Nível de Personagem**: `level * 20`
- **CP por Nível de Habilidade**: `sum(skillLvl * 50)`

---

## 7. PROTOCOLO DE VERIFICAÇÃO E TESTES AUTOMATIZADOS

1. **Validação de DAG**: 159 nós testados individualmente para garantir ausência de ciclos e presença de raiz válida.
2. **Validação de Habilidades**: Zero habilidades órfãs ou não mapeadas no `CanonicalSkillRegistryV2`.
3. **Validação de Shots**: Teste automatizado com todas as 159 classes disparando tiros corretos (Soulshot vs Spiritshot).
4. **Validação de Maestria**: Teste unitário de troca de equipamento confirmando que maestria só ativa com o tipo de item correto.
