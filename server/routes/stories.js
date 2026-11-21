const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const auth = require('../middleware/auth');
const path = require('path');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

router.get('/', auth, (req, res) => {
  const db = getDb();
  const stories = db.prepare('SELECT * FROM stories WHERE user_id = ?').all(req.userId);
  res.json(stories);
});

router.get('/:id', auth, (req, res) => {
  const db = getDb();
  const story = db.prepare('SELECT * FROM stories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json(story);
});

router.post('/', auth, (req, res) => {
  const { title, content, prompt_id } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO stories (user_id, title, content, prompt_id) VALUES (?, ?, ?, ?)'
    ).run(req.userId, title.trim(), content || '', prompt_id || null);
    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save story' });
  }
});

router.put('/:id', auth, (req, res) => {
  const { title, content } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM stories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Story not found' });
  db.prepare('UPDATE stories SET title = ?, content = ? WHERE id = ?')
    .run(title || existing.title, content || existing.content, req.params.id);
  const updated = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  res.json(updated);
});



router.patch('/:id/draft', auth, (req, res) => {
  const { draft_content, title } = req.body;

  if (typeof draft_content !== 'string') {
    return res.status(400).json({
      error: 'draft_content must be a string'
    });
  }

  if (title !== undefined &&
      (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({
      error: 'Title must be a non-empty string'
    });
  }

  try {
    const db = getDb();

    const existing = db.prepare(
      'SELECT * FROM stories WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);

    if (!existing) {
      return res.status(404).json({
        error: 'Story not found'
      });
    }

    // Persist the draft and optionally update the story title.
    db.prepare(`
      UPDATE stories
      SET draft_content = ?, title = ?
      WHERE id = ? AND user_id = ?
    `).run(
      draft_content,
      title === undefined ? existing.title : title.trim(),
      req.params.id,
      req.userId
    );

    const updated = db.prepare(
      'SELECT * FROM stories WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);

    return res.status(200).json(updated);
  } catch (err) {
    console.error('Failed to save draft:', err);

    return res.status(500).json({
      error: 'Failed to save draft'
    });
  }
});



router.get('/:id/media', auth, (req, res) => {
  const db = getDb();
  const story = db.prepare('SELECT id FROM stories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json(db.prepare('SELECT * FROM media_items WHERE story_id = ? ORDER BY uploaded_at').all(req.params.id));
});

router.post('/:id/media', auth, upload.single('file'), (req, res) => {
  const db = getDb();
  const story = db.prepare('SELECT id FROM stories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  if (!req.file) return res.status(400).json({ error: 'A file is required' });
  const result = db.prepare('INSERT INTO media_items (story_id, url, media_type) VALUES (?, ?, ?)')
    .run(req.params.id, `/uploads/${req.file.filename}`, req.body.media_type || 'image');
  res.status(201).json(db.prepare('SELECT * FROM media_items WHERE id = ?').get(result.lastInsertRowid));
});

module.exports = router;