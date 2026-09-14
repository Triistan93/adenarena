/**
 * api/cakto-webhook.ts — Webhook Handler para Pagamentos Cakto
 * 
 * Recebe notificações instantâneas de compras aprovadas (Passe Premium e Aden Coins)
 * e credita com segurança no banco de dados do Supabase.
 */

export const config = {
  runtime: 'nodejs'
};

/**
 * Helper para mascarar dados sensíveis nos logs do servidor (PII Sanitization)
 */
function maskIdentifier(val: string): string {
  if (!val) return 'anonymous';
  if (val.includes('@')) {
    const [name, domain] = val.split('@');
    const masked = name.length > 2 ? name.substring(0, 2) + '***' : name + '***';
    return `${masked}@${domain || 'hidden'}`;
  }
  return val.length > 6 ? `${val.substring(0, 3)}***${val.slice(-3)}` : '***';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Verificação de Autenticação / Segredo do Webhook
  const expectedSecret = process.env.CAKTO_WEBHOOK_SECRET;
  if (expectedSecret) {
    const rawHeader = req.headers['x-cakto-signature'] || req.headers['x-webhook-secret'] || req.headers['authorization'] || '';
    const querySecret = req.query?.secret || req.query?.token || '';
    const headerSecret = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : String(rawHeader).trim();
    
    const isValid = (headerSecret && headerSecret === expectedSecret) || (querySecret && querySecret === expectedSecret);
    if (!isValid) {
      console.warn('[Cakto-Webhook] Tentativa de acesso não autorizada: segredo inválido ou ausente.');
      return res.status(401).json({ error: 'Unauthorized. Assinatura ou segredo de webhook inválido.' });
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.error('[Cakto-Webhook] ERRO CRÍTICO: CAKTO_WEBHOOK_SECRET não configurado no ambiente de produção!');
    return res.status(500).json({ error: 'Webhook secret not configured on server.' });
  }

  try {
    const body = req.body || {};
    const event = body.event || body.type || 'payment_approved';
    const data = body.data || body;

    // Identificador único da transação (para deduplicação e idempotência)
    const transactionId = String(data.id || data.transaction_id || data.payment_id || body.id || body.transaction_id || '').trim();

    // Valida se o status da transação é pago/aprovado
    const status = (data.status || data.payment_status || '').toLowerCase();
    const isApproved = status === 'approved' || status === 'paid' || status === 'completed' || event === 'payment_approved';

    // Identifica o comprador e o produto de forma sanitizada
    const customerEmail = data.customer?.email || data.email || 'jogador@adenarena.com';
    const customerId = data.customer?.id || data.metadata?.user_id || customerEmail;
    const offerId = String(data.offer_id || data.product_id || data.offer || '');
    const amount = Number(data.amount || data.price || 0);

    // Logs seguros com PII mascarada
    console.log('[Cakto-Webhook] Evento processando:', {
      event,
      isApproved,
      offerId,
      amount,
      txId: transactionId ? maskIdentifier(transactionId) : 'unspecified',
      user: maskIdentifier(customerId)
    });

    if (!isApproved) {
      return res.status(200).json({ status: 'ignored', message: 'Status não aprovado ainda.' });
    }

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

    // 2. Registro com Garantia de Idempotência no Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Se houver transactionId, verifica se já foi processada anteriormente
        if (transactionId) {
          const { data: existingTx } = await supabase
            .from('pending_purchases')
            .select('id, transaction_id')
            .eq('transaction_id', transactionId)
            .maybeSingle();

          if (existingTx) {
            console.log(`[Cakto-Webhook] Transação ${maskIdentifier(transactionId)} já processada anteriormente (idempotente).`);
            return res.status(200).json({
              status: 'ignored',
              message: 'Transação já processada anteriormente (idempotência garantida).',
              transactionId
            });
          }
        }

        await supabase.from('pending_purchases').insert({
          transaction_id: transactionId || null,
          user_id: customerId,
          email: customerEmail,
          offer_id: offerId,
          is_premium_pass: isPremiumPassOffer,
          aden_coins: adenCoinsToAdd,
          processed: false,
          created_at: new Date().toISOString()
        });

        console.log(`[Cakto-Webhook] Compra registrada com sucesso para ${maskIdentifier(customerId)}: Pass=${isPremiumPassOffer}, AC=${adenCoinsToAdd}`);
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
        adenCoins: adenCoinsToAdd,
        transactionId: transactionId || undefined
      }
    });

  } catch (err: any) {
    console.error('[Cakto-Webhook] Erro interno no processamento:', err?.message || err);
    return res.status(500).json({ error: 'Internal Server Error', details: err?.message });
  }
}
