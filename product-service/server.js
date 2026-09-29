// product-service: returns a hardcoded list of products.
// Uses only Node.js built-in modules (no npm dependencies).
const http = require('http');

const PORT = 3000;

// Hardcoded product catalog for this lab.
const PRODUCTS = [
  { id: 1, name: 'Laptop' },
  { id: 2, name: 'Phone' },
];

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  // servedBy shows which pod/container answered the request, so
  // students can observe load balancing across replicas.
  const servedBy = process.env.HOSTNAME;

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ servedBy, products: PRODUCTS }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`product-service listening on port ${PORT}`);
});
