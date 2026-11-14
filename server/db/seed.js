require('dotenv').config();
const { initDb } = require('./database');

const db = initDb();

db.exec(`
  DELETE FROM media_items;
  DELETE FROM stories;
  DELETE FROM prompts;
  DELETE FROM users;
`);

const insertUser = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
const u1 = insertUser.run('Alice Demo', 'alice@example.com');
const u2 = insertUser.run('Bob Demo', 'bob@example.com');

const insertPrompt = db.prepare('INSERT INTO prompts (text, order_index) VALUES (?, ?)');
insertPrompt.run('What is your earliest memory?', 1);
insertPrompt.run('Describe a moment that changed you.', 2);
insertPrompt.run('Who has influenced you most?', 3);
insertPrompt.run('What does home mean to you?', 4);

const insertStory = db.prepare('INSERT INTO stories (user_id, title, content, prompt_id) VALUES (?, ?, ?, ?)');
const s1 = insertStory.run(u1.lastInsertRowid, 'My First Memory', 'It was a sunny afternoon...', 1);
insertStory.run(u2.lastInsertRowid, 'A Turning Point', 'Everything shifted when...', 2);

const insertMedia = db.prepare('INSERT INTO media_items (story_id, url, media_type) VALUES (?, ?, ?)');
insertMedia.run(s1.lastInsertRowid, '/uploads/sample1.jpg', 'image');
insertMedia.run(s1.lastInsertRowid, '/uploads/sample2.jpg', 'image');

console.log('Database seeded successfully.');
db.close();