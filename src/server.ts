import http from 'node:http';

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});