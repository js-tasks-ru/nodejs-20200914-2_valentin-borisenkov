const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._stringBuffer = '';
    this._splitMatcher = os.EOL;
  }

  saveBufferAndPushMatchedStrings(chunk) {
    const str = chunk.toString();
    this._stringBuffer +=str;
    this._stringBuffer = this._stringBuffer
        .split(this._splitMatcher)
        .filter( (s, i, arr) => {
          if (i !== arr.length -1) {
            this.push(s);
            return false;
          } else {
            return true;
          }
        })[0];
  }

  _transform(chunk, encoding, callback) {
    this.saveBufferAndPushMatchedStrings(chunk);
    callback();
  }

  _flush(callback) {
    if (this._stringBuffer) {
      this.push(this._stringBuffer);
    }
    callback();
  }
}

module.exports = LineSplitStream;
