const express = require('express');
const router = express.Router();
const openai = require('../utils/openai');

router.post('/questions', async (req, res) => {
  const { role, company } = req.body;
  if (!role) return res.status(400).json({ message: 'role is required' });
  try {
    const prompt = `You are an interview coach. Generate 10 short interview questions for a ${role} role${company ? ` at ${company}` : ''}. 

Rules:
- Each question must be ONE sentence only
- Maximum 15 words per question  
- 4 technical, 4 behavioral
- No explanations, no sub-points
- Just the question, nothing else

Format: Return only a numbered list 1-10.`;
    const result = await openai.generate(prompt);
    res.json({ questions: result });
  } catch (err) {
    console.error('AI generation failed:', err.message || err);
    res.status(500).json({ message: 'AI generation failed', error: err.message || 'Unknown error' });
  }
});

module.exports = router;
