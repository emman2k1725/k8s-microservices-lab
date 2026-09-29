// order-service: builds a fake order using data fetched from product-service.
// Uses only Node.js built-ins - fetch() is global in Node 20, no npm needed.
const http = require('http');

const PORT = 3000;

// URL of product-service, injected via env var (e.g. from a k8s ConfigMap).
const PRODUCT_URL = process.env.PRODUCT_URL;

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  const servedBy = process.env.HOSTNAME;

  if (req.method === 'GET' && req.url === '/') {
    try {
      const productRes = await fetch(PRODUCT_URL);
      if (!productRes.ok) {
        throw new Error(`product-service responded with ${productRes.status}`);
      }
      const data = await productRes.json();
      const firstProduct = data.products[0];

      res.writeHead(200);
      res.end(JSON.stringify({
        servedBy,
        order: { id: 101, item: firstProduct },
      }));
    } catch (err) {
      // product-service is down or unreachable - fail loudly with a 502.
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'could not reach product-service' }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`order-service listening on port ${PORT}`);
});
