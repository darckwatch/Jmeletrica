// Ficheiro: /api/diagnostico.js (Versão 2 - Mais Robusta)
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Para produção, pode restringir ao seu domínio
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { problem: userProblem } = req.body;
  if (!userProblem) {
    return res.status(400).json({ error: 'Falta o campo "problem".' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("Erro Crítico: A variável de ambiente GEMINI_API_KEY não está definida na Vercel.");
    return res.status(500).json({ error: 'Erro de configuração no servidor.' });
  }

  const prompt = `Aja como um eletricista experiente da empresa JM Elétrica. Um cliente descreveu o seguinte problema: '${userProblem}'. Forneça um diagnóstico preliminar num objeto JSON com a estrutura: {"diagnostico_preliminar": "...", "possiveis_causas": ["...", "...", "..."], "aviso_seguranca": "...", "servico_recomendado": "Recomende UM dos seguintes serviços: Quadros e Instalações, Automação e Pontes Rolantes, Rebobinamento de Motores, Manutenção de Carregadores, Equipamentos e Geradores."}.`;
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
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
      return res.status(500).json({ error: `O serviço de IA não conseguiu processar o pedido. (Status: ${geminiResponse.status})` });
    }

    const result = await geminiResponse.json();

    // Extrai e limpa a resposta JSON do Gemini
    const textResponse = result.candidates[0].content.parts[0].text;
    const cleanJson = JSON.parse(textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, ''));

    // Envia apenas o JSON limpo para o frontend
    res.status(200).json(cleanJson);

  } catch (error) {
    console.error('Erro interno na função da Vercel:', error.message);
    res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
  }
};
