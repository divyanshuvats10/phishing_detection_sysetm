const http = require('http');
const app = require('../src/app');

function run() {
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const payload = JSON.stringify({ inputType: 'url', raw: 'http://example.com/login' });

    const options = {
      hostname: '127.0.0.1',
      port,
      path: '/api/scan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Test response:', JSON.stringify(json, null, 2));
          if (json && json.ok) {
            console.log('Node test passed');
            process.exit(0);
          } else {
            console.error('Node test failed: unexpected response');
            process.exit(2);
          }
        } catch (e) {
          console.error('Node test failed: could not parse response', e.message);
          process.exit(2);
        } finally {
          server.close();
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      server.close();
      process.exit(2);
    });

    req.write(payload);
    req.end();
  });
}

run();
