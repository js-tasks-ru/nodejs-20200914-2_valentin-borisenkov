const {Transform} = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends Transform {
  constructor(options) {
    super(options);
    this._streamSize = 0;
    this._streamSizeLimit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    this._streamSize += chunk.length;
    const exceedsLimit = this._streamSize >= this._streamSizeLimit;
    callback( exceedsLimit && new LimitExceededError(), chunk);
  }
}

module.exports = LimitSizeStream;
