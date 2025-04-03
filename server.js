const { createServer } = require('node:http');

const hostname = '127.0.0.1'; //localhost 
const port = 3000;

const server = createServer((req, res) => {
    // Hàm tạo server
    // req là request, res là response
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Nguyễn Thanh Khai');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
