const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', console.error);

req.write(JSON.stringify({
  type: 'blob.generate-client-token',
  payload: { pathname: 'test.png', clientPayload: null, multipart: false }
}));
req.end();
