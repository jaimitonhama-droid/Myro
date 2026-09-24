import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extrair os dados enviados pelo frontend
  const { phone, amount, planId } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Falta o número de telefone ou o montante.' });
  }

  // Chaves NetShop
  const NETSHOP_API_KEY = process.env.NETSHOP_API_KEY || 'ns_live_sk_QMfNK3VJ_QSnEgkRRnJGbSz9wMCjn3VfiXsjXtTpQ5MwU93iX';
  const netshopUrl = 'https://www.netshop.co.mz/api/v1/charges';

  // Gerar um UUID/referência única para o Idempotency-Key e para a referência da transação
  const uniqueRef = crypto.randomUUID ? crypto.randomUUID() : `Myro_${planId}_${Date.now()}`;

  // Estrutura de dados comum. Como usas no xflix, ajusta os campos se a documentação da NetShop pedir nomes diferentes (ex: msisdn em vez de phone).
  const payload = {
    amount: amount,
    msisdn: phone,
    customer_name: "Cliente Myro",
    reference: uniqueRef,
    method: 'mpesa' // A NetShop exige que se especifique o método (mpesa ou emola)
  };

  try {
    const response = await fetch(netshopUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NETSHOP_API_KEY}`,
        'Idempotency-Key': uniqueRef,
        'X-Wallet-ID': '155414' // A NetShop exige que o Wallet ID vá no cabeçalho!
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.status === 'failed') {
      console.error("Detalhes do erro NetShop:", data);
      
      let errorMessage = 'Erro ao processar pagamento com a NetShop';
      
      // Se a NetShop devolver o objecto da transação com status 'failed'
      if (data.status === 'failed') {
        errorMessage = 'O pagamento falhou (podes não ter saldo suficiente ou cancelaste a operação no telemóvel).';
      } 
      // Se a NetShop devolver um erro estruturado
      else if (data.message) {
        errorMessage = data.message;
      } else if (data.error && typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (data.error && data.error.message) {
        errorMessage = data.error.message;
      }
      
      throw new Error(errorMessage);
    }

    return res.status(200).json({ 
      success: true, 
      transaction: data 
    });

  } catch (error) {
    console.error("Erro na API de Pagamento NetShop:", error);
    return res.status(500).json({ error: error.message || 'Falha ao comunicar com a NetShop.' });
  }
}
