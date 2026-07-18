// ─── Backend proxy mínimo para OpenAI ────────────────────────────────────────
// Ejemplo de referencia: guarda la key de OpenAI del lado del servidor en vez
// de exponerla en el navegador. Esto NO se ejecuta automáticamente — es un
// archivo aparte que podés correr vos si querés usarlo (ver README.md, sección
// "Configurar la IA con tu key de OpenAI").
//
// Uso:
//   1. cd server && npm install express cors
//   2. OPENAI_API_KEY=sk-tu-key node index.js
//   3. En el proyecto principal, .env.local: VITE_AI_PROXY_URL=http://localhost:8787/ai
//
// El frontend (aiService.ts) le manda { prompt } a este servidor, y este
// servidor es el único que conoce la key real y habla con OpenAI.

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.error('Falta la variable de entorno OPENAI_API_KEY. Corré:');
  console.error('  OPENAI_API_KEY=sk-tu-key node index.js');
  process.exit(1);
}

const app = express();
app.use(cors()); // en producción, restringí esto al origen real de tu frontend
app.use(express.json());

app.post('/ai', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Falta "prompt" (string) en el body' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('OpenAI error:', response.status, detail);
      return res.status(502).json({ error: 'Error llamando a OpenAI' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    res.json({ content });
  } catch (err) {
    console.error('Error en el proxy:', err);
    res.status(500).json({ error: 'Error interno del proxy' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy de IA escuchando en http://localhost:${PORT}/ai`);
});
