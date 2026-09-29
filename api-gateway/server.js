// api-gateway: single entry point that proxies requests to the backend
// services. Uses only Node.js built-ins - fetch() is global in Node 20.
const http = require('http');

const PORT = 3000;

// URLs of the backend services, injected via env vars.
const PRODUCT_URL = process.env.PRODUCT_URL;
const ORDER_URL = process.env.ORDER_URL;

// Fetches an upstream URL and relays its JSON body, or responds 502 on failure.
async function proxy(upstreamUrl, res) {
  try {
    const upstreamRes = await fetch(upstreamUrl);
    if (!upstreamRes.ok) {
      throw new Error(`upstream responded with ${upstreamRes.status}`);
    }
    const data = await upstreamRes.json();
    res.writeHead(200);
    res.end(JSON.stringify(data));
  } catch (err) {
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'upstream service unreachable' }));
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  const servedBy = process.env.HOSTNAME;

  if (req.method === 'GET' && req.url === '/products') {
    await proxy(PRODUCT_URL, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/orders') {
    await proxy(ORDER_URL, res);
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found', servedBy }));
});

server.listen(PORT, () => {
  console.log(`api-gateway listening on port ${PORT}`);
});
