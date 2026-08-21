/**
 * item.model.ts — Modelo de Itens, Equipamentos e Catálogo (Padrão Angular 2+)
 */

export type ItemGrade = 'nograde' | 'd' | 'c' | 'b' | 'a' | 's' | 'special';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'sovereign';
export type ItemSlot = 'weapon' | 'chest' | 'legs' | 'head' | 'gloves' | 'boots' | 'necklace' | 'ring1' | 'ring2' | 'earring1' | 'earring2' | 'cloak' | 'belt' | 'shield' | 'doll';

export interface GameItem {
  uid: string;
  id: string;
  name: string;
  slot: ItemSlot;
  grade?: ItemGrade;
  rarity?: ItemRarity;
  icon: string;
  count?: number;
  enchant?: number;
  equipped?: boolean;
  pAtk?: number;
  pDef?: number;
  mAtk?: number;
  mDef?: number;
  desc?: string;
}

export interface CashShopProduct {
  id: string;
  name: string;
  priceBRL?: string;
  priceAC?: number;
  checkoutUrl?: string;
  desc: string;
  icon: string;
  badge?: string;
}
