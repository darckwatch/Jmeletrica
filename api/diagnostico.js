/**
 * Vercel Serverless Function para servir como um proxy seguro para a API Gemini.
 *
 * Estrutura de ficheiros do projeto:
 * /
 * |-- api/
 * |   |-- diagnostico.js  (Este ficheiro)
 * |
 * |-- public/ ou / (raiz)
 * |   |-- index.html      (O seu ficheiro do site)
 * |   |-- ... (outros ficheiros estáticos como CSS, imagens)
 * |
 * |-- package.json        (Ficheiro de configuração do projeto)
 *
 * Como implementar:
 * 1. Crie uma pasta para o seu projeto no seu computador.
 * 2. Dentro dela, crie a estrutura de ficheiros acima.
 * 3. Coloque este código no ficheiro /api/diagnostico.js.
 * 4. Crie o ficheiro package.json (o conteúdo está abaixo).
 * 5. Execute `npm install` no seu terminal para instalar as dependências.
 * 6. Crie uma conta na Vercel e ligue-a ao seu repositório do GitHub (ou use a Vercel CLI).
 * 7. No painel do seu projeto na Vercel, vá a "Settings" > "Environment Variables".
 * 8. Adicione uma nova variável de ambiente:
 * - Nome: GEMINI_API_KEY
 * - Valor: A_SUA_CHAVE_DA_API_AQUI
 * 9. Faça o deploy do seu projeto. A Vercel irá fornecer-lhe uma URL. O seu endpoint estará em `https://<url-do-seu-site>.vercel.app/api/diagnostico`.
 * 10. Use essa URL no seu ficheiro index.html.
 */

// Ficheiro: /api/diagnostico.js

// Importar o 'node-fetch' que instalámos
const fetch = require('node-fetch');

// A função que a Vercel irá executar
module.exports = async (req, res) => {
  // Configurar CORS para permitir pedidos do seu site
  // Em produção, é mais seguro especificar o seu domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder a pedidos pre-flight (OPTIONS) do browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { problem: userProblem } = req.body;

  if (!userProblem) {
    return res.status(400).json({ error: 'Falta o campo "problem" no corpo do pedido.' });
  }

  // Obter a chave da API das variáveis de ambiente da Vercel (forma segura)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'A chave da API não está configurada no servidor.' });
  }

  const prompt = `Aja como um eletricista experiente e prestativo da empresa JM Elétrica. Um cliente descreveu o seguinte problema: '${userProblem}'. Com base neste problema, forneça um diagnóstico preliminar. A sua resposta deve ser um objeto JSON com a seguinte estrutura: {"diagnostico_preliminar": "Uma breve análise do que pode estar a acontecer.", "possiveis_causas": ["Causa provável 1.", "Causa provável 2.", "Causa provável 3."], "aviso_seguranca": "Um aviso de segurança importante, como desligar a energia ou não tentar reparar sozinho.", "servico_recomendado": "Recomende UM dos seguintes serviços da JM Elétrica que seja mais apropriado para resolver o problema: Quadros e Instalações, Automação e Pontes Rolantes, Rebobinamento de Motores, Manutenção de Carregadores, Equipamentos e Geradores."}. Se o problema descrito não for claro ou estiver fora do âmbito elétrico, retorne um JSON com uma mensagem de erro amigável. Analise o problema: '${userProblem}'`;
  
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
      const errorText = await geminiResponse.text();
      console.error('Erro da API Gemini:', errorText);
      return res.status(geminiResponse.status).json({ error: `Erro na API Gemini: ${errorText}` });
    }

    const result = await geminiResponse.json();
    // Enviar a resposta completa da Gemini de volta para o frontend
    res.status(200).json(result);

  } catch (error) {
    console.error('Erro interno do servidor:', error.message);
    res.status(500).json({ error: 'Erro ao processar o seu pedido.' });
  }
};
