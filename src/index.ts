import app from './app';
import sqlite3 from 'sqlite3';

const PORT = Number(process.env.PORT) || 8000;

// Local database (kept for existing shutdown behavior)
const DB_FILE_NAME = './database.db';
const db = new sqlite3.Database(DB_FILE_NAME);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} signal received. Closing resources.\n`);

  server.close(() => {
    console.log('Http server closed.');
  });

  db.close();
  console.log('SQLite DB closed.');

  process.exit(0);
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
