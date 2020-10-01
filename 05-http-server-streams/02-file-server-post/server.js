const url = require('url');
const http = require('http');
const path = require('path');
const {createWriteStream, unlink} = require('fs');
const {finished} = require('stream');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

const tryRemoveFileAsync = (filepath) => {
  unlink(filepath, (err) => {
    if (err) {
      // console.log(err);
    }
  });
};

const handlePostRequest = (req, res, filepath) => {
  const writeableStream = createWriteStream(filepath, {
    flags: 'ax',
  });

  const limitSizeStream = new LimitSizeStream({limit: 1024*1024});

  req.pipe(limitSizeStream).pipe(writeableStream);

  finished(writeableStream, (err) => {
    if (err) {
      if (!res.headersSent) {
        const errCode = err.code === 'EEXIST' ? 409 : 500;
        res.statusCode = errCode;
        res.end(http.STATUS_CODES[errCode]);
      }
    } else {
      res.statusCode = 201;
      res.end(http.STATUS_CODES[201]);
    }
  });

  finished(limitSizeStream, (err) => {
    if (err) {
      writeableStream.destroy();
      res.statusCode = 413;
      res.end(http.STATUS_CODES[413]);
      tryRemoveFileAsync(filepath);
    }
  });

  req.on('close', () => {
    if (req.aborted) {
      writeableStream.destroy();
      tryRemoveFileAsync(filepath);
    }

    res.end();
  });
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.split('/').length !== 1) {
    res.statusCode = 400;
    res.end(http.STATUS_CODES[400]);
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      handlePostRequest(req, res, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
