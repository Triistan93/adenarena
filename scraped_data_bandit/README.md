# L2Bandit.camp - Base de Dados Scrapeada

Base de dados completa extraída de [L2Bandit.camp](https://l2bandit.camp/).

## Resumo dos Dados Coletados

| Categoria | Subcategoria / Seção | Quantidade de Registros |
| :--- | :--- | :--- |
| **Multicraft** | Craft Book (Receitas) | **724** |
| | Armor Sets (Conjuntos de Armadura) | **49** |
| | Jewelry Sets (Conjuntos de Joias) | **14** |
| **Weapons** | Daggers, Swords, Bows, Blunts, Spears, Fists, Magic, Duals (11 subtipos) | **448** |
| **Armors** | Heavy, Light, Magic, Gloves, Boots, Helmets, Shields, Sigils (8 subtipos) | **395** |
| **Accessories** | Necklaces, Earrings, Rings | **79** |
| **Other** | Shots & Resources | **82** |
| | Classes (Árvores de Evolução) | **9** |
| | Skills (Habilidades Ativas e Passivas) | **2533** |
| | Locations (Territórios & Zonas) | **17** |
| **NPC** | Bosses (Chefes de Raide) | **229** |
| | Mammons (Merchant & Blacksmith) | **2** |
| | Monsters (Monstros do Mundo) | **2889** |
| | Citizens (NPCs de Cidades) | **1882** |
| **TOTAL GERAL** | **Todas as Categorias** | **9352** |

---

## Estrutura dos Arquivos

- `images/`: Diretório com todos os ícones em formato WebP baixados localmente.
- `multicraft/`: `craft_book.json`, `armor_sets.json`, `jewelry_sets.json`.
- `weapons/`: `weapons.json` e arquivos individuais por tipo de arma.
- `armors/`: `armors.json` e arquivos individuais por tipo de armadura.
- `accessories/`: `accessories.json` e arquivos individuais por tipo de joia.
- `other/`: `shots.json`, `resources.json`, `classes.json`, `skills.json`, `locations.json`.
- `npc/`: `bosses.json`, `mammons.json`, `monsters.json`, `citizens.json`.
- `l2bandit_all.json`: Arquivo master consolidado.
- Planilhas CSV:
  - `l2bandit_equipment_and_items.csv`
  - `l2bandit_craft_book.csv`
  - `l2bandit_npcs_and_monsters.csv`
  - `l2bandit_skills.csv`
- `index.html`: Catálogo interativo para pesquisa e visualização no navegador.
