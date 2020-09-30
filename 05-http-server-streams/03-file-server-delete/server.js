const url = require('url');
const http = require('http');
const path = require('path');
const {unlink} = require('fs');

const server = new http.Server();

const handleDelete = (req, res, filename) => {
  unlink(filename, (err) => {
    if (err) {
      const isNotFound = err.code === 'ENOENT';
      const errCode = isNotFound ? 404 : 500;
      res.statusCode = errCode;
      res.end(http.STATUS_CODES[errCode]);
    }

    res.end('OK');
  });
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.split('/').length !== 1) {
    res.statusCode = 400;
    res.end(http.STATUS_CODES[400]);
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      handleDelete(req, res, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
