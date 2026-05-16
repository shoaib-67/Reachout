const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend-static');
const port = process.env.PORT || 5173;

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(root, reqPath);

  // Prevent directory traversal
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
  };

  const contentType = map[ext] || 'application/octet-stream';
  sendFile(res, filePath, contentType);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static server running at http://localhost:${port}/ serving ${root}`);
});
