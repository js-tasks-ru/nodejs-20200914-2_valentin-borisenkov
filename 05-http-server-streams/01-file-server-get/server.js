const url = require('url');
const http = require('http');
const path = require('path');
const {createReadStream} = require('fs');

const server = new http.Server();

const trySendFileContent = (req, res, filepath) => {
  const fileStream = createReadStream(filepath, {flags: 'r'});

  // QUESTION : req.on('aborted') has never worked here, maybe 'cause I'm using node 12 yet?
  // - При обрыве соединения необходимо завершить работу стрима.
  req.on('close', () => {
    if (req.aborted) {
      fileStream.destroy();
    }
    // QUESTION - do I need this?
    res.end();
  });

  // helper console log to identify stream is closed on connection abort
  // (i.e. slow network simulation in Chrome and then stop the page loading)
  fileStream.on('close', () => {
    // console.log('stream closed');
  });

  res.statusCode = 200;

  fileStream.on('error', (e) => {
    res.statusCode = 404;
    res.end(http.STATUS_CODES[404]);
  }).pipe(res);
};

const isSafePath = (pathname, rootDir) => {
  let isErrorDecodingPath = false;

  try {
    pathnameDecoded = decodeURIComponent(pathname);
  } catch (e) {
    console.log(e);
    isErrorDecodingPath = true;
  }

  if (isErrorDecodingPath || pathname.indexOf('\0') !==-1 || pathname === rootDir) return false;

  return pathname.indexOf(rootDir) === 0;
};

server.on('request', (req, res) => {
  const pathname = path.normalize(url.parse(req.url).pathname.slice(1));
  const rootDir = path.join(__dirname, 'files');
  const filepath = path.normalize(path.join(rootDir, pathname));

  if (!isSafePath(filepath, rootDir) || pathname.split('/').length !== 1) {
    res.statusCode = 400;
    res.end(http.STATUS_CODES[400]);
    return;
  }


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
