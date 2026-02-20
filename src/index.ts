import http from 'node:http';
import sqlite3 from 'sqlite3';

// Create a local server to receive data from
const server = http.createServer();

// Listen to the request event
server.on('request', (request, res) => {
   res.writeHead(200, { 'Content-Type': 'application/json' });
   res.end(JSON.stringify({
     data: 'Hello World!',
   }));
});

const PORT = process.env.PORT || 8000;

// Local database
const DB_FILE_NAME = "./database.db"
const db = new sqlite3.Database(DB_FILE_NAME);

const shutdown = (signal: string) => {
  console.log(`${signal} signal received. Closing resources.\n`);

  server.close();
  console.log('Http server closed.');

  db.close();
  console.log("SQLite DB closed.")

  process.exit(0);
};

process.on('SIGTERM', () => { shutdown("SIGTERM") });
process.on("SIGINT", () => { shutdown("SIGINT") });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});