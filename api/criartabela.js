const fetch = require('node-fetch');

// Domínios permitidos
const allowedOrigins = [
  'https://jmeletrica-manutencao.com.br',
  'https://www.jmeletrica-manutencao.com.br'
  // Adicione 'http://127.0.0.1:5500' ou o seu servidor local para testes
];

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Falta o campo "prompt".' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Erro de configuração no servidor.' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
                "headers": {
                    "type": "ARRAY",
                    "items": { "type": "STRING" }
                },
                "rows": {
                    "type": "ARRAY",
                    "items": {
                        "type": "ARRAY",
                        "items": { "type": "STRING" }
                    }
                }
            }
          }
      }
  };

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('Erro da API Gemini:', geminiResponse.status, errorBody);
      return res.status(500).json({ error: `O serviço de IA não conseguiu processar o pedido.` });
    }

    const result = await geminiResponse.json();
    const textResponse = result.candidates[0].content.parts[0].text;

    // Não precisa de limpeza extra, a API já deve retornar JSON puro
    res.status(200).json(JSON.parse(textResponse));

  } catch (error) {
    console.error('Erro interno na função da Vercel:', error.message);
    res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
  }
};
