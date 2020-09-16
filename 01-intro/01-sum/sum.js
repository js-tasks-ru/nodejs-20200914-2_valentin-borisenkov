function sum(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a+b;
  } else throw new TypeError('sum accepts args with number type only');
}

module.exports = sum;
