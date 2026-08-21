/**
 * shop.service.ts — Serviço Angular 2+ para Gerenciamento de Loja e Checkout Cakto
 */

import { CashShopProduct } from '../models/item.model';

export class ShopService {
  private readonly CAKTO_PRODUCTS: Record<string, CashShopProduct> = {
    premium_pass: {
      id: 'premium_pass',
      name: 'Passe de Batalha Premium',
      priceBRL: 'R$ 15,00',
      checkoutUrl: 'https://pay.cakto.com.br/36g8n4b_1054492',
      desc: 'Desbloqueie a trilha Premium de recompensas, itens raros, scrolls abençoados e visuais únicos.',
      icon: 'gradec/jewels/jewel_blessed_necklace.png',
      badge: 'POPULAR'
    },
    ac_pack_250: {
      id: 'ac_pack_250',
      name: 'Pacote 250 Aden Coins',
      priceBRL: 'R$ 15,00',
      priceAC: 250,
      checkoutUrl: 'https://adenarena.vercel.app',
      desc: '250 Aden Coins para comprar Starter Packs, visuais exclusivos e utilitários na loja de Aden.',
      icon: 'gradec/weapons/weapon_samurai_longsword.png',
      badge: 'RECOMENDADO'
    }
  };

  /**
   * Abre o checkout oficial da Cakto em nova aba
   */
  public openCaktoCheckout(productId: string): boolean {
    const product = this.CAKTO_PRODUCTS[productId];
    if (product && product.checkoutUrl) {
      if (typeof window !== 'undefined') {
        window.open(product.checkoutUrl, '_blank');
      }
      return true;
    }
    return false;
  }

  /**
   * Retorna os produtos cadastrados
   */
  public getProducts(): CashShopProduct[] {
    return Object.values(this.CAKTO_PRODUCTS);
  }
}
