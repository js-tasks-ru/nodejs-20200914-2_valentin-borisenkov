const url = require('url');
const http = require('http');
const path = require('path');
const {createReadStream} = require('fs');

const server = new http.Server();

const trySendFileContent = (req, res, filepath) => {
  const fileStream = createReadStream(filepath, {flags: 'r'});

  // QUESTION : req.on('aborted') has never worked here, maybe 'cause I'm using node 12 yet?
  // - При обрыве соединения необходимо завершить работу стрима.
  req.on('aborted', () => {
    if (req.aborted) {
      fileStream.destroy();
    }
    // QUESTION - do I need this?
    res.end();
  });

  // helper console log to identify stream is closed on connection abort
  // (i.e. slow network simulation in Chrome and then stop the page loading)
  fileStream.on('close', () => {
    console.log('stream closed');
  });

  res.statusCode = 200;

  fileStream.on('error', (e) => {
    res.statusCode = 404;
    res.end(http.STATUS_CODES[404]);
  }).pipe(res);
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  console.log(pathname);

  if (pathname.split('/').length !== 1) {
    res.statusCode = 400;
    res.end(http.STATUS_CODES[400]);
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      trySendFileContent(req, res, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end(http.STATUS_CODES[501]);
  }
});

module.exports = server;
