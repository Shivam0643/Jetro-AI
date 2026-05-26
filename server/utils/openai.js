const axios = require('axios');

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not configured. Set it in .env or the environment.');
}

const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
const model = 'gpt-4o-mini';

const generate = async (prompt) => {
  try {
    const response = await axios.post(
      endpoint,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.choices?.[0]?.message?.content || '';
    return text
      .split(/\r?\n+/)
      .map((line) => line.replace(/^\d+\.?\s*/, '').trim())
      .filter(Boolean);
  } catch (err) {
    console.error('OpenRouter request failed:', err.response?.data || err.message || err);
    if (err.response?.status === 401) {
      throw new Error('Unauthorized: OPENAI_API_KEY is invalid for OpenRouter.');
    }
    throw err;
  }
};

module.exports = { generate };