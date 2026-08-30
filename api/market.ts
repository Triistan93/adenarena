/**
 * api/market.ts — Endpoint Serverless Global do Mercado P2P de Giran
 * 
 * Permite sincronização robusta de anúncios e vendas entre todos os jogadores,
 * navegadores, abas anônimas e dispositivos diferentes no Vercel.
 */

export const config = {
  runtime: 'nodejs'
};

let globalMarketListings: any[] = [];
let globalMarketSales: Record<string, any> = {};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { salesFor } = req.query || {};

      if (salesFor) {
        const sellerKey = String(salesFor).trim().toLowerCase();
        const sales = globalMarketSales[sellerKey] || { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
        return res.status(200).json({ ok: true, sales });
      }

      const activeListings = globalMarketListings.filter(l => 
        l && l.item && l.isPlayerListing !== false && !String(l.id || '').startsWith('seed_')
      );
      activeListings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return res.status(200).json({
        ok: true,
        listings: activeListings
      });
    }

    if (req.method === 'POST') {
      let body = req.body || {};
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
      }
      const action = body.action || 'create';

      if (action === 'create') {
        const listing = body.listing;
        if (!listing || !listing.id || !listing.item) {
          return res.status(400).json({ ok: false, msg: 'Dados do anúncio inválidos.' });
        }

        listing.isPlayerListing = true;
        listing.createdAt = listing.createdAt || Date.now();

        globalMarketListings = globalMarketListings.filter(l => l.id !== listing.id);
        globalMarketListings.unshift(listing);

        if (globalMarketListings.length > 200) {
          globalMarketListings = globalMarketListings.slice(0, 200);
        }

        return res.status(200).json({ ok: true, msg: 'Anúncio publicado com sucesso.', listing });
      }

      if (action === 'buy') {
        const { listingId, buyerName, buyerUid } = body;
        const index = globalMarketListings.findIndex(l => l.id === listingId);
        
        if (index === -1) {
          return res.status(404).json({ ok: false, msg: 'Anúncio não encontrado ou já negociado.' });
        }

        const listing = globalMarketListings[index];
        const sellerKey = String(listing.sellerName || '').trim().toLowerCase();
        const totalCost = Number(listing.totalPrice) || (listing.pricePerUnit * listing.quantity);
        const currency = listing.currency || 'adena';

        if (!globalMarketSales[sellerKey]) {
          globalMarketSales[sellerKey] = { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
        }

        if (currency === 'adencoin') {
          globalMarketSales[sellerKey].pendingAdenCoins = (globalMarketSales[sellerKey].pendingAdenCoins || 0) + totalCost;
        } else {
          globalMarketSales[sellerKey].pendingAdena = (globalMarketSales[sellerKey].pendingAdena || 0) + totalCost;
        }

        globalMarketSales[sellerKey].history = globalMarketSales[sellerKey].history || [];
        globalMarketSales[sellerKey].history.unshift({
          itemName: listing.item.name,
          quantity: listing.quantity,
          totalCost: totalCost,
          currency: currency,
          buyer: buyerName || 'Outro Jogador',
          soldAt: Date.now()
        });

        if (globalMarketSales[sellerKey].history.length > 30) {
          globalMarketSales[sellerKey].history = globalMarketSales[sellerKey].history.slice(0, 30);
        }

        globalMarketListings.splice(index, 1);

        return res.status(200).json({ ok: true, msg: 'Compra registrada.', listing });
      }

      if (action === 'cancel') {
        const { listingId } = body;
        globalMarketListings = globalMarketListings.filter(l => l.id !== listingId);
        return res.status(200).json({ ok: true, msg: 'Anúncio cancelado.' });
      }

      if (action === 'claim') {
        const { sellerName } = body;
        const sellerKey = String(sellerName || '').trim().toLowerCase();
        if (globalMarketSales[sellerKey]) {
          globalMarketSales[sellerKey].pendingAdena = 0;
          globalMarketSales[sellerKey].pendingAdenCoins = 0;
        }
        return res.status(200).json({ ok: true, msg: 'Lucros resgatados com sucesso.' });
      }

      return res.status(400).json({ ok: false, msg: 'Ação desconhecida.' });
    }

    return res.status(405).json({ ok: false, msg: 'Método não suportado.' });
  } catch (err) {
    console.error('[API Market] Erro:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
}
