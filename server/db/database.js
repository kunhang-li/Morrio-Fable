require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(process.env.DB_PATH || './server/db/fable.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function initDb() {
  const db = getDb();
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  const columns = db.prepare('PRAGMA table_info(stories)').all();

  if (!columns.some(column => column.name === 'draft_content')) {
    db.exec('ALTER TABLE stories ADD COLUMN draft_content TEXT');
  }

  return db;
}

module.exports = { getDb, initDb };