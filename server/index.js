require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const storiesRouter = require('./routes/stories');
const promptsRouter = require('./routes/prompts');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/stories', storiesRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Fable API server running on port ${PORT}`);
  });
}

module.exports = app;