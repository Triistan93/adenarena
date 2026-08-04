/**
 * races.js — Atributos base de Raças e bridge para EchoData do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 27-53)
 */

/**
 * Atributos base primários por raça+arquétipo.
 * Usados em getBaseAttributes() para cálculo de STR/CON/DEX/WIT/INT/MEN.
 */
export const RACE_BASE_ATTRIBUTES = {
  // Fighters
  darkelf_fighter: { str: 41, con: 32, dex: 34, wit: 12, int: 25, men: 26 },
  human_fighter:   { str: 40, con: 43, dex: 30, wit: 11, int: 21, men: 25 },
  elf_fighter:     { str: 36, con: 36, dex: 35, wit: 14, int: 23, men: 26 },
  orc_fighter:     { str: 40, con: 47, dex: 26, wit: 12, int: 18, men: 27 },
  dwarf_fighter:   { str: 39, con: 45, dex: 29, wit: 10, int: 20, men: 27 },
  kamael_male:     { str: 41, con: 31, dex: 33, wit: 11, int: 29, men: 25 },
  kamael_female:   { str: 39, con: 30, dex: 35, wit: 11, int: 28, men: 27 },

  // Mages
  darkelf_mage:    { str: 23, con: 24, dex: 23, wit: 19, int: 44, men: 37 },
  human_mage:      { str: 22, con: 27, dex: 21, wit: 20, int: 41, men: 39 },
  elf_mage:        { str: 21, con: 25, dex: 24, wit: 23, int: 37, men: 40 },
  orc_mage:        { str: 25, con: 31, dex: 20, wit: 21, int: 31, men: 42 }
};

/**
 * Mapa de raças — bridge para window.EchoData.RACES_ECHO.
 * Definido como getter para garantir leitura após todos os imports.
 * @type {Object}
 */
export const RACES = (typeof window !== 'undefined' && window.EchoData)
  ? window.EchoData.RACES_ECHO
  : {};

/**
 * Mapa de classes — bridge para window.EchoData.CLASSES_ECHO.
 * @type {Object}
 */
export const CLASSES = (typeof window !== 'undefined' && window.EchoData)
  ? window.EchoData.CLASSES_ECHO
  : {};

/** ID da classe base dos Dwarves (artisan) */
export const DWARF_CLASS = CLASSES.artisan;

/** ID da classe base dos Kamaels (soulbreaker) */
export const KAMAEL_CLASS = CLASSES.soulbreaker;
