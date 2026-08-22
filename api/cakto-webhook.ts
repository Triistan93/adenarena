/**
 * api/cakto-webhook.ts — Webhook Handler para Pagamentos Cakto
 * 
 * Recebe notificações instantâneas de compras aprovadas (Passe Premium e Aden Coins)
 * e credita com segurança no banco de dados do Supabase.
 */

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const event = body.event || body.type || 'payment_approved';
    const data = body.data || body;

    console.log('[Cakto-Webhook] Evento recebido:', event, JSON.stringify(data));

    // Valida se o status da transação é pago/aprovado
    const status = (data.status || data.payment_status || '').toLowerCase();
    const isApproved = status === 'approved' || status === 'paid' || status === 'completed' || event === 'payment_approved';

    if (!isApproved) {
      return res.status(200).json({ status: 'ignored', message: 'Status não aprovado ainda.' });
    }

    // Identifica o comprador e o produto
    const customerEmail = data.customer?.email || data.email || 'jogador@adenarena.com';
    const customerId = data.customer?.id || data.metadata?.user_id || customerEmail;
    const offerId = String(data.offer_id || data.product_id || data.offer || '');
    const amount = Number(data.amount || data.price || 0);

    // Produto: Passe Premium R$ 15,00 (Link https://pay.cakto.com.br/36g8n4b_1054492)
    const isPremiumPassOffer = offerId.includes('36g8n4b') || offerId.includes('1054492') || amount === 1500 || amount === 15;

    // Cálculo de Aden Coins baseado no valor caso não seja passe direto
    let adenCoinsToAdd = 0;
    if (!isPremiumPassOffer) {
      if (amount >= 5000) adenCoinsToAdd = 5000;
      else if (amount >= 2000) adenCoinsToAdd = 1800;
      else if (amount >= 1000) adenCoinsToAdd = 800;
      else adenCoinsToAdd = Math.floor((amount / 100) * 50);
    }

    // Registra compra no Supabase se configurado
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('pending_purchases').insert({
          user_id: customerId,
          email: customerEmail,
          offer_id: offerId,
          is_premium_pass: isPremiumPassOffer,
          aden_coins: adenCoinsToAdd,
          processed: false,
          created_at: new Date().toISOString()
        });

        console.log(`[Cakto-Webhook] Compra registrada com sucesso para ${customerId}: Pass=${isPremiumPassOffer}, AC=${adenCoinsToAdd}`);
      } catch (dbErr) {
        console.error('[Cakto-Webhook] Erro ao gravar no Supabase:', dbErr);
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Pagamento processado com sucesso!',
      credited: {
        userId: customerId,
        isPremiumPass: isPremiumPassOffer,
        adenCoins: adenCoinsToAdd
      }
    });

  } catch (err: any) {
    console.error('[Cakto-Webhook] Erro interno:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
