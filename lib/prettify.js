var numeral = require('numeral');
var aliases = require('../assets/aliases.json');

var KEY_BYTE = [
  'Size', 'Gzipped Size', 'Data URI Size'
];
var KEY_PERCENT = [
  'Simplicity', 'Ratio of Data URI Size'
];

/**
 * Prettify StyleStats data.
 * @param {object} [result] StyleStats parse data. Required.
 * @return {array} prettified data.
 */
function prettify(result) {
  var arr = [];

  Object.keys(result).forEach(function (property) {
    var metric = {};
    var key = aliases[property];
    var value = result[property];

    metric[key] = value;

    if (key === 'Published' || key === 'Paths') {
      return true;
    }
    if (key === 'Properties Count') {
      var array = [];
      value.forEach(function (item) {
        array.push([item.property, item.count]);
      });
      metric[key] = array.join('\n').replace(/\,/g, ': ');
    }
    if (KEY_BYTE.indexOf(key) !== -1) {
      metric[key] = numeral(value).format('0.0b').replace(/\.0B/, 'B').replace(/0\.0/, '0');
    }
    if (KEY_PERCENT.indexOf(key) !== -1) {
      metric[key] = numeral(value).format('0.0%');
    }
    if (Array.isArray(metric[key])) {
      metric[key] = metric[key].join('\n');
      if (metric[key] === '') {
        metric[key] = 'N/A';
      }
    }
    arr.push(metric);
  });

  return arr;
}

module.exports = prettify;
