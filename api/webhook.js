import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // O segredo do Webhook gerado na NetShop
  const WEBHOOK_SECRET = process.env.NETSHOP_WEBHOOK_SECRET || 'whsec_6b1847ce4ae06d8c886d4e4164548139795518b24b639827';

  // A NetShop envia a assinatura neste header (conforme a dica no teu print)
  const signature = req.headers['x-netshop-signature'];

  if (!signature) {
    return res.status(401).json({ error: 'Assinatura em falta.' });
  }

  try {
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error("Assinatura inválida!");
      // Em produção: return res.status(401).json({ error: 'Assinatura inválida.' });
    }

    const event = req.body.event; // ex: 'charge.paid' ou 'charge.failed'
    const data = req.body.data;

    console.log(`Webhook NetShop Recebido: ${event}`, data);

    if (event === 'charge.paid') {
      console.log(`O pagamento da referência ${data?.reference || data?.id} foi pago com sucesso!`);
      // Aqui vais activar o plano no Firebase
    } else if (event === 'charge.failed') {
      console.log(`O pagamento da referência ${data?.reference || data?.id} falhou.`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Erro no Webhook NetShop:", error);
    return res.status(500).json({ error: 'Erro interno ao processar o webhook.' });
  }
}
