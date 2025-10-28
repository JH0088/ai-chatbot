export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' });

    const model = 'meta-llama/llama-3.1-8b-instruct:free';
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_PUBLIC_URL || 'https://vercel.app',
        'X-Title': 'My Chatbot'
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(resp.status).json({ error: err });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '抱歉，我现在有些忙，请稍后再试～';
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
