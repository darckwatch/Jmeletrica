// Ficheiro: /api/diagnostico.js (Versão 3 - Depuração Melhorada)
const fetch = require('node-fetch');

// Lista de domínios permitidos
const allowedOrigins = [
  'https://jmeletrica-manutencao.com.br',
  'https://www.jmeletrica-manutencao.com.br'
];

module.exports = async (req, res) => {
  console.log("FUNÇÃO INICIADA: Método recebido:", req.method);

  // Configuração de CORS dinâmica
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log("Pedido OPTIONS (pre-flight) recebido e respondido com sucesso.");
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log("Método não permitido:", req.method);
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  console.log("Pedido POST recebido. A processar...");
  const { problem: userProblem } = req.body;
  if (!userProblem) {
    console.log("Erro: O campo 'problem' está em falta no corpo do pedido.");
    return res.status(400).json({ error: 'Falta o campo "problem".' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("ERRO CRÍTICO: A variável de ambiente GEMINI_API_KEY não está definida na Vercel.");
    return res.status(500).json({ error: 'Erro de configuração no servidor.' });
  }
  console.log("Chave da API carregada com sucesso.");

  const prompt = `Aja como um eletricista experiente da empresa JM Elétrica. Um cliente descreveu o seguinte problema: '${userProblem}'. Forneça um diagnóstico preliminar num objeto JSON com a estrutura: {"diagnostico_preliminar": "...", "possiveis_causas": ["...", "...", "..."], "aviso_seguranca": "...", "servico_recomendado": "Recomende UM dos seguintes serviços: Quadros e Instalações, Automação e Pontes Rolantes, Rebobinamento de Motores, Manutenção de Carregadores, Equipamentos e Geradores."}.`;
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
  };

  try {
    console.log("A enviar pedido para a API Gemini...");
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('Erro da API Gemini:', geminiResponse.status, errorBody);
      return res.status(500).json({ error: `O serviço de IA não conseguiu processar o pedido. (Status: ${geminiResponse.status})` });
    }
    console.log("Resposta da API Gemini recebida com sucesso.");

    const result = await geminiResponse.json();
    const textResponse = result.candidates[0].content.parts[0].text;
    const cleanJson = JSON.parse(textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, ''));

    console.log("JSON processado e enviado para o cliente.");
    res.status(200).json(cleanJson);

  } catch (error) {
    console.error('ERRO INTERNO NA FUNÇÃO:', error.message);
    res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
  }
};
