const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

router.get('/', (req, res) => {
  const db = getDb();
  const prompts = db.prepare('SELECT * FROM prompts ORDER BY order_index ASC').all();
  res.json(prompts);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
  res.json(prompt);
});

module.exports = router;