export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { videoName, errorType, errorCode } = req.body;

  if (!videoName) {
    return res.status(400).json({ error: 'Falta o nome do vídeo.' });
  }

  // Estes valores virão das Variáveis de Ambiente do Vercel
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    console.error("Credenciais do CallMeBot em falta.");
    return res.status(500).json({ error: 'Configuração do bot ausente. API Key não inserida.' });
  }

  const message = `⚠️ *Alerta MYRO* ⚠️\n\nO vídeo/canal *${videoName}* falhou para um utilizador!\n\n*Tipo:* ${errorType}\n*Código:* ${errorCode || 'N/A'}`;
  const encodedMessage = encodeURIComponent(message);
  
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;

  try {
    const botRes = await fetch(url);
    if (!botRes.ok) {
      throw new Error(`CallMeBot respondeu com erro: ${botRes.status}`);
    }
    return res.status(200).json({ success: true, message: 'Alerta enviado!' });
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error);
    return res.status(500).json({ error: 'Falha ao contactar o robô.' });
  }
}
