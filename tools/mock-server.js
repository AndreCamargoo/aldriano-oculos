// Servidor de teste (sem dependências): simula a API do notebook enquanto o
// serviço real (Grupos 4/7/8) não existe. Uso: node tools/mock-server.js [porta]
const http = require('http');
const port = Number(process.argv[2] || 8000);

http
  .createServer((req, res) => {
    const send = (code, body) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (req.method === 'GET' && req.url === '/health') return send(200, { status: 'ok' });
    if (req.method === 'POST' && req.url === '/describe') {
      let bytes = 0;
      req.on('data', (c) => (bytes += c.length));
      req.on('end', () => {
        console.log(`POST /describe — ${bytes} bytes (${req.headers['content-type']})`);
        setTimeout(() => send(200, { description: `Imagem recebida com ${bytes} bytes (servidor de teste).` }), 500);
      });
      return;
    }
    send(404, { error: 'not found' });
  })
  .listen(port, '0.0.0.0', () => console.log(`Mock API em http://0.0.0.0:${port}`));
