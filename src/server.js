const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);
const dbPath = path.resolve(process.env.DB_PATH || './data/ips.sqlite');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

// Only enable this for a deployment with a known, trusted proxy configuration.
app.set('trust proxy', process.env.TRUST_PROXY || false);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS ip_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    requested_at TEXT NOT NULL
  )
`);
const saveRequest = db.prepare(
  'INSERT INTO ip_requests (ip, requested_at) VALUES (?, ?)'
);

app.get('/api/ip', (req, res, next) => {
  const ip = req.ip;
  if (!ip) {
    return res.status(400).json({ error: 'Could not determine client IP address' });
  }

  try {
    saveRequest.run(ip, new Date().toISOString());
    return res.json({ ip });
  } catch (error) {
    return next(error);
  }
});

app.use((err, req, res, next) => {
  console.error('Request failed:', err.message);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`IP lookup API listening on port ${port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
